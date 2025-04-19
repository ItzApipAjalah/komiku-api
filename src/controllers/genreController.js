const genreService = require('../services/genreService');

/**
 * Controller for handling genre-based manga operations
 */
const genreController = {
  /**
   * Get manga by genre and category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getMangaByGenre: async (req, res) => {
    try {
      // Get genre, category, and page from query parameters
      const { genre, category = 'manga', page = 1 } = req.query;
      
      if (!genre) {
        return res.status(400).json({
          success: false,
          message: 'Genre parameter is required'
        });
      }
      
      const genreData = await genreService.getMangaByGenre(genre, category, parseInt(page));
      
      res.status(200).json({
        success: true,
        data: genreData
      });
    } catch (error) {
      console.error('Error in getMangaByGenre controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch manga by genre'
      });
    }
  },
  
  /**
   * Get list of all available genres
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllGenres: (req, res) => {
    try {
      const genres = genreService.getAllGenres();
      
      res.status(200).json({
        success: true,
        data: genres
      });
    } catch (error) {
      console.error('Error in getAllGenres controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch genres'
      });
    }
  }
};

module.exports = genreController; 