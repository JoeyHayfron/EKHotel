const mongoose = require('mongoose')
const config = require('config')
const winston = require('winston')


module.exports = function () {
    mongoose.connect(config.get("db"), {useNewUrlParser : true})
            .then(() => winston.info("Connected to MongoDB"))
}