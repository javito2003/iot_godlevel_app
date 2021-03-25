//LIBRARIES IMPORT
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//IMPORT MODEL USER
const User = require("../models/user");

// AUTH

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

module.exports = router;
