
const productModel = require("../model/productModel");
const UserModel=require("../model/userModel")
const cartModel=require("../model/cartModel");
const { isValidObjectId } = require("../validators/validator");

const createCart=async function (req, res){
    let newCart=req.body
    const createCart = await cartModel.create(newCart)
    return res.status(201).send({ status: true, message: "cart created successfully", data: createCart })
}
const updateCart=async function (req, res){
    try{
        let userId = req.paramas.userId
        
        if(isValidObjectId(userId)){
            return res.status(400).send({status:false, message:`${userId} IS NOT VALID`})
        }
        let cartData  = await cartModel.findById(userId);

        if(!cartData){
            return res.status(404).send({status:false, message:"no document exsist in this userId"})
        }

         let {productId,cartId,removeProduct} = req.body

         if(productId){

         }




        
        



    } catch(err){
        console.log(err)
    }




    
}


const getCart=async function (req, res){

}

const deleteCart = async function (req, res){

}

module.exports = { createCart, updateCart, getCart, deleteCart }

