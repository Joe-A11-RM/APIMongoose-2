let mongoose = require('mongoose')
let emailvalidator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const admin = mongoose.Schema({
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
        default: "Admin"
    },
    tokens: [{
        token: {
            type: String
        }
    }]
})
admin.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
})

admin.methods.generateToken = async function() {
    const newtoken = await jwt.sign({ id: this._id }, "random")
    this.tokens = this.tokens.concat({ token: newtoken })
    await this.save()
    return newtoken
}

module.exports = mongoose.model("Admin", admin)