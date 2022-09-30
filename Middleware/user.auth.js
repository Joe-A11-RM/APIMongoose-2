const usermodel = require('../Models/user.model')
const jwt = require('jsonwebtoken')
const userAuth = async(req, res, next) => {
    try {
        const givenToken = req.header("Authorization").replace("Bearer ", "")
        const token = jwt.verify(givenToken, "random")
        console.log(token)
        const user = await usermodel.findById(token.id)
        console.log(user)
        if (!user.role == "User") {
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
module.exports = userAuth