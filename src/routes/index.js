const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const mangaController = require('../controllers/mangaController');
const chapterController = require('../controllers/chapterController');
const recommendationController = require('../controllers/recommendationController');
const popularController = require('../controllers/popularController');
const hotController = require('../controllers/hotController');
const genreController = require('../controllers/genreController');
const lastUpdateController = require('../controllers/lastUpdateController');
const customData = require('../utils/custom.json');

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

// Hot manga routes
router.get('/hot', hotController.getHotManga);

// Genre routes
router.get('/genres', genreController.getAllGenres);
router.get('/genre', genreController.getMangaByGenre);

// Last update routes
router.get('/last-update', lastUpdateController.getLastUpdates);

// Custom data route
router.get('/custom', (req, res) => {
    res.status(200).json(customData);
});

module.exports = router; 