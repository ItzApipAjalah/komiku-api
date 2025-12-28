const popularService = require('../services/popularService');

/**
 * Controller for handling popular manga operations
 */
const popularController = {
  /**
   * Get popular manga by category and page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPopularManga: async (req, res) => {
    try {
      // Get category, page, and sorttime from query parameters
      const category = req.query.category || 'manga';
      const page = parseInt(req.query.page) || 1;
      const sorttime = req.query.sorttime || 'all';

      const popularData = await popularService.getPopularManga(category, page, sorttime);

      res.status(200).json({
        success: true,
        data: popularData
      });
    } catch (error) {
      console.error('Error in getPopularManga controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch popular manga'
      });
    }
  }
};

module.exports = popularController; 