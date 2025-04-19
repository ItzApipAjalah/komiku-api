const searchService = require('../services/searchService');

/**
 * Search controller for handling search requests
 */
const searchController = {
  /**
   * Search for manga based on query
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  search: async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ 
          success: false, 
          message: 'Search query is required' 
        });
      }

      const results = await searchService.searchManga(query);
      
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Search error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while searching',
        error: error.message
      });
    }
  }
};

module.exports = searchController; 