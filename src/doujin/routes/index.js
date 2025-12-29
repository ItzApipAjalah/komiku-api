const express = require('express');
const router = express.Router();
const lastUpdateController = require('../controllers/lastUpdateController');
const detailController = require('../controllers/detailController');
const chapterController = require('../controllers/chapterController');

// Last update routes
router.get('/last-update', lastUpdateController.getLastUpdate);

// Detail routes
router.get('/detail', detailController.getDetail);

// Chapter routes
router.get('/chapter', chapterController.getChapter);

module.exports = router;
