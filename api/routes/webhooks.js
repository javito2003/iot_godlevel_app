const express = require('express');
const router = express.Router()
const axios = require('axios');
const colors = require('colors')


//POST request
router.post('/saver-webhook', async (req, res) => {
    const data = req.body
    console.log(data);

    return res.json({
        message: 'lol'
    })

})

module.exports = router