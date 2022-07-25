const userModel = require("../models/userModel")  // importing the module that contains the user schema
const jwt = require('jsonwebtoken')

const loginUser = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if ( !email || !password ) return res.status(400).send({ status: false, msg: "Provide the email and password to login." })  // if either email, password or both not present in the request body.

        if (!emailRegex.test(email))  // --> email should be provided in right format
            return res.status(400).send({ status: false, message: "Please enter a valid emailId. ⚠️" })

        let user = await userModel.findOne( { email: email, password: password } )  // to find that particular user document.
        if ( !user ) return res.status(401).send({ status: false, msg: "Email or password is incorrect." })  // if the user document isn't found in the database.
        let data=user._id
        let token = jwt.sign(  // --> to generate the jwt token
            {
                userId: user._id.toString(),                            // --> payload
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2),     // --> expiry set for 2 hours
                iat: Math.floor(Date.now() / 1000)
            },
            "Bhushan-Jiyalal-Ritesh-Himashu"                             // --> secret key
        )

        res.setHeader("x-api-key", token)  // to send the token in the header of the browser used by the user.
        return res.status(200).send({ status: true, message: 'Success', data: token })  // token is shown in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}