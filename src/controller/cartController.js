
const productModel = require("../model/productModel");
const UserModel = require("../model/userModel")
const cartModel = require("../model/cartModel")

const createCart = async function (req, res) {
    let newCart = req.body
    const createCart = await cartModel.create(newCart)
    return res.status(201).send({ status: true, message: "cart created successfully", data: createCart })
}
const updateCart = async function (req, res) {

}


const getCart = async function (req, res) {
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
