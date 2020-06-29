const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const cancelSchema = new mongoose.Schema({
    bookingInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings'
    },
    created:{
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date
    }
})

const Cancel = mongoose.model('cancels', cancelSchema)

function validateCancelData(cancel){
    const schema = {
        bookingId: Joi.objectId().required()
    }
    return Joi.validate(cancel, schema)
}

module.exports.Cancel = Cancel
module.exports.validateCancelData = validateCancelData