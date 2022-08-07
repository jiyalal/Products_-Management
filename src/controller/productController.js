const productModel = require("../model/productModel");
// const validUrl = require('valid-url');
const { isValidRequest, isValid, isValidObjectId, nameRegex, emailRegex, phoneRegex, passRegex, priceRegex } = require('../validators/validator')

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

        if (data.currencyId != "INR") return res.status(400).send({ status: false, message: "please provide currencyId only in INR" })

        //----------------validation for currencyFormat-----------//
        // if (!currencyFormat) return res.status(400).send({ status: false, mesage: "currencyFormat is required" })

        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "please provide valid currencyFormat" })
        }

        if (data.currencyFormat != "₹") return res.status(400).send({ status: false, message: "please provide currencyFormat only in ₹" })

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
            return res.status(400).send({ message: "File link not created" })
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
        if (productId.length != 24) return res.status(400).send({ status: false, message: `${productId} is not a valid ObjectId😥😥` })
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
    try
    {
        let productId = req.params.productId
        let data = req.body
        let files = req.files
        let { title, description, price, isFreeShipping, style, availableSizes, installments } = data

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please enter valid Id in params" })

        let product = await productModel.findById(productId)

        if (Object.keys(product).length == 0) { return res.status(404).send({ status: false, message: " No such data found " }) }

        if (product.isDeleted === true) return res.status(404).send({ status: false, message: "This product is already deleted." })
        if (product.title == title) return res.status(409).send({ status: false, message: "title is not unique, please provide another one." })

        if (Object.keys(data).length === 0 && !files) return res.status(400).send({ status: false, message: "Provide the data in the body to update." })

        if (description)
        {
            if (!isValidRequest(description)) return res.status(400).send({ status: false, message: "please provide data for description" })
        }
        if (price)
        {
            if (!priceRegex.test(price)) return res.status(400).send({ status: false, message: "Enter valid price" })
        }
        if (isFreeShipping)
        {
            if (isFreeShipping != true)
                return res.status(400).send({ status: false, message: "only true or false for isFreeShipping and must be boolean " })
        }
        if (style)
        {
            if (!isValidRequest(style)) return res.status(400).send({ status: false, message: "provide data in style" })
        }

        let productImage;
        // if (files && files.length > 0) {
        //     var uploadedFileURL = await aws.uploadFile(files[0]);
        //     productImage = uploadedFileURL;
        //     if (!validUrl.isUri(uploadedFileURL)) {
        //         return res.status(400).send({ status: false, msg: 'invalid uploadFileUrl' })
        //     }
        // }
        if (files && files.length > 0 )
        {

            if (files )
            {
                let uploadedFileURL = await uploadFile(files[0])
                
            }
            else
            {
                return res.status(400).send({ message: "File link not created" })
            }
        }
            if (availableSizes)
            {
                let arr = availableSizes.split(",").map(el => el.trim())
                for (let availableSizes of arr)
                {
                    if (!["XS", "X", "S", "M", "L", "XL", "XXL"].includes(availableSizes)) return res.status(400).send({ status: false, message: "size parmeter can only take XS , X , S , M , L , XL , XXL these values" })

                }
                data["availableSizes"] = arr

            }
            if (installments)
            {
                if (!Number(installments) || Number(installments) <= 0)
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
        
    } catch (err)
    {
        return res.status(500).send({ status: false, message: err.massage })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>GETPRODUCT>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const getProduct = async (req, res) => {
    try {

        let filters = req.query
        if (Object.keys(filters).length == 0) {

            let product = await productModel.find({ isDeleted: false }).select({
                _id: 1, title: 1, description: 1, price: 1,
                currencyId: 1, currencyFormat: 1, isFreeShipping: 1, productImage: 1, style: 1, availableSizes: 1, installments: 1,
                deletedAt: 1, isDeleted: 1, createdAt: 1, updatedAt: 1
            })


            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "HEY..🤨🤨 NO RESULT FOUND" })
            }
            else
            {
                Object.keys(filters).forEach(x => filters[x] = filters[x].trim())
                let { size, name, priceGreaterThan, priceLessThan, sortPrice } = filters

                if (size)
                {
                    if (size.includes(","))
                    {
                        let sizeArray = size.split(",").map(String).map(x => x.trim())
                        for (let i = 0; i < sizeArray.length; i++)
                        {
                            if (["S", "XS", "M", "L", "XXL", "XL"].includes(sizeArray[i]))
                            {
                                filters['availableSizes'] = sizeArray
                            }
                        }

                    }
                }
                if (name)
                {
                    if (!isValid(name))
                    {
                        return res.status(400).send({ status: false, message: "HEY..😐😐 PLEASE ENTER VALID NAME" })
                    }
                }
                if (filters.price)
                {

                }
            }
            let sortedProduct = product.sort(function (a, b) {
                var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                if (titleA < titleB) {
                    return -1; //titleA comes first
                }
                if (titleA > titleB) {
                    return 1; // titleB comes first
                }
                return 0;
            })
            return res.status(200).send({ status: true, data: sortedProduct })


        }
        else {
            Object.keys(filters).forEach(x => filters[x] = filters[x].trim())

            if (filters.size) {
                if (filters.size.includes(",")) {
                    let sizeArray = filters.size.split(",").map(String).map(x => x.trim())
                    filters.size = { $all: sizeArray }
                }
            }
            if (filters.name) {




        }
        filters.isDeleted = false;
        let filtersProduct = await productModel.find(filters).select({
            _id: 1, title: 1, description: 1, price: 1,
            currencyId: 1, currencyFormat: 1, isFreeShipping: 1, productImage: 1, style: 1, availableSizes: 1, installments: 1,
            deletedAt: 1, isDeleted: 1, createdAt: 1, updatedAt: 1
        })

        if (filtersProduct.length == 0) {
            return res.status(404).send({ status: false, message: "HEY..😐😐 NO PRODUCT FOUND" })
        } else {
            let sortedProduct = filtersProduct.sort(function (a, b) {
                var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                if (titleA < titleB) {
                    return -1; //titleA comes first
                }
                if (titleA > titleB) {
                    return 1; // titleB comes first
                }
                return 0;
            })
            return res.status(200).send({ status: true, data: sortedProduct })

        }
    }


    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, err: err.message })
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