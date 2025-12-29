const chapterService = require('../services/chapterService');

/**
 * Controller for handling chapter view operations on WeebCentral
 */
const chapterController = {
    /**
     * Get chapter content
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getChapter: async (req, res) => {
        try {
            const url = req.query.url || '';

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL is required. Use ?url=https://weebcentral.com/chapters/ID'
                });
            }

            const chapterData = await chapterService.getChapter(url);

            res.status(200).json({
                success: true,
                data: chapterData
            });
        } catch (error) {
            console.error('Error in chapter controller (WeebCentral):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get chapter'
            });
        }
    }
};

module.exports = chapterController;
