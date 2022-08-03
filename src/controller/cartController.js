
const UserModel = require("../model/userModel")
const cartModel = require("../model/cartModel")
const { isValidRequest, isValid, isValidObjectId } = require('../validators/validator');
const { getProductById } = require("./productController");
const productModel = require("../model/productModel");

const createCart = async function (req, res) {
    try
    {
        const userIdFromParams = req.params.userId
        const data = req.body
        let {userId,items} = data
        
        //Validate body 
        if (!isValidRequest(data))
        {
            return res.status(400).send({ status: false, msg: "please provide Cart details" });
        }
        if (!isValid(userIdFromParams))
        {
            return res.status(400).send({ status: false, msg: 'please provide userId' })
        }
        if (!isValidObjectId(userIdFromParams))
        {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }
        if(!userId)return res.status(400).send({status:false,message:"please provide userId"})
        if(!items) return res.status(400).send({status:false,message:"please provide items"})
        var product= items.find(e => e.productId);
        const quantity=product.quantity
        const productId=product.productId
       

        const userByuserId = await UserModel.findById(userIdFromParams);

        if (!userByuserId)
        {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        if (data.userId != userIdFromParams)
        {
            return res.status(401).send({
                status: false,
                message: "Unauthorized access.",
            });
        }

        if (!isValid(productId))
        {
            return res.status(400).send({ status: false, messege: "please provide productId" })
        }

        if (!isValidObjectId(productId))
        {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const findProduct = await productModel.findById(productId);

        if (!findProduct)
        {
            return res.status(404).send({ status: false, message: 'product not found.' });
        }

        if (findProduct.isDeleted == true)
        {
            return res.status(400).send({ status: false, msg: "product is deleted" });
        }

        if (!quantity)
        {
            return res.status(400).send({ status: false, message: 'please provide quantity' })
        }

        if ((isNaN(Number(quantity))))
        {
            return res.status(400).send({ status: false, message: 'quantity should be a valid number' })
        }

        if (quantity < 0)
        {
            return res.status(400).send({ status: false, message: 'quantity can not be less than zero' })
        }

        const isOldUser = await cartModel.findOne({ userId: userIdFromParams });

        if (!isOldUser)
        {
            const newCart = {
                userId: userIdFromParams,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                totalPrice: (findProduct.price) * quantity,
                totalItems: 1
            }

            const createCart = await cartModel.create(newCart)
            return res.status(201).send({ status: true, message: "cart created successfully", data: createCart })
        }

        else{
            const newTotalPrice = (isOldUser.totalPrice) + ((findProduct.price) * quantity)
            let flag = 0;
            const items = isOldUser.items
            // console.log(items.length)
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId.toString() === productId) {
                    console.log("productId are similars")
                    items[i].quantity += quantity
                    var newCartData = {
                        items: items,
                        totalPrice: newTotalPrice,
                        quantity: items[i].quantity
                    }
                    flag = 1
                    const saveData = await cartModel.findOneAndUpdate(
                        { userId: userIdFromParams },
                        newCartData, { new: true })
                    return res.status(201).send({status: true,message: "product added to the cart successfully", data: saveData})
                }
            }
            if (flag === 0)
            {
                console.log("productIds are not similar")
                let addItems = {
                    productId: productId,
                    quantity: quantity
                }
                const saveData = await cartModel.findOneAndUpdate(
                    { userId: userIdFromParams },
                    { $Set: { items: addItems }, $inc: { totalItems: 1, totalPrice: ((findProduct.price) * quantity) } },
                    { new: true }).select({ "items._id": 0 })
                return res.status(201).send({ status: true, message: "product added to the cart successfully", data: saveData })
            }
        }
    }
    catch (error)
    {
        return res.status(500).json({ status: false, message: error.message });
    }
};
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
        let items = finalCart.items

        var product = items.find(e => e.productId);
        if (!finalCart)
        {
            return res.status(404).send({ status: false, message: "HEY..😐😐 CART NOT FOUND" })

        }
        // let ProdcutInCart = await cartModel.findOne({ items: productId.productId })

        if (!product)
        {
            return res.status(404).send({ status: false, message: "HEY..😐😐 PRODCUT NOT FOUND IN CART" })
        }
        if (!(typeof removeProduct === "number" && removeProduct.toString().trim().length > 0))
        {
            return res.status(400).send({ status: false, message: "HEY..😐😐..PLEASE Valid PROFUCT TO REMOVE" })
        }
        

        if ((removeProduct != 0) && (removeProduct != 1))
        {
            return res.status(400).send({ status: false, message: " REMOVEPRODUCT SHOULD BE 0 OR 1 " })
        }
        let finalQuantity = finalCart.items.find(ele=>ele.productId)
       
        if (removeProduct == 0)
        {

            let totalAmount = finalCart.totalPrice-(finalProdcut.price*finalQuantity.quantity)
          
            console.log(totalAmount)

            let quantity = finalCart.totalItems - 1
            let newCart = await cartModel.findOneAndUpdate({ _id: cartId }, { items: { productId: productId } }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })


            return res.status(200).send({ status: true, message: `PRODUCT HAS BEEN REMOVE FROM THE CART`, data: newCart })
        }

    } catch (err)
    {
       res.status(500).send({status:false,message:err.message})
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const deleteCart = async function (req, res) {

    try
    {

        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is invalid" })

        let cart = await cartModel.findOne({ userId: req.params.userId })
        if (!cart) return res.status(404).send({ status: false, message: "cart is not present for this user" })

        if (cart.userId != userId) return res.status(401).send({ status: false, message: "userId of cart not matched with user,unauthorized" })

        if (cart.items.length == 0 && cart.totalPrice == 0 && cart.totalItems == 0) return res.status(400).send({ status: false, message: "cart is already deleted" })


        let deletedcart = await cartModel.findOneAndUpdate({ userId: req.params.userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })

        return res.status(204).send({ status: true, message: "Cart deleted successfull", data: deletedcart })

    } catch (err)
    {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createCart, updateCart, deleteCart }
