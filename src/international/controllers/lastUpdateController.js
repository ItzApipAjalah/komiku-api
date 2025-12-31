const lastUpdateService = require('../services/lastUpdateService');

/**
 * Controller for handling latest updates on WeebCentral
 */
const lastUpdateController = {
    getLastUpdates: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;

            const data = await lastUpdateService.getLastUpdates(page);

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error in lastUpdate controller (WeebCentral):', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get latest updates'
            });
        }
    }
};

module.exports = lastUpdateController;
