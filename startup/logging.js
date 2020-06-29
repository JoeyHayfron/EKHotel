const winston = require('winston')
require('winston-mongodb')

module.exports = function(){
    winston.exceptions.handle(
        new winston.transports.Console({colorize: true, prettyPrint: true}),
        new winston.transports.File({filename: 'uncaughtExceptions.log'})
    )
    process.on('unhandledRejection',(ex) => {
        throw ex
    })
    winston.add(new winston.transports.Console({level: 'info', colorize: true, prettyPrint: true}))
    winston.add(new winston.transports.File({level: 'warn', filename: 'logs.log'}))
    winston.add(new winston.transports.MongoDB({level: 'warn', db: 'mongodb://localhost/ekHotels'}))
}