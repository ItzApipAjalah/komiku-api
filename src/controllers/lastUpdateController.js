const lastUpdateService = require('../services/lastUpdateService');

/**
 * Controller for handling last update manga operations
 */
const lastUpdateController = {
  /**
   * Get last updated manga by category and page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getLastUpdates: async (req, res) => {
    try {
      // Get category and page from query parameters
      const { category = 'manga', page = 1 } = req.query;
      
      const lastUpdates = await lastUpdateService.getLastUpdates(category, parseInt(page));
      
      res.status(200).json({
        success: true,
        data: lastUpdates
      });
    } catch (error) {
      console.error('Error in getLastUpdates controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch last updates'
      });
    }
  }
};

module.exports = lastUpdateController; 