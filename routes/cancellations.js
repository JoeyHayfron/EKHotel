const express = require('express')
const router = express.Router()
const { Cancel, validateCancelData } = require('../model/cancellation')
const { Booking } = require('../model/booking')

router.get('/', async(req, res) => {
    const cancel = await Cancel.find()

    if(!cancel)
    return res.status(404).send('No cancelations found')

    res.send(cancel)
})

router.get('/:id', async(req, res) => {
    const cancel = await Cancel.findById({_id: req.params.id})

    if(!cancel)
    return res.status(404).send('No cancelations found')

    res.send(cancel)
})

router.post('/cancel_entry', async(req, res) => {
    const validateData = validateCancelData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const cancel = new Cancel({
        bookingInfo: req.body.bookingId
    })

  await cancel.save()

  const booking = await Booking.findByIdAndUpdate({ _id: req.body.bookingId}, {$set: {status: 'Canceled'}}, {new: true})
  res.send(await cancel.execPopulate('bookingInfo', 'name email phone room check_in check_out'))
})

router.delete('/:id', async(req, res) => {
    const cancel = await Cancel.findByIdAndDelete({_id: req.params.id})

    if(!cancel)
    return res.status(404).send('No cancelations found')

    res.send(cancel)
})

module.exports = router