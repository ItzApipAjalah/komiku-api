const mangaService = require('../services/mangaService');

/**
 * Manga controller for handling manga details requests
 */
const mangaController = {
  /**
   * Get manga details and chapter list
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getMangaDetails: async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const mangaDetails = await mangaService.getMangaDetails(url);
      res.json(mangaDetails);
    } catch (error) {
      console.error('Error fetching manga details:', error);
      res.status(500).json({ error: 'Failed to fetch manga details' });
    }
  }
};

module.exports = mangaController; 