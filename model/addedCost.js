const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const addedCostSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    bookingInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings'
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date
    }
})

const AddedCost = mongoose.model('addedCost', addedCostSchema)

function validateAddedCostData(addedcost){
    const schema = {
        item: Joi.string().required(),
        cost: Joi.number().required(),
        bookingId: Joi.objectId().required()
    }

    return Joi.validate(addedcost, schema)
}

function patchValidation(addedcost){
    const schema = {
        item: Joi.string(),
        cost: Joi.number(),
        bookingId: Joi.objectId()
    }
    return Joi.validate(addedcost, schema)
}

module.exports.AddedCost = AddedCost
module.exports.validateAddedCostData = validateAddedCostData
module.exports.patchValidation = patchValidation