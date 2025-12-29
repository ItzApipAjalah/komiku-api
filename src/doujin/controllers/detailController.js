const detailService = require('../services/detailService');

/**
 * Controller for handling manga detail operations on KomikDewasa
 */
const detailController = {
    /**
     * Get manga detail
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getDetail: async (req, res) => {
        try {
            const url = req.query.url || req.query.slug || '';

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL or slug is required. Use ?url=https://komikdewasa.id/komik/slug'
                });
            }

            const detailData = await detailService.getDetail(url);

            res.status(200).json({
                success: true,
                data: detailData
            });
        } catch (error) {
            console.error('Error in detail controller (KomikDewasa):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get manga detail'
            });
        }
    }
};

module.exports = detailController;
