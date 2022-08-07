const mongoose = require("mongoose")

// a function is defined to validate the data provided in the request body
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidField = function (value) {
  if (typeof value === "undefined" || value === null) return false;

  if (typeof value === "string" && value.trim().length === 0) return false;

  return true;
};

const isValidRequest = function (data) {
    if (Object.keys(data).length == 0) return false;
    return true;
  };
  const isValidObjectId = function(ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
 };


// a function is defined to validate the title provided in the request body



// Regex(s) used for the validation of different keys
let priceRegex=/^(\d*([.,](?=\d{3}))?\d+)+((?!\2)[.,]\d\d)?$/
let nameRegex = /^[.a-zA-Z\s]+$/
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
let passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/



// exporting the variables defined in the module
module.exports = {isValidField, isValid,nameRegex,isValidObjectId, emailRegex, phoneRegex, passRegex,isValidRequest,priceRegex}