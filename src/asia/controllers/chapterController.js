const chapterService = require('../services/chapterService');

/**
 * Controller for handling chapter view operations on WestManga
 */
const chapterController = {
    /**
     * Get chapter content
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getChapter: async (req, res) => {
        try {
            const url = req.query.url || req.query.slug || '';

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL or slug is required. Use ?url=https://westmanga.me/view/slug or ?slug=chapter-slug'
                });
            }

            const chapterData = await chapterService.getChapter(url);

            res.status(200).json({
                success: true,
                data: chapterData
            });
        } catch (error) {
            console.error('Error in chapter controller (WestManga):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get chapter'
            });
        }
    }
};

module.exports = chapterController;
