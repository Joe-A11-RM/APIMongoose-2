const productmodel = require("../Models/product.model")
const usermodel = require('../Models/user.model')
const adminmodel = require('../Models/admin.model')
const bcrypt = require("bcrypt")
class Admin {
    static addadmin = async function(req, res) {
        try {
            let msg = await adminmodel.create(
                req.body
            )
            res.send(msg)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static loginadmin = async function(req, res) {
        try {
            let adminmail = await adminmodel.findOne({
                email: req.body.email
            })
            if (!adminmail) {
                throw new Error("Email Not Found")
            }
            const isPassword = await bcrypt.compare(req.body.password, adminmail.password)
            if (isPassword) {
                adminmail.generateToken()
                res.send(adminmail)
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static addproduct = async function(req, res) {
        try {
            let msg = await new productmodel({
                name: req.body.name,
                quantity: req.body.quantity,
                price: req.body.price,
                status: req.body.status
            })
            res.send(msg)
            await msg.save()
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static updateproduct = async function(req, res) {
        try {
            let updateitem = await productmodel.findOneAndUpdate({
                _id: req.params.id
            }, req.body, { runValidators: true })
            res.send(updateitem)
            console.log(updateitem)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static deleteproduct = async function(req, res) {
        try {
            let deleteitem = await productmodel.findOneAndDelete({
                _id: req.params.id
            })
            res.send(deleteitem)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static addUser = async(req, res) => {
        try {
            let msg = await new usermodel({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            })
            await msg.save()
            res.send(msg)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static updateuser = async function(req, res) {
        try {
            let userupdate = await usermodel.findOneAndUpdate({
                _id: req.params.id
            }, req.body)
            res.send(userupdate)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static deleteuser = async function(req, res) {
        try {
            let userdelete = await usermodel.findOneAndDelete({
                _id: req.params.id
            })
            res.send(userdelete)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
}
module.exports = Admin