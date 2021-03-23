const express = require('express')
const router = express.Router()

//MIDDLEWARE
const checkAuth = require('../middlewares/authentication')

//IMPORT MODEL
const Device = require('../models/device.js')




//GET request - get devices
router.get('/devices',checkAuth, async (req, res) => {
    console.log(req.userData);
    try {
        return res.json({
            success: true,
            data: 'Hello world!'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
})


//POST request - create a new device
router.post('/new-device', async (req, res) => {

})


//DELETE request - delete device
router.delete('/device', async (req, res) => {

})


//PUT request - Update device
router.put('/device', async (req, res) => {

})

module.exports = router