const lastUpdateService = require('../services/lastUpdateService');

/**
 * Controller for handling last update operations on KomikDewasa
 */
const lastUpdateController = {
    /**
     * Get latest updates
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getLastUpdate: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;

            const updateData = await lastUpdateService.getLastUpdate(page);

            res.status(200).json({
                success: true,
                data: updateData
            });
        } catch (error) {
            console.error('Error in lastUpdate controller (KomikDewasa):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get last update'
            });
        }
    }
};

module.exports = lastUpdateController;
