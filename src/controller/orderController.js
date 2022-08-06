const orderModel = require('../model/orderModel')
const chartModel = require('../model/cartModel')
const userModel = require('../model/userModel')

const { isValidRequest, isValid, isValidObjectId, nameRegex, emailRegex, phoneRegex, passRegex, priceRegex } = require('../validators/validator');

const createOrder = async function (req, res) {

    try {
        let requestBody = req.body;
        const userId = req.params.userId



        const { cartId, cancellable } = requestBody
        if (!isValidRequest(requestBody)) { return res.status(400).send({ status: false, Message: ' Please provide Post Body' }); }

        if (!isValid(cartId)) { return res.status(400).send({ status: false, Message: ' Please provide cartId' }) }
        if (isValidObjectId(cartId)) { return res.status(400).send({ status: false, Message: ' Please provide a valid cartId' }) }

        // use userid to find cart
        const cart = await chartModel.findOne({ userId })
        if (!cart) return res.status(404).send({ status: false, Message: ' user\'s cart unavailable' })
        if (cart._id != cartId) return res.status(400).send({ status: false, Message: ' Cart id doesn\'t belong to this user' })

        // get cart info like items, totalPrice, totalItems and totalQuantity
        let { items, totalPrice, totalItems } = cart
        let totalQuantity = 0;
        items.forEach(each => totalQuantity += each.quantity);

        // object that use to create order
        const Obj = { userId, items, totalPrice, totalItems, totalQuantity, cancellable }

        const createProduct = await orderModel.create(Obj);

        res.status(201).send({ status: true, Message: ' sucesfully created order', data: createProduct })

    } catch (error) { res.status(500).send({ status: false, Message: error.message }) }
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
