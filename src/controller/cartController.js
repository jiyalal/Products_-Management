
const userModel = require("../model/userModel")
const cartModel = require("../model/cartModel")
const { isValidRequest, isValid, isValidObjectId , isValidField } = require('../validators/validator');
const { getProductById } = require("./productController");
const productModel = require("../model/productModel");
const mongoose = require('mongoose')


let createCart = async function (req, res) {
    try {
        let userId = req.params.userId;
        let productId = req.body.productId

        //---------------[validations]--------------->

        //----[valid body]
        if (!isValidRequest(req.body))
            return res.status(400).send({
                status: false,
                message:
                    "Invalid request parameter. Please provide user details in request body.",
            });
        //------[user]
        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: "Not a valid userId",
            });
        }
        let findUser = await userModel.findOne({ _id: userId });
        if (!findUser) {
            return res.status(404).send({
                status: false,
                message: "User not found",
            });
        }
        //------[product]
        if (!isValidField(productId))
            return res
                .status(400)
                .send({
                    status: false, message: "ProductId is required."
                });
        if (!isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "Not a valid productId",
            });
        }
        //-----[find product in db]
        let findproduct = await productModel.findOne({ _id: productId, isDeletd: false });
        if (!findproduct) {
            return res.status(404).send({
                status: false,
                message: "product not found",
            });
        }
        //------[authorization]
        // let userAccessing = req.validToken.userId;
        // if (userId != userAccessing) {
        //     return res.status(403).send({
        //         status: false,
        //         message: "User not authorised",
        //     });
        // }
        
        //------[find cart with userId or create new cart]------>
        let findUserId = await cartModel.findOne({ userId: userId })
        if (!findUserId) {  //if cart is not present
            let newCart = { userId: userId }
            let items = []
            let product = { productId: productId, quantity: 1 }
            items.push(product)
            newCart.items = items
            newCart.totalPrice = findproduct.price
            newCart.totalItems = 1
            let create = await cartModel.create(newCart)
            return res.status(201).send({ status: true, message: 'Success', data: create })

        } else {    //if cart is present
            let itemsPresent = findUserId.items
            let i = 0
            for (i; i < itemsPresent.length; i++) {
                if (itemsPresent[i].productId == productId) {
                    itemsPresent[i].quantity++
                    break
                }
            }
            if (i == itemsPresent.length) {
                let product = { productId: productId, quantity: 1 }
                itemsPresent.push(product)
            }

            findUserId.totalItems = itemsPresent.length
            findUserId.totalPrice += findproduct.price

            await findUserId.save() //save document

            return res.status(201).send({
                status: true,                   //send response
                message: 'Success',
                data: findUserId
            })
        }

    } catch (err) {
        // console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>upDateCart>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const updateCart = async function (req, res) {
    try
    {
        let data=req.body
        let userId = req.params.userId
        if(!isValidRequest(data)) return res.status(400).send({ status: false, message: "no body" })
        if (!isValidObjectId(userId))
        {
            return res.status(400).send({ status: false, message: `${userId} IS NOT VALID` })
        }
        let cartData = await cartModel.findOne({ userId: userId });

        if (!cartData)
        {
            return res.status(404).send({ status: false, message: "no document exsist in this userId" })
        }

        let { cartId,productId,removeProduct } = data

        // if (!isValidRequest(productId)){
        //     return res.status(400).send({status:false,message:"please provide prodcutId"})
        // }
        if (!isValidObjectId(productId))
        {
            return res.status(400).send({ status: false, message: `${productId} IS NOT VALID` })
        }
        let finalProdcut = await productModel.findById(productId)

        if (!finalProdcut)
        {
            return res.status(404).send({ status: false, message: "HEY..😐😐 PRODCUT NOT FOUND" })
        }

        if (finalProdcut.isDeleted == true)
        {
            return res.status(400).send({ status: false, message: "HEY..😑😐 PRODUCT IS DELETED" })
        }
        // if(!isValidRequest(cartId)){
        //     return res.status(400).send({status:false,message:"please provide cartId"})
        // }
        if (!isValidObjectId(cartId))
        {
            return res.status(400).send({ status: false, message: `${cartId} IS NOT VALID` })

        }
        let finalCart = await cartModel.findById(cartId)


        if (!finalCart)
        {
            return res.status(404).send({ status: false, message: "HEY..😐😐 CART NOT FOUND" })

        }

        // if(finalCart.items.includes)
        // let prodcutInCart = await cartModel.findOne({ items: { $eleMatch: { productId: productId } } })
        // var product = items.find(e => e.productId);

        // if (!product)
        // {
        //     return res.status(404).send({ status: false, message: "HEY..😐😐 PRODCUT NOT FOUND IN CART" })
        // }
        
        if (!(typeof removeProduct === "number" && removeProduct.toString().trim().length > 0))
        {
            return res.status(400).send({ status: false, message: "HEY..😐😐..PLEASE Valid Remove product number" })
        }


        if ((removeProduct != 0) && (removeProduct != 1))
        {
            return res.status(400).send({ status: false, message: " REMOVEPRODUCT SHOULD BE 0 OR 1 " })
        }
        let finalQuantity = finalCart.items.find(ele => ele.productId.toString() === productId)

        if (removeProduct == 0)
        {

            let totalAmount = finalCart.totalPrice - (finalProdcut.price * finalQuantity.quantity)
            let quantity = finalCart.totalItems - 1
            let newCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })

            return res.status(200).send({ status: true, message: `PRODUCT HAS BEEN REMOVE FROM THE CART`, data: newCart })
        }
        if (removeProduct == 1)
        {
            // console.log("coming in")
            let totalAmount = finalCart.totalPrice - finalProdcut.price
            let itemsArr = finalCart.items
            for (let i = 0; i < itemsArr.length; i++)
            {
                if (itemsArr[i].productId.toString() === productId)
                {
                    itemsArr[i].quantity = itemsArr[i].quantity - 1
                    if (itemsArr[i].quantity == 0)
                    {
                        // console.log("quantity has become 0 now.")
                        var noOfItems = finalCart.totalItems - 1
                        let newCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, $set: { totalPrice: totalAmount, totalItems: noOfItems } }, { new: true })
                        return res.status(200).send({ status: true, message: 'Product has been removed from the cart', data: newCart })
                    }
                }
            }
            //    console.log("quantity is not 0.")
            let data = await cartModel.findOneAndUpdate({ _id: cartId }, { totalPrice: totalAmount, items: itemsArr }, { new: true })
            return res.status(200).send({ status: true, message: 'Product in the cart updated successfully.', data: data })
        }
    } catch(err){

    }



}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (userId.trim().length == 0)
	      return res.status(400).send({ status: false, Message: "userId Empty" })

        if (!mongoose.isValidObjectId(userId)) 
	      return res.status(400).send({ status: true, Message: "Invalid UserId !" })

        const checkCart = await cartModel.findOne({ userId: userId }).populate({
            path: 'items.productId',
            select:
              'title price productImage style availableSizes isDeleted',
          });

        if (!checkCart) 
        return res.status(404).send({ status: false, Message: 'Cart not found' })
        if (checkCart.items.length==0)
        return res.status(400).send({ status: false, Message: "Cart is empty" })

         return res.status(200).send({ status: true, Message: 'Succcess', data: checkCart })
    } catch (error) { 
      res.status(500).send({ status: false, Message: error.message }) }
}


    const deleteCart = async function (req, res) {

        try {

            let userId = req.params.userId

            if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is invalid" })

            let cart = await cartModel.findOne({ userId: req.params.userId })
            
            if (!cart) return res.status(404).send({ status: false, message: "cart is not present for this user" })

            if (cart.userId != userId) return res.status(401).send({ status: false, message: "userId of cart not matched with user,unauthorized" })

            if (cart.items.length == 0 && cart.totalPrice == 0 && cart.totalItems == 0) return res.status(400).send({ status: false, message: "cart is already deleted" })


            let deletedcart = await cartModel.findOneAndUpdate({ userId: req.params.userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })

            return res.status(204).send({ status: true, message: "Cart deleted successfull", data: deletedcart })

        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    }



    module.exports = { createCart, updateCart, getCart, deleteCart }
