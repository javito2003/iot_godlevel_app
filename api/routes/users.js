//LIBRARIES IMPORT
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//IMPORT MODEL USER
const User = require("../models/user");
const EmqxAuthRule = require("../models/emqx_auth")

// AUTH
const checkAuth = require("../middlewares/authentication");


//POST -> req.body
//GET -> req.query

//POST request - create user
router.post("/register", async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const encrypedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      name: name,
      email: email,
      password: encrypedPassword
    };

    const userDB = await User.create(newUser);

    return res.json({
      success: true,
      message: "User created"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

//POST request - login user
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  var userDB = await User.findOne({ email: email });
  try {
    //we check if the user exists
    if (!userDB) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    //We check the password
    if (bcrypt.compareSync(password, userDB.password)) {
      //DELETE PASSWORD FROM USER
      userDB.set("password", undefined, { strict: false });
      userDB.set('email', undefined, { strict: false });

      const token = jwt.sign({ userData: userDB }, "SecurePasswordHere", {
        expiresIn: 60 * 60 * 24 * 30
      });

      const toSend = {
        success: true,
        token: token,
        userData: userDB
      };

      return res.json(toSend);
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials"
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});


//GET MQTT  WEB CREDENTIALS
router.post("/getmqttcredentials",checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id
    const credentials = await getWebUserMqttCredentials(userId)
    let toSend = {
      status: "success",
      username: credentials.username,
      password: credentials.password
    }

    res.json(toSend)

    setTimeout(() =>{
      getWebUserMqttCredentials(userId)
    }, 8000)
    return

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
    })
  }
});

//GET MQTT CREDENTIALS FOR RECONNECTION
router.post('/getmqttcredentialsforreconnection', checkAuth, async (req, res) => {
  const userId = req.userData._id;
  const credentials = await getWebUserMqttCredentialsForReconnection(userId)

  const toSend = {
    status: "success",
    username: credentials.username,
    password: credentials.password
  }
  console.log(toSend);
  res.json(toSend)

  setTimeout(() => {
    getWebUserMqttCredentials(userId)
  },15000 )
})





/* FUNCTIONS */
//mqtt credential types: "user","device","superuser"
async function getWebUserMqttCredentials(userId) {
  try {
    var rule = await EmqxAuthRule.find({type: "user", userId: userId})
  if(rule.length == 0){
    const newRule = {
      userId: userId,
      username: makeid(10),
      password: makeid(10),
      publish: [userId + "/#"], 
      suscribe: [userId + "/#"],
      type: "user",
      time: Date.now(),
      updatedTime: Date.now()
    }

    const result = await EmqxAuthRule.create(newRule)
    const toSend = {
      username: result.username,
      password: result.password
    }

    return toSend
  }
  const newUserName = makeid(10);
  const newPassword = makeid(10);

  const result = await EmqxAuthRule.updateOne({type: 'user', userId: userId},{$set: {username: newUserName, password: newPassword, updatedTime: Date.now()}})

  if(result.n == 1 && result.ok == 1){
    return {
      username: newUserName,
      password: newPassword,
    }
  }else{
    return false
  }
  } catch (error) {
    console.log(error);
    return false
  }
  

}

async function getWebUserMqttCredentialsForReconnection(userId){
  try {
    const rule = await EmqxAuthRule.find({type: "user", userId: userId})
    if(rule.length == 1){
      const toReturn = {
        username: rule[0].username,
        password: rule[0].password,
      }
      return toReturn
    } 
  } catch (error) {
    console.log(error);
    console.log('ERROR TO GET CREDENTIALS FOR RECONNECTION');
    return false;
  }
}


function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return result;
}

module.exports = router;
