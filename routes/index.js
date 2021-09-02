const express = require('express')
const router = express.Router()
const upload = require('./uploadRouter')
router.use('/',upload)

module.exports = router
