const axios = require('axios');
const { WEST_BASE_URL } = require('../utils/constants');

/**
 * Service for handling search operations on WestManga
 * Uses direct API endpoint
 */
const searchService = {
    /**
     * Search manga by query
     * @param {string} query - Search query
     * @param {number} page - Page number (default: 1)
     * @param {number} perPage - Results per page (default: 40)
     * @returns {Promise<Object>} - Search results
     */
    search: async (query, page = 1, perPage = 40) => {
        try {
            if (!query || query.trim() === '') {
                throw new Error('Search query is required');
            }

            // Use the direct API endpoint
            const apiUrl = `https://data.westmanga.me/api/contents?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&project=false`;

            // Fetch from API
            const response = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Referer': WEST_BASE_URL,
                    'Origin': WEST_BASE_URL
                }
            });

            const data = response.data;

            // Transform results to match our format
            const results = (data.data || data || []).map(item => ({
                title: item.title || item.name,
                slug: item.slug,
                url: `${WEST_BASE_URL}/comic/${item.slug}`,
                imageUrl: item.cover || item.image,
                latestChapter: item.latest_chapter || item.last_chapter,
                rating: item.rating,
                type: item.type,
                status: item.status,
                country: item.country
            }));

            return {
                query,
                page,
                perPage,
                totalResults: results.length,
                results
            };
        } catch (error) {
            console.error('Error searching manga on WestManga:', error);
            throw new Error(`Failed to search manga: ${error.message}`);
        }
    }
};

module.exports = searchService;
