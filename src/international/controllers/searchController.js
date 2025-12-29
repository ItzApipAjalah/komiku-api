const searchService = require('../services/searchService');

/**
 * Controller for handling search operations on WeebCentral
 * International manga source
 */
const searchController = {
    /**
     * Search manga
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    search: async (req, res) => {
        try {
            const query = req.query.q || req.query.query || '';

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required. Use ?q=your_query'
                });
            }

            const searchResults = await searchService.search(query);

            res.status(200).json({
                success: true,
                data: searchResults
            });
        } catch (error) {
            console.error('Error in search controller (WeebCentral):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to search manga'
            });
        }
    }
};

module.exports = searchController;
