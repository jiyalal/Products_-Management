const userModel = require("../model/userModel")  // importing the module that contains the user schema
const jwt = require('jsonwebtoken')
const { isValidRequest, isValid,isValidObjectId, nameRegex, emailRegex, phoneRegex, passRegex } = require('../validators/validator')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const aws = require("aws-sdk")

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

const createUser = async function (req, res) {
    try {
        let data = req.body

        if (!isValidRequest(data)) {
            return res.status(400).send({ status: false, message: "Please Enter your Details to Resistor" })
        }
        let { fname, lname, email, phone, password, address } = data

        files = req.files
        let profileImage;
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            profileImage = uploadedFileURL;
        }
        else {
            return res.status(400).send({ message: "File link not created" })
        }


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
        // if (!profileImage) return res.status(400).send({ status: false, message: "please select image" })

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

        const address2=JSON.parse(address)
        address=address2
        
        if (!isValidRequest(address)) {
            return res.status(400).send({ status: false, message: "please enter address " })
        }


        const { shipping, billing } = address

        if (!(isValid(shipping.street) && isValid(shipping.city) && isValid(shipping.pincode))) {
            return res.status(400).send({ status: false, message: "please enter fields of shipping" })

        }

        if (!(isValid(billing.street) && isValid(billing.city) && isValid(billing.pincode))) {
            return res.status(400).send({ status: false, message: "please enter fields of billing" })

        }



        
        const user = {
            fname, lname, email, profileImage, phone, password: encryptPassword, address
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

        let user = await userModel.findOne({ email: email })  // to find that particular user document.
        if (!user.email) return res.status(401).send({ status: false, msg: "Email is incorrect." })  // if the user document isn't found in the database.

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).send({ status: false, message: "password is incorrect" })

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

        return res.status(200).send({ status: true, message: "User profile details", data: finddata })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId

        if (userId.length!=24) {
            return res.status(400).send({ status: false, message: " UserId Invalid " })
        }
        let userd = await userModel.findById(userId);
        if (Object.keys(userd).length == 0) {
            return res.status(404).send({ status: false, message: " No such data found " })
        }
        let reqData = req.body;
        let { fname, lname, email, phone, password, address } = reqData
        files = req.files
        if ((Object.keys(reqData).length==0)&& !files) {
            return res.status(400).send({ status: false, message: "Please Enter your Details to Update" })
        }

        

        if (Object.keys(reqData).includes("fname") && (!nameRegex.test(fname) || !isValid(fname))) {
            return res.status(400).send({ status: false, message: "provide valid first name" })
        }

        if (Object.keys(reqData).includes("lname") && (!nameRegex.test(lname) || !isValid(lname))) {
            return res.status(400).send({ status: false, message: "provide valid last name" })
        }
        if (Object.keys(reqData).includes("email")) {
            if (!emailRegex.test(email)) {
                return res.status(400).send({ status: false, message: "please enter valide email" })
            }
            const foundEmail = await userModel.findOne({ email })
            if (foundEmail) {
                return res.status(409).send({ status: false, message: "HYE..😐😐 this email is already present " })
            }
        }

        if (Object.keys(reqData).includes("phone")) {
            if (!phoneRegex.test(phone)) {
                return res.status(400).send({ status: false, message: "please enter valid phone number" })
            }
            const foundPhone = await userModel.findOne({ phone })

            if (foundPhone) {
                return res.status(409).send({ status: false, message: "HYE..😐😐 this phone number is already present " })
            }
        }
        if (Object.keys(reqData).includes("password")) {
            if (!passRegex.test(password)) {
                return res.status(400).send({ status: false, message: "please enter valide password" })
            }

            // const rounds = 10
            // data["password"] = await bcrypt.hash(password, rounds);
            const salt = bcrypt.genSaltSync(10);
            const encryptPassword = bcrypt.hashSync(password, salt);
            reqData.password = encryptPassword

        }

        if (Object.keys(reqData).includes("address")) {
            const address2=JSON.parse(address)
            address=address2
            // console.log(address.shipping)
            if (!isValidRequest(address)) {
                return res.status(400).send({ status: false, message: "please enter address " })
            }

            const { shipping, billing } = address
            let shipping2 = userd.address.shipping;
            let billing2 = userd.address.billing;
        


            if (shipping) {
                if (shipping.street) {
                
                    if (!isValid(shipping.street)) { return res.status(400).send({ status: false, message: "Invalid street name" }) }
                    else { shipping2.street = shipping.street }
                }
                if (shipping.city) {
                    if (!isValid(shipping.city)) { return res.status(400).send({ status: false, message: "Invalid street city" }) }
                    else { shipping2.city = shipping.city }
                }
                if (shipping.pincode) {
                    if (!isValid(shipping.pincode)) { return res.status(400).send({ status: false, message: "Invalid street pincode" }) }
                    else { shipping2.pincode = shipping.pincode }
                }
             
            }
            if (billing) {

                if (billing.street) {

                    if (!isValid(billing.street)) { return res.status(400).send({ status: false, message: "Invalid street street" }) }
                    else { billing2.street = billing.street }
                }
                if (billing.city) {
                    if (!isValid(billing.city)) { return res.status(400).send({ status: false, message: "Invalid street city" }) }
                    else { billing2.city = billing.city }
                }
                if (billing.pincode) {
                    if (!isValid(billing.pincode)) { return res.status(400).send({ status: false, message: "Invalid street pincode" }) }
                    else { billing2.pincode = billing.pincode }
                }
             
            }
            reqData.address={}
            reqData.address.shipping = shipping2
            reqData.address.billing = billing2
        }
      
        if(files.length!=0){
            if (files && files.length > 0) {
                let uploadedFileURL = await uploadFile(files[0])
               profileImage = uploadedFileURL;
               reqData.profileImage=profileImage
            }
            else {
                return res.status(400).send({ message: "Profile Image not available" })
            }
        }
        // reqData.updatedAt = Date.now()



        let updated = await userModel.findOneAndUpdate({ _id: userId }, reqData, { new: true })
        return res.status(200).send({ status: true, message: 'User profile updated', Data: updated })


    }
    catch (err) {
        res.status(500).send({ message: err.message })
    }

}
module.exports = { createUser, loginUser, getUserdata, updateUser } 
