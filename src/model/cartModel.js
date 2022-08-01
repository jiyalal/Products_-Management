const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartModel = new mongoose.Schema(
{
    userId: {type:ObjectId, ref:"User", required:true, unique:true,trim:true},
    items: [{
      productId: {type:ObjectId, ref:"Products", required:true},
      quantity: {type:Number, required:true}
    }],
    totalPrice: {type:Number, required:true},//comment: "Holds total price of all the items in the cart"
    totalItems: {type:Number,required:true},// comment: "Holds total number of items in the cart"
    createdAt: { type:Date},
    updatedAt: { type:Date },
  },
  {timestamps:true})

  module.exports = mongoose.model("cart", cartModel);