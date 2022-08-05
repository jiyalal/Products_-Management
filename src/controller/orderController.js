const orderModel = require('../model/orderModel')
const userModel = require('../model/userModel')
const productModel = require('../model/productModel')
const {isValid ,isValidObjectId} = require('../validator/validator')

const createOrder = async function(req,res){
   try{
    let userIdP = req.params.userId
    let userIdFromToken = req.tokenId 
    if (!isValidObjectId(userId)) {
        res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        return
    }
    if (userIdP != userIdFromToken) {
        res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
        return
    }
         let {userId,items,totalPrice,totalItems,status}   = req.body
         if(Object.keys(req.body)<1)  return res.status(400).send({status:false, msg: "Data is required." })
         if(!isValid(userId))   return res.status(400).send({status:false, msg: "userId is required." })
         if(!isValidObjectId(userId)) return res.status(400).send({status:false, msg: "userId is not valid." })
         
        let user = await userModel.findById(userId) 
        if(!user) return res.status(400).send({status:false, msg: "no user with given userId." })

         if(!Array.isArray(items)) return res.status(400).send({status:false, msg: "put items in array." })
         let totalQuantity = 0
         for(let i =0;i<items.length;i++){
            if(Object.keys(items[i]).length<1) return res.status(400).send({status:false, msg: "items can not be empty" })
            if(!isValidObjectId(items[i].productId)) return res.status(400).send({status:false, msg: "userId is not valid." })
            let product = await productModel.findById(items[i].productId)
            if(!product) return res.status(400).send({status:false, msg: "no item with given productId " })
            if(items[i].quantity<1) return res.status(400).send({status:false, msg: "item quantity is 1 or greter than 1" })
            totalQuantity += items[i].quantity
         }
        if(status){
            if(!["pending", "completed", "canceled"].includes(status)) return res.status(400).send({status:false, msg: 'enter status from this ["pending", "completed", "canceled"]' })
        }

         req.body.totalQuantity =  totalQuantity

        let order = await orderModel.create(req.body)
        res.status(201).send({status:true,data: order})

   }catch(err){
      res.status(500).send({status:false,msg:err.message})
   }
}


const updateOrder  = async function(req,res){
    try{
        let userIdP = req.params.userId
        let userIdFromToken = req.tokenId 
        if (!isValidObjectId(userIdP)) {
            res.status(400).send({ status: false, message: `${userIdP} is not a valid user id` })
            return
        }
        if (userIdP != userIdFromToken) {
            return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            
        }
        let user = await userModel.findById(userIdP) 
        if(!user) return res.status(404).send({status:false, msg: "no user with given userId." })
 
     let {orderId,status} = req.body
    let order = await orderModel.findOne({_id:orderId,isDeleted:false})
    if(!order) return res.status(404).send({status:false, msg: "no order with given orderId." })
     if(userIdP != order.userId)  return res.status(403).send({ status: false, message: `Unauthorized access! User not allowed to cancel order` });
     if(order.cancellable == false) return res.status(400).send({status:false, msg: "not cancellable order" })
     if(!["pending", "completed", "canceled"].includes(status)) return res.status(400).send({status:false, msg: 'enter status from this ["pending", "completed", "canceled"]' })

     let updatedOrder = await orderModel.findOneAndUpdate({_id:orderId},{status:status},{new:true})
     res.status(200).send({status:true,data:updatedOrder})
    
    }catch(err){
       res.status(500).send({status:false,msg:err.message})
    }
 }


 module.exports = {createOrder,updateOrder}
