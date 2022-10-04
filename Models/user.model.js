let mongoose = require('mongoose')
let emailvalidator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var nodemail = require("nodemailer")
var multer = require('multer')
const user = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validator(val) {
            if (!emailvalidator.isEmail(val)) {
                throw new Error("Not Email")
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    pincode: {
        type: Number
    },
    isActive: {
        type: String,
        enum: ["Activated", "Not Activated"],
        default: "Not Activated"
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    }
})
user.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
})
user.pre('save', async function(next) {
    let now = Date.now()
    this.updatedAt = now
    if (!this.createdAt) {
        this.createdAt = now
    }
    next()
})
user.methods.generateToken = async function() {
    const newtoken = await jwt.sign({ id: this._id }, "random")
    this.tokens = this.tokens.concat({ token: newtoken })
    await this.save()
    return newtoken
}
user.methods.CreatePin = async function() {
    this.pincode = Math.floor(Math.random() * 1000001)
}

user.methods.SendEmail = async function(pincode) {
    var via = nodemail.createTransport({
        service: 'gmail',
        auth: {
            user: "yousefcr72001@gmail.com",
            pass: "ciangguduivgbtzw"
        }
    })
    var options = {
        from: 'yousefcr72001@gmail.com',
        to: 'yousefsherif7500@gmail.com',
        subject: 'Checkpoint',
        text: `Your pincode + ${pincode}`
    }
    via.sendMail(options, function(err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log("Email Sent" + info.response)
        }
    })
}
user.methods.CheckActivity = async function() {
    if (this.isActive == "Not Activated") {
        throw new Error("Account not active")
    } else {
        console.log("Your Mail is active")
    }
}

module.exports = mongoose.model('User', user)