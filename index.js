require('express-async-errors')
const express = require('express')
const app = express()

const port = process.env.PORT || 3000   

require('./startup/logging')()
require('./startup/config')()
require('./startup/db')()
require('./startup/routes')(app)
require('./startup/validations')()

app.listen(port, () => console.log(`Listening on port ${port}`))