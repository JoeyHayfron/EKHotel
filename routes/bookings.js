const express = require('express')
const router = express.Router()
const { Booking, validateBookingData, patchValidation } = require('../model/booking')
const { Rate } = require('../model/rate')
const { RoomType } = require('../model/roomType')
const { Room } = require('../model/room')
const Fawn = require('fawn')
const mongoose = require('mongoose')
Fawn.init(mongoose)

router.get('/', async(req, res) => {
    const booking = await Booking.find()

    if(!booking)
    return res.status(400).send('No bookings available')

    res.send(booking)
})


router.get('/:id', async(req, res) => {
    const booking = await Booking.findById(req.params.id)

    if(!booking)
    return res.status(404).send("Booking not found")
})


router.post('/create', async (req, res) => {
    const validateData = validateBookingData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const rate = await Rate.findById({_id: req.body.ratesId})

    if(!rate)
    return res.status(400).send('Rate with given id not found')

    const roomtype = await RoomType.findById({_id: req.body.roomTypeId})

    if(!roomtype)
    return res.status(400).send('RoomType with given id not found')

    let roomTypeName = roomtype.name.toString()

    const room = await Room.findOne({
        $and: [
            {"roomType.name":  roomtype.name}, 
            {status: 'Free'}
        ]
    })

    if(!room)
    return res.status(400).send('There are no available rooms of this room type')

    if(req.body.number_of_occupants > roomtype.occupant_limit)
    return res.status(400).send(`Number of occupants cannot be more than ${roomtype.occupant_limit}`)

    if(rate.down_payment_required == 'true' && req.amount_paid == 0)
    return res.status(400).send('Down payment is required for this rate type')

    const checkOut = new Date(req.body.check_out)
    const checkIn = new Date(req.body.check_in)

    let bookingCost = ((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)) * roomtype.rate_per_night

    if(rate.reduction > 0)
        bookingCost = bookingCost - (bookingCost * (rate.reduction / 100))
    
    let amountLeft = bookingCost - req.body.amount_paid

    console.log(bookingCost)

    const booking = new Booking({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        room: {
            _id: room._id,
            name: room.roomType.name,
            number: room.number,
            floor: room.floor,
            bed_name: room.roomType.beds.name,
            number_of_beds: room.roomType.beds.number,
            occupant_limit: room.roomType.occupant_limit,
            rate_per_night: room.roomType.rate_per_night,
            facilities: room.roomType.facilities
        },
        number_of_occupants: req.body.number_of_occupants,
        check_in: req.body.check_in,
        check_out: req.body.check_out,
        rates: {
            _id: rate._id,
            name: rate.name,
            bed_and_breakfast: rate.bed_and_breakfast,
            cancelation_fee: rate.cancelation_fee,
            cancelation_fee_penalty: rate.cancelation_fee_penalty,
            down_payment_required: rate.down_payment_required,
            reduction: rate.reduction
        },
        amount_paid: req.body.amount_paid,
        amount_left: amountLeft,
        booking_cost: bookingCost
    })

    new Fawn.Task()
                .save('bookings', booking)
                .update('rooms', { _id: room._id }, { $set: { status: 'Booked'} })
                .update('roomtypes', { _id: roomtype._id }, { $inc: { number_of_rooms_available: -1, number_of_booked_rooms: 1} })
                .run();
                res.send(booking);
})


router.patch('/:id', async(req, res) => {
    const validateData = patchValidation(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const currentBookingInfo = await Booking.findById({_id: req.params.id})

    //Checks to be done later
    if(req.body.ratesId != null)
    return res.status(400).send('Rate type cannot be changed after booking is done')

    if(req.body.roomTypeId != null)
    return res.status(400).send('Room Type cannot be changed once booked')
    //

    if(req.body.check_in != null && currentBookingInfo.status == 'Checked In')
    return res.status(400).send('Client has checked in already')

    if(req.body.check_out != null && currentBookingInfo.status == 'Checked Out')
    return res.status(400).send('Client has checked out already')


    //Check in and Check out info edited
    if(req.body.check_in != null && req.body.check_out == null && currentBookingInfo.status == 'Booked' && req.body.roomTypeId == null){
        const checkIn = new Date(req.body.check_in)
        const checkOut = new Date(currentBookingInfo.check_out)

        let days = ((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))
        req.body.booking_cost = days * currentBookingInfo.room.rate_per_night
        req.body.amount_left = req.body.booking_cost - currentBookingInfo.amount_paid
    }

    if(req.body.check_in == null && req.body.check_out != null && currentBookingInfo.status != 'Checked Out' && req.body.roomTypeId == null){
        const checkIn = new Date(currentBookingInfo.check_in)
        const checkOut = new Date(req.body.check_out)

        let days = ((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))
        req.body.booking_cost = days * currentBookingInfo.room.rate_per_night
        req.body.amount_left = req.body.booking_cost - currentBookingInfo.amount_paid
    }

    if(req.body.check_in != null && req.body.check_out != null && currentBookingInfo.status == 'Booked' && req.body.roomTypeId == null){
        const checkIn = new Date(req.body.check_in)
        const checkOut = new Date(req.body.check_out)

        let days = ((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))
        req.body.booking_cost = days * currentBookingInfo.room.rate_per_night
        req.body.amount_left = req.body.booking_cost - currentBookingInfo.amount_paid
    }

    if(req.body.number_of_occupants != null && req.body.number_of_occupants > currentBookingInfo.room.occupant_limit && req.body.roomTypeId == null)
    return res.status(400).send(`Occupant limit is ${currentBookingInfo.room.occupant_limit}`)

    const booking = await Booking.findByIdAndUpdate({_id:req.params.id}, {$set: req.body} ,{new: true })

    if(!booking)
    return res.status(404).send('Booking not found')

    res.send(booking)
})


router.delete('/:id', async(req, res) => {
    const booking = await Booking.findByIdAndDelete(req.params.id)

    if(!booking)
    return res.status(404).send('Booking not found')

    res.send(booking)
})

module.exports = router