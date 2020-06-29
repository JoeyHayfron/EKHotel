const { Room, validateRoomData } = require('../model/room')
const { RoomType } = require('../model/roomType')
const _ = require('lodash')
const express = require('express')
const router = express.Router()

router.get('/', async(req, res) => {
    const room  = await Room.find()

    if(!room)
    return res.status(404).send('There are no rooms availabe')

    res.send(room)
})


router.get('/:id', async(req, res) => {
    const room = await Room.findById(req.params.id)

    if(!room)
    return res.status(404).send('Room not found')

    res.send(room)

})


router.post('/create', async (req, res) => {
    const validateData = validateRoomData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const roomExist = await Room.findOne({number: req.body.number})

    if(roomExist)
    return res.status(400).send('There is a room with this number')

    const roomType = await RoomType.findById(req.body.roomTypeId)

    if(!roomType)
    return res.status(400).send('Room Type not found')

    const room = new Room({
        number: req.body.number,
        floor: req.body.floor,
        roomType: {
            _id: roomType._id,
            name: roomType.name,
            beds: {
                name:roomType.beds.name,
                number: roomType.beds.number
            },
            occupant_limit: roomType.occupant_limit,
            rate_per_night: roomType.rate_per_night,
            facilities: roomType.facilities
        }
    })

    await room.save()

    res.send(room)

})


router.put('/:id', async (req, res) => {
    const validateData = validateRoomData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const roomType = await RoomType.findById(req.body.roomTypeId)

    if(!roomType)
    return res.status(400).send('Room Type not found')

    const room = await Room.findByIdAndUpdate({_id: req.params.id}, {
        number: req.body.number,
        floor: req.body.floor,
        image: req.body.image,
        roomType: {
            _id: roomType._id,
            name: roomType.name,
            beds: {
                name:roomType.beds.name,
                number: roomType.beds.number
            },
            occupant_limit: roomType.occupant_limit,
            rate_per_night: roomType.rate_per_night,
            facilities: roomType.facilities
        }
    }, { new : true})

    if(!room)
    return res.status(400).send('Room not found')

    res.send(room)
})

router.delete('/:id', async(req, res) => {
    const room = await Room.findByIdAndDelete(req.params.id)

    if(!room)
    return res.status(400).send('Room not found')

    res.send(room)
})

module.exports = router