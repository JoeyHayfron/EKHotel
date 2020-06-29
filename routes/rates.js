const express = require('express')
const router = express.Router()
const { Rate, validateRateData } = require('../model/rate')

router.get('/', async(req, res) => {
    const rate = await Rate.find()

    if(!rate)
    return res.status(400).send('No rates available')

    res.send(rate)
})


router.get('/:id', async(req, res) => {
    const rate = await Rate.findById(req.params.id)

    if(!rate)
    return res.status(400).send('Rate not found')

    res.send(rate)
})


router.post('/create', async(req, res) => {
    const validateData = validateRateData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const rateExist = await Rate.findOne({name: req.body.name})

    if(rateExist)
    return res.status(400).send('Rate with this name alredy exists')

    if(req.body.cancelation_fee == 'false')
        req.body.cancelation_fee_penalty = 0

    const rate = new Rate({
        name: req.body.name,
        bed_and_breakfast: req.body.bed_and_breakfast,
        cancelation_fee: req.body.cancelation_fee,
        cancelation_fee_penalty: req.body.cancelation_fee_penalty,
        down_payment_required: req.body.down_payment_required,
        reduction: req.body.reduction
    }) 

    await rate.save()

    res.send(rate)
})


router.put('/:id', async(req, res) => {
    const validateData = validateRateData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    let cancel_fee_penalty = (req.body.cancelation_fee == false) ? req.body.cancelation_fee_penalty : 0

    const rate = await Rate.findByIdAndUpdate({_id: req.params.id}, 
        {
            name: req.body.name,
            bed_and_breakfast: req.body.bed_and_breakfast,
            cancelation_fee: req.body.cancelation_fee,
            cancelation_fee_penalty: cancel_fee_penalty,
            down_payment_required: req.body.down_payment_required,
            reduction: req.body.reduction
        }, {new: true})

    if(!rate)
    return res.status(404).send('Rate not found')

    res.send(rate)

})


router.delete('/:id', async(req, res) => {
    const rate = await Rate.findByIdAndDelete(req.params.id)

    if(!rate)
    return res.status(404).send('Rate not found')

    res.send(rate)
})


module.exports = router