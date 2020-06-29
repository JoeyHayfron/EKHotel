const mongoose = require('mongoose')
const Joi = require('joi')
const config = require('config')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
    name : {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date
    }
})

adminSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id, name: this.name, phone: this.phone, email: this.email}, config.get('jwtPrivateKey'))
    return token
}

const Admin = mongoose.model('admin', adminSchema)

function validateAdminData(admin){
    const schema = {
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().min(10).max(13).required(),
        password: Joi.string().min(4).required()
    }
    return Joi.validate(admin, schema)
}

module.exports.Admin = Admin
module.exports.validateAdminData = validateAdminData