const jwt = require("jsonwebtoken");  // importing the jsonwebtoken so as to authenticate and authorize the user.
const userModel = require("../model/userModel");
const mongoose = require('mongoose');


const myFunc = token => {
    return jwt.verify(token, 'Bhushan-Jiyalal-Ritesh-Himashu', (err, decode) => {
        if (err) {
            return null
        } else {
            return decode
        }
    })
}



// ==> Authentication function for all the books APIs

const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["authorization"] // --> token is picked from the headers section of the request
        token=token.slice(7)
        // console.log(token)
        if ( !token ) return res.status(401).send( { status: false, msg: "token must be present in request header."} )  // --> if token is not present in the headers
        let decodedToken = myFunc(token)
        if (!decodedToken) return res.status(403).send({ status: false, message: "invalid token" })
        req.decodedToken = decodedToken

        next()  // --> next function is called after successful verification of the token, either another middleware (in case of PUT and DELETE api) or root handler function.
    } catch (err) {
        return res.status(500).send( { status: false, error: err.message} )
    }
}

const authForParams = async function (req, res, next) {
    try {
        let userId = req.params.userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "Provide a valid userId in path params." })
        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: "bookId not present." })
        if (user._id.toString() !== req.decodedToken.userId) return res.status(403).send({ status: false, message: "You are not authorized to access this book." })
        next()
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}   
 
module.exports = { authenticate,authForParams}