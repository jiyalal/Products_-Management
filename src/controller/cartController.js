const productModel = require("../model/productModel");
const UserModel=require("../model/userModel")
const cartModel=require("../model/cartModel")

const createCart=async function (req, res){
    let newCart=req.body
    const createCart = await cartModel.create(newCart)
    return res.status(201).send({ status: true, message: "cart created successfully", data: createCart })
}
const updateCart=async function (req, res){
    
} 


const getCart=async function (req, res){

}

const deleteCart = async function (req, res){

}

module.exports = { createCart, updateCart, getCart, deleteCart }