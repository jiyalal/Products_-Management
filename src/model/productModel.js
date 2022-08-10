const mongoose = require("mongoose");

const productModel = new mongoose.Schema(
    {
    title: { type:String, required:true, unique:true },
    description: { type:String, required:true },
    price: {type: Number, required:true},
    currencyId: { type:String, required:true },
    currencyFormat: { type:String, required:true},
    isFreeShipping: {type: Boolean, default: false },
    productImage: { type:String, require:true },  // s3 link
    style: { type:String },
    availableSizes: { type:String,enum:["S", "XS","M","X", "L","XXL", "XL"] }, 
    installments: { type:Number },
    deletedAt: {type: Date, default:null},
    isDeleted: { type:Boolean, default: false },
    createdAt: { type:Date},
    updatedAt: { type:Date },
    },
    { timestamps: true }
)
module.exports = mongoose.model("Products", productModel);