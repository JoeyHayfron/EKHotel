const mongoose = require('mongoose')
const Joi = require('joi')

const roomTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    beds: {
        name: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true
        }
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
    },
    number_of_rooms_available:{
        type: Number,
        required: true
    },
    number_of_booked_rooms: {
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

const RoomType = mongoose.model('roomType', roomTypeSchema)

function validateRoomTypeData(roomType){
    const schema = {
        name: Joi.string().required(),
        bed_name: Joi.string().required(),
        number_of_beds: Joi.number().required(),
        occupant_limit: Joi.number().required(),
        rate_per_night: Joi.number().required(),
        facilities: Joi.string().required(),
        available_rooms: Joi.number().required(),
        booked_rooms: Joi.number().required()
    }
    return Joi.validate(roomType, schema)
}

module.exports.RoomType = RoomType
module.exports.validateRoomTypeData = validateRoomTypeData