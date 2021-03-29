const express = require("express");
const router = express.Router();
const axios = require("axios");
const colors = require("colors");
var mqtt = require("mqtt");
const checkAuth = require("../middlewares/authentication");

//IMPORT MODEL
const Data = require("../models/data");
const Device = require("../models/device");
const AlarmRule = require("../models/emqx_alarm_rule");
const Notification = require("../models/notification.js");

var client;

/* ROUTES */
//POST request
router.post("/saver-webhook", async (req, res) => {
  if (req.headers.token != "12345") {
    res.sendStatus(404);
    return;
  }
  const data = req.body;

  const splittedTopic = data.topic.split("/");
  const dId = splittedTopic[1];
  const variable = splittedTopic[2];

  console.log(dId);

  var result = await Device.find({ dId: dId, userId: data.userId });

  if (result.length === 1) {
    Data.create({
      userId: data.userId,
      dId: dId,
      variable: variable,
      value: data.payload.value,
      time: Date.now()
    });
    console.log("Data created successfully");
  }
  res.sendStatus(200);
  console.log(data);
});

router.post("/alarm-webhook", async (req, res) => {
  try {
    if (req.headers.token != "12345") {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(200);
    const incomingAlarm = req.body;

    updateAlarmCounter(incomingAlarm.emqxRuleId);

    const lastNotif = await Notification.find({
      dId: incomingAlarm.dId,
      emqxRuleId: incomingAlarm.emqxRuleId
    })
      .sort({ time: -1 })
      .limit(1);
    if (lastNotif == 0) {
      console.log("FIRST TIME ALARM");
      saveNotification(incomingAlarm);
      sendMqttNotif(incomingAlarm);
    } else {
      const lastNotifToNowMins = (Date.now() - lastNotif[0].time) / 1000 / 60;

      if (lastNotifToNowMins > incomingAlarm.triggerTime) {
        console.log("TRIGGERED");
        saveNotification(incomingAlarm);
        sendMqttNotif(incomingAlarm);
      }
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
});

//GET NOTIFICATIONS
router.get("/notifications", checkAuth, async function(req, res) {
  try {
    const userId = req.userData._id;
    const notifications = await getNotifications(userId);

    const toSend = {
      status: "success",
      data: notifications
    };
    return res.json(toSend);
  } catch (error) {
    console.log(error.message);
    console.log("ERROR TO GET NOTIFACTIONS");
    return res.status(500).json({
      status: "error"
    });
  }
});

//UPDATE NOTIFICATIONS (readed status)
router.put("/notifications", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    const notificationId = req.body.notifId;
    let res1 = await Notification.updateOne(
      { userId: userId, _id: notificationId },
      { readed: true }
    );
    const toSend = {
      status: "success"
    };
    return res.json(toSend);
  } catch (error) {
    console.log("ERROR UPDATING NOTIFICATION STAUTS");
    console.log(error);
    return res.status(500).json({
      message: "Error"
    });
  }
});

/* FUNCTIONS */
function saveNotification(incomingAlarm) {
  var newNotif = incomingAlarm;
  newNotif.time = Date.now();
  newNotif.readed = false;
  Notification.create(newNotif);
}

async function updateAlarmCounter(emqxRuleId) {
  try {
    await AlarmRule.updateOne(
      { emqxRuleId: emqxRuleId },
      { $inc: { counter: 1 } }
    );
  } catch (error) {
    console.log(error);
    return false;
  }
}

function startMqttClient() {
  const options = {
    port: 1883,
    host: "localhost",
    clientId:
      "webhook_superuser" + Math.round(Math.random() * (0 - 10000) * -1),
    username: "superuser",
    password: "superuser",
    keepalive: 60,
    reconnectPeriod: 5000,
    protocolId: "MQIsdp",
    protocolVersion: 3,
    clean: true,
    encoding: "utf8"
  };

  client = mqtt.connect("mqtt://" + "localhost", options);

  client.on("connect", function() {
    console.log("MQTT CONNECTION -> SUCCESS".bgBlue);
  });
  client.on("reconnect", function(error) {
    console.log("RECONNECTING MQTT");
    console.log(error);
  });
  client.on("error", error => {
    console.log("ERROR CONNECTION TO MQTT".bgRed);
    console.log(error);
  });
}

function sendMqttNotif(notif) {
  const topic = notif.userId + "/dummy-did/dummy-var/notif";
  const msg =
    "The rule: when the " +
    notif.variableFullName +
    " is " +
    notif.condition +
    " than " +
    notif.value;
  client.publish(topic, msg);
}

async function getNotifications(userId) {
  try {
    const res = await Notification.find({ userId: userId, readed: false });
    return res;
  } catch (error) {
    console.log(error);
    return false;
  }
}

setTimeout(() => {
  startMqttClient();
}, 3000);

module.exports = router;
