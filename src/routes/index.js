const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const mangaController = require('../controllers/mangaController');
const chapterController = require('../controllers/chapterController');
const recommendationController = require('../controllers/recommendationController');
const popularController = require('../controllers/popularController');
const genreController = require('../controllers/genreController');

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

// Genre routes
router.get('/genres', genreController.getAllGenres);
router.get('/genre', genreController.getMangaByGenre);

module.exports = router; 