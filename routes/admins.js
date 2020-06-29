const { Admin, validateAdminData } = require('../model/admin')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const _ = require('lodash')
const auth = require('../middleware/auth')


router.get('/', auth, async (req, res) =>{
    const admin = await Admin.find()

    if(!admin)
    return res.status(404).send('No admins found')

    res.send(admin)
})


router.get('/me', auth, async(req, res) => {
    const admin = await Admin.findOne({_id: req.user._id})

    if(!admin)
    return res.status(404).send('Admin not found')

    res.send(admin)
})


router.get('/:id', async(req, res) =>{
    const admin = await Admin.findOne({_id: req.params.id})

    if(!admin)
    return res.status(404).send('Admin not found')

    res.send(admin)
})

router.post('/register', async (req, res) => {
    
    const validateData = validateAdminData(req.body)
    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const adminExist = await Admin.findOne({email: req.body.email})
    if(adminExist)
    return res.status(400).send('Admin already exists with this email')


    const admin = new Admin({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password
    })

    const passwordSalt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(req.body.password, passwordSalt)

    const token = user.generateAuthToken()
    await user.save()
    res.header('x-auth-token', token).send(_.pick(admin, ['_id', 'name', 'email', 'phone']))
})

router.put('/edit', auth, async(req, res) => {
    const validateData = validateAdminData(req.body)
    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const adminExist = await Admin.findOne({email: req.body.email})
    if(adminExist)
    return res.status(400).send('Admin with this email already exists')

    const currentInfo = await Admin.findById({_id: req.user._id})
    const prevPassword = currentInfo.password

    const admin = await Admin.findOneAndUpdate(req.user._id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            updated: Date.now()
        }, {new: true})
    
    const passwordNotChanged = await bcrypt.compare(req.body.password, prevPassword)
    
    if(!passwordNotChanged){
        const passwordSalt = await bcrypt.genSalt(10)
        const newPassword = await bcrypt.hash(passwordSalt, passwordSalt)
        user.password = newPassword
        await user.save()
    }

    res.send(admin)
})


router.put('/edit/:id', auth, async(req, res) => {
    const validateData = validateAdminData(req.body)
    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const adminExist = await Admin.findOne({_id: req.params.id})
    if(!adminExist)
    return res.status(404).send('Admin not found')

    // if(userExist.email === req.body.email)
    // return res.status(400).send('User with this email already exists')

    const prevPassword = userExist.password


    const admin = await Admin.findOneAndUpdate(req.params._id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            updated: Date.now()
        }, {new: true})
    
    const passwordNotChanged = await bcrypt.compare(req.body.password, prevPassword)
    
    if(!passwordNotChanged){
        const passwordSalt = await bcrypt.genSalt(10)
        const newPassword = await bcrypt.hash(passwordSalt, passwordSalt)
        admin.password = newPassword
        await admin.save()
    }else{
        admin.password = prevPassword
        await admin.save()
    }

    res.send(admin)
})


router.delete('/remove_my_account', auth, async(req, res) => {
    const admin = await Admin.findOneAndDelete(req.user._id)

    if(!admin)
    return res.status(404).send('Admin not found')

    res.send(admin)
})

router.delete('/remove_account/:id', auth, async(req, res) => {
    const admin = await Admin.findOneAndDelete(req.params._id)

    if(!admin)
    return res.status(404).send('Admin not found')

    res.send(admin)
})


module.exports = router