const productModel = require("../model/productModel");
const UserModel = require("../model/userModel")
const cartModel = require("../model/cartModel")
const { isValidRequest, isValid, isValidObjectId, nameRegex, emailRegex, phoneRegex, passRegex, priceRegex } = require('../validators/validator');
const { getProductById } = require("./productController");

const createCart = async function (req, res) {
    try {
        const userIdFromParams = req.params.userId
        const data = req.body
        let {items} = data
        var product= items.find(e => e.productId);
        const quantity=product.quantity
        const productId=product.productId
        

        //Validate body 
        if (!isValidRequest(data)) {
            return res.status(400).send({ status: false, msg: "please provide Cart details" });
        }
        if (!isValid(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: 'please provide userId' })
        }
        if (!isValidObjectId(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }

        const userByuserId = await UserModel.findById(userIdFromParams);

        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        if (data.userId != userIdFromParams) {
            return res.status(401).send({ 
                status: false,
                message: "Unauthorized access.",
            });
        }
        
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, messege: "please provide productId" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const findProduct = await productModel.findById(productId);

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product not found.' });
        }

        if (findProduct.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "product is deleted" });
        }

        if (!quantity) {
            return res.status(400).send({ status: false, message: 'please provide quantity' })
        }

        if ((isNaN(Number(quantity)))) {
            return res.status(400).send({ status: false, message: 'quantity should be a valid number' })
        }

        if (quantity < 0) {
            return res.status(400).send({ status: false, message: 'quantity can not be less than zero' })
        }

        const isOldUser = await cartModel.findOne({ userId: userIdFromParams });

        if (!isOldUser) {
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

        if (isOldUser) {
            const newTotalPrice = (isOldUser.totalPrice) + ((findProduct.price) * quantity)
            let flag = 0;
            const items = isOldUser.items
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
                    return res.status(201).send({
                        status: true,
                        message: "product added to the cart successfully", data: saveData
                    })
                }
            }
            if (flag === 0) {
                console.log("productIds are not similar")
                let addItems = {
                    productId: productId,
                    quantity: quantity
                }
                const saveData = await cartModel.findOneAndUpdate(
                    { userId: userIdFromParams },
                    { $addToSet: { items: addItems }, $inc: { totalItems: 1, totalPrice: ((findProduct.price) * quantity) } },
                    { new: true }).select({ "items._id": 0 })
                return res.status(201).send({ status: true, message: "product added to the cart successfully", data: saveData })
            }
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
const updateCart = async function (req, res) {

}


const getCart = async function (req, res) {

}

const deleteCart = async function (req, res) {

}

module.exports = { createCart, updateCart, getCart, deleteCart }