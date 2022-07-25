const express = require('express')
const router = express.Router()
const userController = require("../controller/userController")
const middleware=require("../Middleware/commonMid")


router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile',middleware.authenticate,middleware.authForParams, userController.getUserdata)


module.exports = router