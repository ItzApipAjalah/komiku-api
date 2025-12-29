const chapterV2Service = require('../services/chapterV2Service');

/**
 * Controller for handling chapter view operations on ManhwaDesu (V2)
 */
const chapterV2Controller = {
    /**
     * Get chapter content from ManhwaDesu
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getChapter: async (req, res) => {
        try {
            const slug = req.query.slug || req.query.url || '';

            if (!slug) {
                return res.status(400).json({
                    success: false,
                    message: 'Slug is required. Use ?slug=manga-name-chapter-X'
                });
            }

            const chapterData = await chapterV2Service.getChapter(slug);

            res.status(200).json({
                success: true,
                data: chapterData
            });
        } catch (error) {
            console.error('Error in chapter V2 controller (ManhwaDesu):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get chapter'
            });
        }
    }
};

module.exports = chapterV2Controller;
