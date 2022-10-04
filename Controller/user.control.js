const usermodel = require("../Models/user.model")
const bcrypt = require("bcrypt")
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const path = require('path')
const now = new Date()
const validationhours = 0.3
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
}
module.exports = UserController