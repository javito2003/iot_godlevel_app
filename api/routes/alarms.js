const express = require("express");
const router = express.Router();
const axios = require("axios");
const colors = require("colors");

//MODELS IMPORT
const AlarmRule = require("../models/emqx_alarm_rule");

//MIDDLEWARES
const checkAuth = require("../middlewares/authentication");

const auth = {
  auth: {
    username: "admin",
    password: "emqxpass"
  }
};

/* API ENDPOINTS */
//create alarm-rules
router.post("/alarm-rule", checkAuth, async (req, res) => {
  var newRule = req.body.newRule;
  newRule.userId = req.userData._id;

  var response = await createAlarmRule(newRule);

  if (response) {
    const toSend = {
      status: "success"
    };
    return res.json(toSend);
  } else {
    const toSend = {
      status: "error"
    };
    return res.status(500).json(toSend);
  }
});

//edit alarm-rule
router.put('/alarm-rule', checkAuth, async (req, res) => {
  var rule = req.body.rule
  var response = await updateAlarmRuleStatus(rule.emqxRuleId, rule.status)
  if (response) {
    const toSend = {
      status: 'success',
    }
    return res.json(toSend)
  }else{
    const toSend = {
      status: 'error'
    }
    return res.json(toSend)
  }
})

//delete alarm rule
router.delete('/alarm-rule',checkAuth, async(req,res) => {
  var emqxRuleId = req.query.emqxRuleId
  var r = await deleteAlarmRule(emqxRuleId)

  if (r) {
    const toSend = {
      status: 'success'
    }
    return res.json(toSend)
  }
  else{
    const toSend = {
      status: 'error'
    }
    return res.json(toSend)
  }
})




/* FUNCTIONS */

//create alarm
async function createAlarmRule(newAlarm) {
  let url = "http://localhost:8085/api/v4/rules";
  const topic =
    newAlarm.userId + "/" + newAlarm.dId + "/" + newAlarm.variable + "/sdata";
  const rawsql =
    'SELECT username, topic, payload FROM "' +
    topic +
    '" WHERE payload.value ' +
    newAlarm.condition +
    " " +
    newAlarm.value +
    " AND is_not_null(payload.value)";

  var newRule = {
    rawsql: rawsql,
    actions: [
      {
        name: "data_to_webserver",
        params: {
          $resource: global.alarmResource.id,
          payload_tmpl:
            '{"userId":"' +
            newAlarm.userId +
            '","payload":${payload}, "topic": "${topic}"}'
        }
      }
    ],
    description: "ALARM-RULE",
    enabled: newAlarm.status
  };

  //save rule in emqx
  const res = await axios.post(url, newRule, auth);
  let emqxRuleId = res.data.data.id
  console.log(res.data.data);

  if (res.data.data && res.status === 200) {
    //save rule in mongodb
    const mongoRule = await AlarmRule.create({
      userId: newAlarm.userId,
      dId: newAlarm.dId,
      emqxRuleId: emqxRuleId,
      status: newAlarm.status,
      variable: newAlarm.variable,
      variableFullName: newAlarm.variableFullName,
      value: newAlarm.value,
      condition: newAlarm.condition,
      triggerTime: newAlarm.triggerTime,
      createdTime: Date.now()
    });

    const url = "http://localhost:8085/api/v4/rules/" + mongoRule.emqxRuleId;

    const payload_tmpl = '{"userId":"' + newAlarm.userId + '","dId":"'+newAlarm.dId + '","payload":${payload}, "topic":"${topic}","emqxRuleId":"' + mongoRule.emqxRuleId + '","value":'+ newAlarm.value + ',"condition":"'+newAlarm.condition + '","variable":"' + newAlarm.variable + '","variableFullName":"' + newAlarm.variableFullName + '","triggerTime":' + newAlarm.triggerTime + '}';
  
    newRule.actions[0].params.payload_tmpl = payload_tmpl

    const res = await axios.put(url, newRule, auth);

    console.log("New Alarm rule created...".green);

    return true
}
}

//update alarm status
async function updateAlarmRuleStatus(emqxRuleId, status) {
  const url = "http://localhost:8085/api/v4/rules/" + emqxRuleId
  const newRule = {
    enabled: status
  }
  const res = await axios.put(url, newRule, auth);
  if (res.data.data && res.status === 200) {
    await AlarmRule.updateOne({emqxRuleId: emqxRuleId}, {status: status})
    console.log("Saver rule status updated...".green);
    return true
  }else{
    return "error"
  }
}

//delete alarm
async function deleteAlarmRule(emqxRuleId){
  try {
    const url = "http://localhost:8085/api/v4/rules/" + emqxRuleId
    const emqxRule = await axios.delete(url, auth)
    const deleted = await AlarmRule.deleteOne({emqxRuleId: emqxRuleId})
    return "success"
  } catch (error) {
    console.log(error);
    return "error"
  }
}

module.exports = router;
