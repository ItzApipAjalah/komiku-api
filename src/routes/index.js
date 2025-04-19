const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const mangaController = require('../controllers/mangaController');
const chapterController = require('../controllers/chapterController');
const recommendationController = require('../controllers/recommendationController');
const popularController = require('../controllers/popularController');

// Search routes
router.get('/search', searchController.search);

// Manga routes
router.get('/manga', mangaController.getMangaDetails);

// Chapter routes
router.get('/chapter', chapterController.getChapterDetails);

// Recommendation routes
router.get('/recommendations', recommendationController.getRecommendations);

// Popular manga routes
router.get('/popular', popularController.getPopularManga);

module.exports = router; 