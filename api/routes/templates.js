const express = require("express");
const router = express.Router();

//MIDDLEWARE
const checkAuth  = require("../middlewares/authentication");

//IMPORT MODELS
const Template = require("../models/template");

//POST request - create a template
router.post("/template", checkAuth, async(req, res) => {
  try {
    const userId = req.userData._id;
    var newTemplate = req.body.template;
    
    newTemplate.userId = userId;
    newTemplate.createdTime = Date.now();
    const r = await Template.create(newTemplate)

    const response = {
      status: "success"
    };

    return res.json(response);
  } catch (error) {
    console.log(error);
    const toSend = {
        status: 'error',
        error: error.message
    }
    return res.status(500).json(toSend)
  }
});

//GET request - get template
router.get('/templates', checkAuth, async (req, res) => {
  try {
    
    const userId = req.userData._id
    const template = await Template.find({userId: userId})

    const toSend = {
      status: 'success',
      data: template
    }

    return res.json(toSend)
    
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
})

//DELETE request - delete template
router.delete('/template', checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id
    const templateId = req.query.templateId

    const r = await Template.deleteOne({userId: userId, _id: templateId})

    const toSend = {
      status: "success"
    }

    return res.json(toSend)

  } catch (error) {
    let response = {
      status: "error"
    }

    return res.status(500).json(response)
  }
})

module.exports = router