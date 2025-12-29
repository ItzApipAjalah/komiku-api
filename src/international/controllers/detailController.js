const detailService = require('../services/detailService');

/**
 * Controller for handling manga detail operations on WeebCentral
 */
const detailController = {
    /**
     * Get manga detail
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getDetail: async (req, res) => {
        try {
            const url = req.query.url || '';

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL is required. Use ?url=https://weebcentral.com/series/ID/slug'
                });
            }

            const detailData = await detailService.getDetail(url);

            res.status(200).json({
                success: true,
                data: detailData
            });
        } catch (error) {
            console.error('Error in detail controller (WeebCentral):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get manga detail'
            });
        }
    }
};

module.exports = detailController;
