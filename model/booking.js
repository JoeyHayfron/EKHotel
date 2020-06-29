const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);


const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    room: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true
            },
            number: {
                type: Number,
                required: true
            },
            floor: {
                type: Number,
                required: true
            },
            bed_name: {
                type: String,
                required: true
            },
            number_of_beds: {
                type: Number,
                required: true
            },
            occupant_limit: {
                type: Number,
                required: true
            },
            rate_per_night: {
                type: Number,
                required: true
            },
            facilities: {
                type: String,
                required: true
            }
        })
    },
    number_of_occupants: {
        type: Number,
        required: true
    },
    check_in: {
        type: Date,
        required: true,
    },
    check_out: {
        type: Date,
        required: true
    },
    rates: {
        type: new mongoose.Schema({
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
                    required: true
                },
                cancelation_fee_penalty: {
                    type: Number
                },
                down_payment_required: {
                    type: Boolean,
                    required: true
                },
                reduction: {
                    type: Number,
                    required: true
                }
            
        })
    },
    status: {
        type: String,
        required: true,
        default: 'Booked'
    },
    amount_paid: {
        type: Number,
        required: true
    },
    amount_left: {
        type: Number,
        required: true
    },
    booking_cost: {
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

const Booking = mongoose.model('bookings', bookingSchema)

function validateBookingData(booking){
    const schema = {
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        roomTypeId: Joi.objectId().required(),
        ratesId: Joi.objectId().required(),
        amount_paid: Joi.number().required(),
        number_of_occupants: Joi.number().required(),
        check_in: Joi.date().required(),
        check_out: Joi.date().required()
    }
    return Joi.validate(booking, schema)
}

function patchValidation(booking){
    const schema = {
        name: Joi.string(),
        email: Joi.string().email(),
        phone: Joi.string(),
        roomTypeId: Joi.objectId(),
        ratesId: Joi.objectId(),
        amount_paid: Joi.number(),
        number_of_occupants: Joi.number(),
        check_in: Joi.date(),
        check_out: Joi.date()
    }
    return Joi.validate(booking, schema)
}

module.exports.Booking = Booking
module.exports.validateBookingData = validateBookingData
module.exports.patchValidation = patchValidation