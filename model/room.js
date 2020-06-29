const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);


const roomSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    roomType: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true
            },
            beds: {
                name:{
                    type: String,
                    required: true
                },
                number: {
                    type: String,
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
            }
        })
    },
    status: {
        type: String,
        default: "Free"
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date
    }
})

const Room = mongoose.model('room', roomSchema)

function validateRoomData(room){
    const schema = {
        number: Joi.string().required(),
        floor: Joi.number().required(),
        roomTypeId: Joi.objectId().required()
    }
    return Joi.validate(room, schema)
}

module.exports.Room = Room
module.exports.validateRoomData = validateRoomData