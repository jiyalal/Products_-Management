const productModel = require("../model/productModel")
const { isValidRequest, isValid, isValidObjectId, nameRegex, emailRegex, phoneRegex, passRegex, priceRegex } = require('../validators/validator')

const updateProduct = async function (req, res) {
    let productId = req.params.productId
    let data = req.body
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

    if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please enter valid Id in params" })

    let product = await productModel.findById(productId)

    if (Object.keys(product).length == 0) { return res.status(404).send({ status: false, message: " No such data found " }) }

    if (product.isDeleted === true) return res.status(400).send({ status: false, message: "This product is already deleted." })
    if (product.title == title) return res.status(400).send({ status: false, message: "title is not unique, please provide another one." })

    if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in the body to update." })

    if (description) {
        if (!isValidRequest(description)) return res.status(400).send({ status: false, message: "please provide data for description" })
    }
    if (price) {
        if (!priceRegex.test(price)) return res.status(400).send({ status: false, message: "Enter valid price" })
    }

    let update = await productModel.findOneAndUpdate({ _id: productId },
        {
            $set: {
                title: title, description: description, price: price, currencyId: currencyId,
                currencyFormat: currencyFormat, isFreeShipping: isFreeShipping, productImage: productImage,
                style: style, availableSizes: availableSizes, installments: installments
            }
        },
        { new: true })
    return res.status(200).send({ status: true, message: "Update data succesfully", data: update })

    // let updated = await productModel.findOneAndUpdate({ _id: productId}{ new: true })
    // return res.status(200).send({ status: true, message: 'User profile updated', Data: updated })
}


module.exports = { createProduct,updateProduct }