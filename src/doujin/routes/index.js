const express = require('express');
const router = express.Router();
const lastUpdateController = require('../controllers/lastUpdateController');
const detailController = require('../controllers/detailController');
const chapterController = require('../controllers/chapterController');
const chapterV2Controller = require('../controllers/chapterV2Controller');

// Last update routes
router.get('/last-update', lastUpdateController.getLastUpdate);

// Detail routes
router.get('/detail', detailController.getDetail);

// Chapter routes (KomikDewasa)
router.get('/chapter', chapterController.getChapter);

// Chapter V2 routes (ManhwaDesu - alternative source)
router.get('/v2/chapter', chapterV2Controller.getChapter);

module.exports = router;
