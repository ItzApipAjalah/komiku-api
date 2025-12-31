const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const detailController = require('../controllers/detailController');
const chapterController = require('../controllers/chapterController');
const lastUpdateController = require('../controllers/lastUpdateController');

// Search routes
router.get('/search', searchController.search);

// Detail routes
router.get('/detail', detailController.getDetail);

// Chapter routes
router.get('/chapter', chapterController.getChapter);

// Last update routes
router.get('/last-update', lastUpdateController.getLastUpdates);

module.exports = router;

