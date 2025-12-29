const asiaSearchService = require('../services/searchService');

/**
 * Controller for handling search operations on WestManga
 */
const asiaSearchController = {
    /**
     * Search manga
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    search: async (req, res) => {
        try {
            const query = req.query.q || req.query.query || '';
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.per_page) || 40;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required. Use ?q=your_query'
                });
            }

            const searchResults = await asiaSearchService.search(query, page, perPage);

            res.status(200).json({
                success: true,
                data: searchResults
            });
        } catch (error) {
            console.error('Error in search controller (WestManga):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to search manga'
            });
        }
    }
};

module.exports = asiaSearchController;
