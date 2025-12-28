const hotService = require('../services/hotService');

/**
 * Controller for handling hot manga operations
 */
const hotController = {
    /**
     * Get hot manga by page
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getHotManga: async (req, res) => {
        try {
            // Get page from query parameters
            const page = parseInt(req.query.page) || 1;

            const hotData = await hotService.getHotManga(page);

            res.status(200).json({
                success: true,
                data: hotData
            });
        } catch (error) {
            console.error('Error in getHotManga controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch hot manga'
            });
        }
    }
};

module.exports = hotController;
