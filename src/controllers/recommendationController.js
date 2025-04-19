const recommendationService = require('../services/recommendationService');

/**
 * Controller for handling manga recommendations
 */
const recommendationController = {
  /**
   * Get manga recommendations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getRecommendations: async (req, res) => {
    try {
      const recommendations = await recommendationService.getRecommendations();
      
      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error in getRecommendations controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch recommendations'
      });
    }
  }
};

module.exports = recommendationController; 