const mongoose = require('mongoose')
const Joi = require('joi')

const rateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    bed_and_breakfast: {
        type: Boolean,
       required: true
    },
    cancelation_fee: {
        type: Boolean,
        required: true,
        default: false
    },
    cancelation_fee_penalty: {
        type: Number,
        default:  0
    },
    down_payment_required: {
        type: Boolean,
        required: true
    },
    reduction: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date
    }
})

const Rate = mongoose.model('rate', rateSchema)

function validateRateData(rate){
    const schema = {
        name: Joi.string().required(),
        bed_and_breakfast: Joi.boolean().required(),
        cancelation_fee: Joi.boolean().required(),
        cancelation_fee_penalty: Joi.number(),
        down_payment_required: Joi.boolean().required(),
        reduction: Joi.number().required()
    }

    return Joi.validate(rate, schema)
}

module.exports.Rate = Rate
module.exports.validateRateData = validateRateData