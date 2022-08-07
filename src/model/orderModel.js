const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderModel = new mongoose.Schema({
    userId: {type:ObjectId, ref:"User", required:true, unique:true},
    items: [{
      productId: {type:ObjectId, ref:"Products", required:true},
      quantity: {type:Number, required:true}
    }],
    totalPrice: {type:Number, required:true},//comment: "Holds total price of all the items in the cart"
    totalItems: {type:Number,required:true},// comment: "Holds total number of items in the cart"
    totalQuantity: {type:Number,required:true},//, comment: "Holds total number of quantity in the cart"},
    cancellable: {type:Boolean, default: true},
    status: {type:String,enum:["pending", "completed", "cancled"] ,default: 'pending'},
    deletedAt: {type:Date},            // when the document is deleted
    isDeleted: {type:Boolean, default: false},
    createdAt: {type:Date},
    updatedAt: {type:Date},
  },{timestamps:true})

  module.exports = mongoose.model("Order", orderModel);