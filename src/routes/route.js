const express = require('express')
const router = express.Router()
const userController = require("../controller/userController")
const middleware=require("../Middleware/commonMid")

//=====================[ USER API'S ]=========================
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile',middleware.authenticate,middleware.authForParams, userController.getUserdata)
router.put('/user/:userId/profile',userController.updateUser)

//===================[ PRODUCT API'S]=========================
router.post('/products') //rites
router.get('/products') //jiya lal
router.get('/products/:productId')// jiya lal
router.put('/products/:productId') // bhushan
router.delete('/products/:productId') // himashu

//====================[ORDER API'S]============================

router.post('/users/:userId/cart') //bhushan
router.put('/users/:userId/cart')  // jiyalal
router.get('/users/:userId/cart')  // himanshu
router.delete('/users/:userId/cart') //ritesh

//====================[CART API'S]=============================

router.post('/users/:userId/orders')  //Bhushan
router.put('/users/:userId/orders')  //Ritesh

module.exports = router