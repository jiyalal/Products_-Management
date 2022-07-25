const mongoose = require("mongoose")

const useSchema = new mongoose.Schema({



    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: {
        type: String,
        required: true,
    }, // s3 link
    phone: {
        typr: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLen: 8,
        maxLen: 15
    }, // encrypted password
    address: {
        shipping: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            }
        },
        billing: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            }
        }
    },
    createdAt: { timestamp },
    updatedAt: { timestamp }
})

module.exports = mongoose.module("user,userSchema")