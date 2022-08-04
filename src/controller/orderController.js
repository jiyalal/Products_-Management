const orderModel = require('../models/orderModel')
const chartModel = require('../models/cartModels')
const userModel = require('../models/userModel')

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
module.exports = { createOrder }