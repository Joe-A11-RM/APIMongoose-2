const usermodel = require("../Models/user.model")
const cartmodel = require("../Models/cart.model")
const productmodel = require("../Models/product.model")
const bcrypt = require("bcrypt")
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const path = require('path')
var async = require('async');
var ObjectId = require('mongodb').ObjectID;

const now = new Date()
const validationhours = 0.3
let Calculate = async(cart) => {
    var subtotal = 0
    for (let product of cart.productsid) {
        subtotal = subtotal + (product.productid.price * product.size)
    }
    return subtotal
}

let CheckAvailable = async(cart) => {
    for (let product of cart.productsid) {
        if (product.productid.status == "Out of Stock") {
            return false
        } else {
            return true
        }
    }
}

let CheckQuantity = async(cart) => {
    for (let product of cart.productsid) {
        if (product.size > product.productid.quantity) {
            return false
        } else {
            return true
        }
    }
}
class UserController {
    static addUser = async(req, res) => {
        try {
            let msg = await new usermodel({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                //image informations
                fileName: req.file.originalname,
                filePath: req.file.path,
                fileType: req.file.mimetype
            })
            msg.CreatePin()
            msg.SendEmail(msg.pincode)
            await msg.save()
            res.send(msg)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static changestatus = async(req, res) => {
        try {
            const userstatus = await usermodel.findOne({
                _id: req.params.id
            })
            if (!userstatus) {
                throw new Error("Email Not Found")
            }
            if (req.body.pincode == userstatus.pincode) {
                const diff = Math.abs(now - userstatus.updatedAt) / 36e5
                console.log(diff)
                if (diff >= validationhours) {
                    userstatus.CreatePin()
                    userstatus.SendEmail
                    await userstatus.save()
                    throw new Error("Pincode is invalid, Check Your mail for new PinCode")
                } else {
                    userstatus.isActive = "Activated"
                    await userstatus.save()
                    res.send(userstatus)
                }
            } else {
                throw new Error("Pincode not right")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static findUser = async(req, res) => {
        try {
            let getuser = await usermodel.findOne({
                _id: req.params.id
            })
            res.send(getuser)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static updateUserImage = async(req, res) => {
        try {
            let updateitem = await usermodel.findOneAndUpdate({
                    _id: req.params.id
                }, {
                    fileName: req.file.originalname,
                    filePath: req.file.path,
                    fileType: req.file.mimetype
                }
                //req.body
            )
            console.log(updateitem.fileName)
            console.log(req.file.originalname)
            if (updateitem.fileName != req.file.originalname) {
                const root = `uploads/${updateitem.fileName}`
                fs.unlink(root, (err) => {
                    console.log(err)
                })

                console.log("not same")
            } else {
                console.log("same")
            }
            await updateitem.save()
            res.send(updateitem)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static updateUserInformation = async(req, res) => {
        try {
            let updateitem = await usermodel.findOneAndUpdate({
                _id: req.params.id
            }, req.body)
            await updateitem.save()
            res.send(updateitem)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static deleteUser = async(req, res) => {
        try {
            let deleteditem = await usermodel.findOneAndDelete({
                _id: req.params.id
            }, )
            res.send(deleteditem)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static login = async(req, res) => {
        try {
            const usermail = await usermodel.findOne({
                    email: req.body.email
                })
                //console.log(req.body.password)
                //console.log(usermail.password)
            if (!usermail) {
                throw new Error("Email Not Found")
            }
            const isPassword = await bcrypt.compare(req.body.password, usermail.password)
            if (isPassword) {
                if (usermail.isActive == "Not Activated") {
                    throw new Error("Your Mail is not active")
                }
                usermail.generateToken()
                res.send(usermail)
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static AddtoCart = async(req, res) => {
        try {
            let finduser = await cartmodel.findOne({
                userid: req.user._id
            })
            if (finduser == null) {
                let cart = await new cartmodel({
                    userid: req.user._id,
                    productsid: [{
                        productid: req.body.productid,
                        size: req.body.size
                    }],
                }).populate({ path: "productsid.productid", strictPopulate: false })
                if (!(await CheckAvailable(cart))) {
                    throw new Error("Not Available")
                }
                if (!(await CheckQuantity(cart))) {
                    throw new Error("This Amount is not avaliable")
                }
                cart.totalprice = await Calculate(cart)
                await cart.save()
                res.send(cart)
            } else {
                for (let product of finduser.productsid) {
                    if (product.productid == req.body.productid) {
                        product.size = req.body.size
                        await finduser.populate({ path: "productsid.productid", strictPopulate: false })
                        if (!(await CheckAvailable(finduser))) {
                            throw new Error("Not Available")
                        }
                        if (!(await CheckQuantity(finduser))) {
                            throw new Error("This Amount is not avaliable")
                        }
                        finduser.totalprice = await Calculate(finduser)
                        await finduser.save()
                        res.send(finduser)
                        return
                    }
                }
                finduser.productsid.push({
                    productid: req.body.productid,
                    size: req.body.size
                })
                await finduser.populate({ path: "productsid.productid", strictPopulate: false })
                if (!(await CheckAvailable(finduser))) {
                    throw new Error("Not Available")
                }
                if (!(await CheckQuantity(finduser))) {
                    throw new Error("This Amount is not avaliable")
                }
                finduser.totalprice = await Calculate(finduser)
                await finduser.save()
                res.send(finduser)
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static DeletefromCart = async(req, res) => {
        try {
            let findusercart = await cartmodel.findOne({
                userid: req.user._id
            })
            if (findusercart != null) {
                findusercart.productsid.pop({
                    productid: req.body.productid
                })
            }
            await findusercart.populate({ path: "productsid.productid", strictPopulate: false })
            findusercart.totalprice = await Calculate(findusercart)
            await findusercart.save()
            res.send(findusercart)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static PlaceOrder = async(req, res) => {
        try {
            let findusercart = await cartmodel.findOne({
                userid: req.user._id
            })
            if (findusercart != null) {
                for (let product of findusercart.productsid) {
                    var productQuantity = await productmodel.findOne({
                        _id: product.productid
                    })
                    productQuantity.quantity = productQuantity.quantity - product.size
                    if (productQuantity.quantity == 0) {
                        productQuantity.status = "Out of Stock"
                    }

                    await productQuantity.save()
                }
                findusercart = await cartmodel.deleteOne({ userid: req.user._id })
                res.send(productQuantity)

            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static ShowCart = async(req, res) => {
        var subtotal = 0
        try {
            let show = await cartmodel.findById({
                    _id: "6343634e4eb341ff47878929"
                }).populate({ path: "productid", strictPopulate: false })
                //console.log(show.productid[1].price)
            for (let product of show.productid) {
                console.log(product)
                subtotal = subtotal + (product.price * show.size)
            }
            console.log(subtotal)
            res.send(show)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
}

module.exports = UserController