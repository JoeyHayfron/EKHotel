const { RoomType, validateRoomTypeData } = require('../model/roomType')
const express = require('express')
const router = express.Router()
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname.replace(/ /g,''))
    }
  })
var upload = multer({ storage: storage })


router.get('/', async(req, res) => {
    const roomType = await RoomType.find()

    if(!roomType)
    return res.status(404).send('No Room Types found')

    res.send(roomType)
})


router.get('/:id', async (req, res) => {
    const roomType = await RoomType.findById(req.params.id)

    if(!roomType)
    return res.status(404).send('Room Type not found')

    res.send(roomType)
})


router.post('/create', upload.single('image'),async (req, res) => {
    const validateData = validateRoomTypeData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)


    const roomTypeExist = await RoomType.findOne({name: req.body.name})
    
    if(roomTypeExist)
    return res.status(400).send('This Room Type already exists')



    const roomType = new RoomType({
        name: req.body.name,
        image: req.file.path,
        beds:{
            name: req.body.bed_name,
            number: req.body.number_of_beds
        },
        occupant_limit: req.body.occupant_limit,
        rate_per_night: req.body.rate_per_night,
        facilities: req.body.facilities,
        number_of_rooms_available: req.body.available_rooms,
        number_of_booked_rooms: req.body.booked_rooms
    })

    await roomType.save()

    res.send(roomType)
})


router.put('/edit/:id', upload.single('image'), async(req, res) => {
    const validateData = validateRoomTypeData(req.body)

    if(validateData.error)
    return res.status(400).send(validateData.error.details[0].message)

    const findRoomType = await RoomType.findById(req.params.id)

    if(!findRoomType)
    return res.status(404).send('Room Type does not exist')

    if(req.file == null){
        let imageInfo = findRoomType.image
    }
    else{
        imageInfo = req.file.path
    }

    const roomtype = await RoomType.findOne({name: req.body.name})

    if(roomtype._id.toString() != findRoomType._id.toString())
    return res.status(400).send('Room with this name exists')


    const roomType = await RoomType.findByIdAndUpdate({_id: req.params.id},
        {
            name: req.body.name,
            image: imageInfo,
            beds:{
            name: req.body.bed_name,
            number: req.body.number_of_beds
            },
            occupant_limit: req.body.occupant_limit,
            rate_per_night: req.body.rate_per_night,
            facilities: req.body.facilities,
            number_of_rooms_available: req.body.available_rooms,
            number_of_booked_rooms: req.body.booked_rooms
        }, { new: true })

    res.send(roomType)
})

router.delete('/delete/:id', async(req, res) => {
    const roomType = await RoomType.findByOneAndDelete(req.params.id)

    if(!roomType)
    return res.status(404).send('Room Type not found')

    res.send(roomType)
})


module.exports = router