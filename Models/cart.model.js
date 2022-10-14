const mongoose = require('mongoose')
const cart = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    productsid: [{
        productid: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Product"
        },
        size: {
            type: Number,
            required: true,
        }
    }],
    totalprice: {
        type: Number,
        required: true
    }
})
module.exports = mongoose.model("Cart", cart)