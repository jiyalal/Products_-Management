const productModel = require("../model/productModel");
// const validUrl = require('valid-url');
const { isValidRequest, isValidField, isValid, isValidObjectId, nameRegex, emailRegex, phoneRegex, passRegex, priceRegex } = require('../validators/validator')

const aws = require("aws-sdk")
const mongoose = require('mongoose')
// const validator = require('validator')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "myLink/" + file.originalname,
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

    })
}

///==========================|CREATE PRODUCT|=====================///

const createProduct = async function (req, res) {
    try {
        const data = req.body;
        if (!isValidRequest(data)) {
            return res.status(400).send({ status: false, message: "Please Enter your Details" })
        }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;

        //----------------validation for title-------------//
        if (!title) return res.status(400).send({ status: false, mesage: "Title is required" })

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "please provide valid title" })
        }
        let duplicateTitle = await productModel.findOne({ title: title })
        if (duplicateTitle) return res.status(400).send({ status: false, message: "Title is already present" })

        //-------------validation for description----------//
        if (!description) return res.status(400).send({ status: false, mesage: "Description is required" })

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "please provide valid description" })
        }

        //----------------validation for price-------------------//
        if (!price) return res.status(400).send({ status: false, mesage: "Price is required" })

        if (!Number(price)) return res.status(400).send({ status: false, mesage: "Please enter valid Price" })

        if (Number(price) <= 0) return res.status(400).send({ status: false, mesage: "Price not valid" })

        if (!/^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(price)) return res.status(400).send({ status: false, mesage: "Price must be valid number/decimal" })

        //---------------validation for currencyId-----------------//
        if (!currencyId) return res.status(400).send({ status: false, mesage: "currencyId is required" })

        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "please provide valid currencyId" })
        }

        if (data.currencyId != "INR") return res.status(400).send({ status: false, message: "please provide currencyId only in INR or USD" })
        data.currencyFormat = "₹"
        //----------------validation for currencyFormat-----------//
        // if (!currencyFormat) return res.status(400).send({ status: false, mesage: "currencyFormat is required" })

        // if (!isValid(currencyFormat)) {
        //     return res.status(400).send({ status: false, message: "please provide valid currencyFormat" })
        // }

        // if (data.currencyFormat != "₹") return res.status(400).send({ status: false, message: "please provide currencyFormat only in ₹" })

        //-------------validation for isFreeShipping---------------//
        if (isFreeShipping) {
            if (!['true', 'false'].includes(isFreeShipping)) return res.status(400).send({ status: false, message: "please provide isFreeShipping only in Boolean" })
        }
        //--------------validation for style---------------------//
        if (!isValid(style)) {
            return res.status(400).send({ status: false, message: "please provide valid style" })
        }
        //--------------validation for availableSizes------------//
        if (!availableSizes) return res.status(400).send({ status: false, mesage: "availableSizes is required" })
        if (availableSizes) {
            let arr = availableSizes.split(",").map(el => el.trim())
            for (let availableSizes of arr) {
                if (!["XS", "X", "S", "M", "L", "XL", "XXL"].includes(availableSizes)) return res.status(400).send({ status: false, message: "size parmeter can only take XS , X , S , M , L , XL , XXL these values" })

            }
            data["availableSizes"] = arr

        }
        //---------------validation for installments--------------//
        if (!Number(installments)) return res.status(400).send({ status: false, mesage: "Please enter valid installments" })

        if (Number(installments) <= 0) return res.status(400).send({ status: false, mesage: "installments is not valid" })

        //---------------upload productImage s3 files-------------//

        files = req.files
        let productImage;
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            productImage = uploadedFileURL;
        }
        else {
            return res.status(400).send({ message: "Image File not found" })
        }

        //--------------------------------------------------------//

        let createProduct = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: createProduct })


    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err })
    }
}
///==========================Delete PRODUCT=====================///

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `${productId} is not a valid ObjectId😥😥` })
        const prod = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!prod) {
            return res.status(404).send({ status: false, message: "product is not available" })
        }


        const deleteProduct = await productModel.findByIdAndUpdate(productId, { isDeleted: true, deletedAt: new Date() },
            { new: true })
        return res.status(200).send({ status: true, message: "Success", data: deleteProduct })
    }
    catch (err) {

        res.status(500).send({ message: err.message })
    }
}

//===========================[  UPDATE PRODUCT  ]======================================

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        let data = req.body
        let files = req.files
        let { title, description, price, isFreeShipping, style, availableSizes, installments } = data

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please enter valid Id in params" })

        let product = await productModel.findById(productId)

        if (!product) { return res.status(404).send({ status: false, message: "No such data found " }) }

        if (product.isDeleted === true) return res.status(404).send({ status: false, message: "This product does not exist." })
        if (product.title == title) return res.status(409).send({ status: false, message: "title is not unique, please provide another one." })

        if (Object.keys(data).length === 0 && !files) return res.status(400).send({ status: false, message: "Provide the data in the body to update." })
        if (Object.keys(data).includes("title")) {
            if (!isValidField(title)) return res.status(400).send({ status: false, message: "please provide data for title" })
        }
        if (Object.keys(data).includes("description")) {
            if (!isValidField(description)) return res.status(400).send({ status: false, message: "please provide data for description" })
        }
        if (Object.keys(data).includes("price")) {
            if (!priceRegex.test(price)) return res.status(400).send({ status: false, message: "Enter valid price" })
        }
        if (Object.keys(data).includes("isFreeShipping")) {
            if (isFreeShipping != "true" && isFreeShipping != "false")
                return res.status(400).send({ status: false, message: "only true or false for isFreeShipping and must be boolean " })
        }
        if (Object.keys(data).includes("style")) {
            if (!isValidField(style)) return res.status(400).send({ status: false, message: "provide data in style" })
        }

        let productImage;


        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            productImage = uploadedFileURL;

            data.productImage = productImage
        }

        if (Object.keys(data).includes("productImage")) {
            if (!data.productImage) return res.status(400).send({ message: "Product Image not provided" })
        }


      
        if (Object.keys(data).includes("availableSizes")) {
            if(!isValid(availableSizes)){return res.status(400).send({ status: false, mesage: "Please enter valid sizes" })}
            let arr2=product.availableSizes
          
            let arr = availableSizes.split(",").map(el => el.trim())
            for (let availableSizes of arr) {
                if (!["XS", "X", "S", "M", "L", "XL", "XXL"].includes(availableSizes)) return res.status(400).send({ status: false, message: "size parmeter can only take XS , X , S , M , L , XL , XXL these values" })
                if(!arr2.includes(availableSizes)){
                
                    arr2.push(availableSizes)}
                
            }
            availableSizes = [...arr2]
            

        }
        if (Object.keys(data).includes("installments")) {
            if (!Number(installments) || Number(installments) <= 0 || !isValid(installments))
                return res.status(400).send({ status: false, mesage: "Please enter valid installments" })
        }
        let update = await productModel.findOneAndUpdate({ _id: productId },
            {
                $set: {
                    title: title, description: description, price: price,
                    isFreeShipping: isFreeShipping, productImage: productImage,
                    style: style, availableSizes: availableSizes, installments: installments
                }
            },
            { new: true })
        return res.status(200).send({ status: true, message: "Update data succesfully", data: update })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.massage })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>GETPRODUCT>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
let getProduct = async (req, res) => {
    try {
        let filterProduct = req.query
        let newObject = {}

        if ('priceGreaterThan' in filterProduct) {

            newObject.price = { $gt: filterProduct.priceGreaterThan }
        }
        if ('priceLessThan' in filterProduct) {
            if ('priceGreaterThan' in filterProduct) {
                newObject.price = { $gt: filterProduct.priceGreaterThan, $lt: filterProduct.priceLessThan }
            } else {
                newObject.price = {
                    $lt: parseInt(filterProduct.priceLessThan)
                }
            }
        }
        if ('size' in filterProduct) {
            let temp;
            if (typeof size == "object") temp = filterProduct.size;
            else temp = filterProduct.size.split(',').map(x => x.trim())
            newObject.availableSizes = { $in: temp }
        }
        let sortPrice = 1
        if ('priceSort' in filterProduct) {
            if (filterProduct.priceSort != 1 && filterProduct.priceSort != -1) {
                return res.status(400).send({ status: false, message: 'Price sort can only be 1 or -1' })
            }
            if (filterProduct.priceSort == '-1') {
                sortPrice = -1
            }
        }
        console.log(sortPrice);
        //---------[Find product] 
        let data = await productModel.find({ $and: [newObject, { isDeleted: false }] }).sort({ price: sortPrice })
        if (data.length == 0) return res.status(404).send({ status: false, message: 'Product not found' });

        //-------[title]
        if ('name' in filterProduct) {
            let newData = []
            for (let i of data) {
                if (i.title.includes(filterProduct.name)) {
                    newData.push(i)
                }
            }
            if (newData.length == 0) return res.status(404).send({ status: false, message: 'Product not found' })
            return res.status(200).send(
                {
                    status: true,
                    message: 'Product list',
                    data: newData
                })
        }

        //---------[Response Send]
        res.status(200).send({ status: true, message: 'Success', data: data })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>GetProductById>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const getProductById = async (req, res) => {
    try {

        let productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "HEY..😐😐..THIS PRODUCT ID IS NOT VALID PLEAE ENTER VALID ID" })
        }

        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "HEY..😐😐..NO PRODUCT AVAILABLE IN THIS ID" })
        }

        return res.status(200).send({ status: true, message: "YEAH..😍😍 PRODUCT FOUND SUCCESSFULLY", data: findProduct })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, err: err.message })

    }
}


module.exports = { createProduct, deleteProduct, updateProduct, getProduct, getProductById }