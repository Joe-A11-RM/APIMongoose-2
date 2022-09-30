const adminmodel = require('../Models/admin.model')
const jwt = require('jsonwebtoken')
const adminAuth = async(req, res, next) => {
    try {
        const givenToken = req.header("Authorization").replace("Bearer ", "")
        const token = jwt.verify(givenToken, "random")
        console.log(token)
        const admin = await adminmodel.findById(token.id)
        console.log(admin)
        if (!admin.role == "Admin") {
            throw new Error("Not User")
        }
        next()
    } catch (error) {
        res.send({
            apiStatus: false,
            message: error.message
        })
    }
}
module.exports = adminAuth