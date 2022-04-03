var express = require('express')
var router = express.Router()

var basicController = require('../controller/basic')
router.post('/tampilLahan', basicController.tampil_lahan)
router.post('/filterlog', basicController.filter_log)
router.post('/filterlahan', basicController.filter_lahan)


module.exports = router