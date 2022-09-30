let mongoose = require('mongoose')
const server = '127.0.0.1:27017'
const database = 'market'
class Database {
    connect() {
        mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log("Database Connection Successfull")
            }).catch((err) => {
                console.log("Database Failed")
            })
    }
}
module.exports = new Database()