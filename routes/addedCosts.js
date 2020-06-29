const express = require('express')
const router = express.Router()
const { AddedCost, validateAddedCostData, patchValidation } = require('../model/addedCost')
const { Booking } = require('../model/booking')


router.get('/', async(req, res) => {
    const cost = await AddedCost
                            .find()
                            .populate({path: 'bookingInfo', select: 'name email phone room check_in check_out'})

    if(!cost)
    return res.status(404).send('No extra charges found')

    console.log(cost[0].bookingInfo.name)

    res.send(cost)
})


router.get('/:id', async(req, res) => {
    const cost = await AddedCost
            .findById({_id: req.params.id})
            .populate({path: 'bookingInfo', select: 'name email phone room check_in check_out'})

        if(!cost)
        return res.status(404).send('No extra charges found')

        res.send(cost)
})


router.post('/add', async(req, res) => {
    const validateData = validateAddedCostData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const cost = new AddedCost({
        item: req.body.item,
        cost: req.body.cost,
        bookingInfo : req.body.bookingId
    })  

    await cost.save()
    
    res.send(await cost.execPopulate('bookingInfo', 'name email phone room check_in check_out'))           
})

router.patch('/:id', async(req, res) => {
    const validateData = patchValidation(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const cost = await AddedCost.findByIdAndUpdate({_id: req.params.id}, {$set: req.body}, {new: true})

    if(!cost)
    return res.status(404).send('Item not found')

    res.send(cost.execPopulate('bookingInfo', 'name email phone room check_in check_out'))
})

router.delete('/:id', async(req, res) => {
    const cost  = await AddedCost.findByIdAndDelete({_id: req.params.id})

    if(!cost)
    return res.status(404).send('Item not found')

    res.send(cost.execPopulate('bookingInfo', 'name email phone room check_in check_out'))
})

module.exports = router