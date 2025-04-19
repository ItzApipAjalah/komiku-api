const chapterService = require('../services/chapterService');

/**
 * Chapter controller for handling chapter details requests
 */
const chapterController = {
  /**
   * Get chapter details and images
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getChapterDetails: async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const chapterDetails = await chapterService.getChapterDetails(url);
      res.json(chapterDetails);
    } catch (error) {
      console.error('Error fetching chapter details:', error);
      res.status(500).json({ error: 'Failed to fetch chapter details' });
    }
  }
};

module.exports = chapterController; 