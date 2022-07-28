const productModel = require("../model/productModel");
const { isValidRequest } = require("../validators/validator")
const aws = require("aws-sdk")
const mongoose = require('mongoose')

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

///==========================CREATE PRODUCT=====================///

const createProduct = async function (req, res){
try{
const data = req.Body;

if(! isValidRequest(data)){
    return res.status(400).send({ status: false, message: "Please Enter your Details" })
}
const {title, description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments} = data;

//----------------validation for title-------------//
if(!title) return res.status(400).send({status:false,mesage:"Title is required"})

   if(!isValid(title)) {  
       return res.status(400).send({status:false, message:"please provide valid title"})
}
 let duplicateTitle = await productModel.findOne({title:title})
 if(duplicateTitle) return res.status(400).send({status:false,message:"Title is already present"})
 
 //-------------validation for discription----------//
 if(!description) return res.status(400).send({status:false,mesage:"Description is required"})

 if(!isValid(description)) {  
    return res.status(400).send({status:false, message:"please provide valid description"})
}

//----------------validation for prise-------------------//
if(!price) return res.status(400).send({status:false,mesage:"Price is required"})

if(!Number(price)) return res.status(400).send({status:false,mesage:"Please enter valid Price"})

if(Number(price) <= 0) return res.status(400).send({status:false,mesage:"Price not valid"})

if(!/^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(price)) return res.status(400).send({status:false,mesage:"Price must be valid number/decimal"})

//---------------validation for currencyId-----------------//
if(!currencyId) return res.status(400).send({status:false,mesage:"currencyId is required"})

if(!isValid(currencyId)) {  
    return res.status(400).send({status:false, message:"please provide valid currencyId"})
}

if(data.currencyId != "INR") return res.status(400).send({status:false, message:"please provide currencyId only in INR"})

//----------------validation for currencyFormat-----------//
if(!currencyFormat) return res.status(400).send({status:false,mesage:"currencyFormat is required"})

if(!isValid(currencyFormat)) {  
    return res.status(400).send({status:false, message:"please provide valid currencyFormat"})
}

if(data.currencyFormat != "₹") return res.status(400).send({status:false, message:"please provide currencyId only in ₹"})

//-------------validation for isFreeShipping---------------//

if(!['true','false'].includes(isFreeShipping)) return res.status(400).send({status:false, message:"please provide isFreeShipping only in Boolean"})

//--------------validation for style---------------------//
if(!isValid(style)) {  
    return res.status(400).send({status:false, message:"please provide valid style"})
}
//--------------validation for availableSizes------------//


//---------------validation for installments--------------//
if(!Number(installments)) return res.status(400).send({status:false,mesage:"Please enter valid installments"})

if(Number(installments) <= 0) return res.status(400).send({status:false,mesage:"installments is not valid"})

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
        return res.status(201).send({status:true, message:"Success",data:createProduct})
    
    }catch(err){
        return res.status(500).send({status:false,message:err.massage})
    }
}
///==========================Delete PRODUCT=====================///
{
    const deleteProduct = async function (req, res) {
        try {
            const productId = req.params.productId
            if (productId.length!=24) return res.status(400).send({ status: false, message: `${productId} is not a valid ObjectId😥😥` })
            const prod = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!prod) {
                return res.status(404).send({ status: false, message: "product is not available" })
            }
            
    
            const deleteProduct = await productModel.findByIdAndUpdate(productId, { isDeleted: true, deletedAt: new Date() },
                { new: true })
            return res.status(200).send({ status: true, message: "Success",data:deleteProduct })
        }
        catch (err) {
            
            res.status(500).send({ message: err.message })
        }
    }
}

module.exports = {createProduct,deleteProduct}