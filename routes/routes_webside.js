var express = require('express')
var router = express.Router()

var basicController = require('../controller/dashboard_webside')
router.get('/dataDashbord', basicController.findAllUser)
router.post('/filterLahan', basicController.filterlahan)
router.post('/filterLahanByJenis', basicController.filterlahanBy)
router.post('/filterlog',basicController.filterLog)
router.get('/tanaman/index', basicController.tanaman_index)
router.post('/filterLogBookByName', basicController.filterLogByLahanName)
router.get('/tanaman/show/:name', basicController.tanaman_show)

// 
module.exports = router