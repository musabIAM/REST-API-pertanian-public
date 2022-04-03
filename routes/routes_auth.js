var express = require('express')
var router = express.Router()

var basicController = require('../controller/auth_controller')
router.post('/login', basicController.login)


module.exports = router