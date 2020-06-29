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
    
    const validateData = validateUserData(req.body)
    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const userExist = await User.findOne({email: req.body.email})
    if(userExist)
    return res.status(400).send('User already exists with this email')


    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password
    })

    const passwordSalt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(req.body.password, passwordSalt)

    const token = user.generateAuthToken()
    await user.save()
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'phone']))
})

router.put('/edit', auth, async(req, res) => {
    const validateData = validateUserData(req.body)
    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const userExist = await User.findOne({email: req.body.email})
    if(userExist)
    return res.status(400).send('User with this email already exists')

    const currentInfo = await User.findById({_id: req.user._id})
    const prevPassword = currentInfo.password

    const user = await User.findOneAndUpdate(req.user._id,
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

    res.send(user)
})


router.put('/edit/:id', auth, async(req, res) => {
    const validateData = validateUserData(req.body)
    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const userExist = await User.findOne({_id: req.params.id})
    if(!userExist)
    return res.status(404).send('User not found')

    // if(userExist.email === req.body.email)
    // return res.status(400).send('User with this email already exists')

    const prevPassword = userExist.password


    const user = await User.findOneAndUpdate(req.params._id,
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
    }else{
        user.password = prevPassword
        await user.save()
    }

    res.send(user)
})


router.delete('/remove_my_account', auth, async(req, res) => {
    const user = await User.findOneAndDelete(req.user._id)

    if(!user)
    return res.status(404).send('User not found')

    res.send(user)
})

router.delete('/remove_account/:id', auth, async(req, res) => {
    const user = await User.findOneAndDelete(req.params._id)

    if(!user)
    return res.status(404).send('User not found')

    res.send(user)
})


module.exports = router