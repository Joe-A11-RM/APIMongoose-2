const mongoose = require('mongoose')
const product = mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            min: 0,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["In Stock", "Out of Stock"]
        }
    })
    /*product.pre('findOneAndUpdate', async function() {
        this.setOptions({ runValidators: true })
    })*/
module.exports = mongoose.model("Product", product)