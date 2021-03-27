const express = require('express');
const router = express.Router()
const axios = require('axios');
const colors = require('colors')

//IMPORT MODEL
const Data = require('../models/data')
const Device = require('../models/device')

/* ROUTES */
//POST request
router.post('/saver-webhook', async (req, res) => {
    if (req.headers.token != "12345") {
        res.sendStatus(404)
        return
    }
    const data = req.body

    const splittedTopic = data.topic.split('/')
    const dId = splittedTopic[1]
    const variable = splittedTopic[2]

    console.log(dId);

    var result = await Device.find({dId:dId, userId: data.userId})

    if (result.length === 1) {
        Data.create({
            userId: data.userId,
            dId: dId,
            variable: variable,
            value: data.payload.value,
            time: Date.now()
        })
        console.log('Data created successfully');
    }
    res.sendStatus(200)
    console.log(data);

})

router.post('/alarm-webhook', async (req, res) => {
    if (req.headers.token != "12345") {
        res.sendStatus(404)
        return
    }
    const data = req.body

    const splittedTopic = data.topic.split('/')
    const dId = splittedTopic[1]
    const variable = splittedTopic[2]

    console.log(dId);

    var result = await Device.find({dId:dId, userId: data.userId})

    if (result.length === 1) {
        Data.create({
            userId: data.userId,
            dId: dId,
            variable: variable,
            value: data.payload.value,
            time: Date.now()
        })
        console.log('Data created successfully');
    }
    res.sendStatus(200)
    console.log(data);

})

module.exports = router