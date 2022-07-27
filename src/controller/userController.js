const userModel = require("../model/userModel")  // importing the module that contains the user schema
const jwt = require('jsonwebtoken')
const { isValidRequest,isValidObjectId,isValid, emailRegex, phoneRegex, passRegex } = require('../validators/validator')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');


const createUser = async function (req, res) {
    try {
        let data = req.body

        if (!isValidRequest(data)) {
            return res.status(400).send({ status: false, message: "Please Enter your Details to Resistor" })
        }
        const { fname, lname, email, phone, password, address } = data

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "please provide the first name" })
        }
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "please provide the last name" })
        }
        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, message: "please enter valide email" })
        }
        const foundEmail = await userModel.findOne({ email })
        if (foundEmail) {
            return res.status(409).send({ status: false, message: "HYE..😐😐 this email is already present " })
        }
        if (!profileImage) return res.status(400).send({ status: false, message: "please select image" })

        if (!phoneRegex.test(phone)) {
            return res.status(400).send({ status: false, message: "please enter valid phone number" })
        }
        const foundPhone = await userModel.findOne({ phone })

        if (foundPhone) {
            return res.status(409).send({ status: false, message: "HYE..😐😐 this phone number is already present " })
        }
        if (!passRegex.test(password)) {
            return res.status(400).send({ status: false, message: "please enter valide password" })
        }
        const salt = bcrypt.genSaltSync(10);
        const encryptPassword = bcrypt.hashSync(password, salt);

        if(!isValidRequest(address)){
            return res.status(400).send({ status: false, message: "please enter address " })
        }

        const { shipping, billing} = address

        if(!(isValid(shipping.street) && isValid(shipping.city) && isValid(shipping.pincode))){
            return res.status(400).send({ status: false, message: "please enter fields of shipping" })

        }

        if(!(isValid(billing.street) && isValid(billing.city) && isValid(billing.pincode))){
            return res.status(400).send({ status: false, message: "please enter fields of billing" })

        }
    


        const user = {
            fname, lname, email, profileImage, phone, password:encryptPassword, address
        }

        let userCreated = await userModel.create(user)
        return res.status(201).send({ status: true, message: 'Success', data: userCreated })
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: err.message })

    }
}
//=========================================== [LOGIN USER] ======================================================
const loginUser = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password //Bhushan@123
        
        if (!email || !password) return res.status(400).send({ status: false, msg: "Provide the email and password to login." })  // if either email, password or both not present in the request body.

        if (!emailRegex.test(email))  // --> email should be provided in right format
            return res.status(400).send({ status: false, message: "Please enter a valid emailId. ⚠️" })

        let user = await userModel.findOne({ email: email})  // to find that particular user document.
        if (!user.email) return res.status(401).send({ status: false, msg: "Email is incorrect." })  // if the user document isn't found in the database.
        
        const match = await bcrypt.compare(password,user.password);
        if(!match) return res.status(400).send({status:false,message:"password is incorrect"})

        // const salt = bcrypt.genSaltSync(10);
        // const encryptPassword = bcrypt.hashSync(password, salt);

        let token = jwt.sign(  // --> to generate the jwt token
            {
                userId: user._id.toString(),                            // --> payload
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2),     // --> expiry set for 2 hours
                iat: Math.floor(Date.now() / 1000)
            },
            "Bhushan-Jiyalal-Ritesh-Himashu"                             // --> secret key
        )
        let data = {
            userId: user._id,
            token: token
        }

        res.setHeader("x-api-key", token)  // to send the token in the header of the browser used by the user.
        return res.status(200).send({ status: true, message: 'User login successfull', data: data })  // token is shown in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}

//---------------------getUserData-----------------------//

const getUserdata = async function (req, res) {

    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "UserId is invalid" })

        let finddata = await userModel.findById(userId).select({
            address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1,
            password: 1, createdAt: true, updatedAt: true, __v: 1
        })
        if (!finddata) return res.status(404).send({ status: false, message: "No user found" })

        return res.status(200).send({ status: true, message: "User profile details, data:finddata", data: finddata })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser, loginUser, getUserdata } 
