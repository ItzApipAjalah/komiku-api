const axios = require('axios');
const cheerio = require('cheerio');
const { WEEB_BASE_URL } = require('../utils/constants');

/**
 * Service for handling search operations on WeebCentral
 * International manga source
 */
const searchService = {
    /**
     * Search manga by query
     * @param {string} query - Search query
     * @returns {Promise<Object>} - Search results
     */
    search: async (query) => {
        try {
            if (!query || query.trim() === '') {
                throw new Error('Search query is required');
            }

            // POST request to search endpoint
            const searchUrl = `${WEEB_BASE_URL}/search/simple?location=main`;
            const response = await axios.post(searchUrl, `text=${encodeURIComponent(query)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'HX-Request': 'true',
                    'Referer': WEEB_BASE_URL
                }
            });

            const html = response.data;

            // Parse the HTML response
            const $ = cheerio.load(html);

            // Extract search results
            const results = [];

            // Find all result items (anchor tags with btn class)
            $('a.btn.join-item').each((index, element) => {
                const $element = $(element);

                // Get the URL
                const url = $element.attr('href');
                if (!url || !url.includes('/series/')) return;

                // Extract series ID from URL
                // URL format: https://weebcentral.com/series/01J76XY7E827QQQT0ERKCGH4CD/Naruto
                const urlParts = url.split('/series/');
                const pathPart = urlParts[1] || '';
                const [seriesId, slug] = pathPart.split('/');

                // Get the title
                const title = $element.find('.flex-1').text().trim();

                // Get the cover image
                const coverWebp = $element.find('source').attr('srcset');
                const coverFallback = $element.find('img').attr('src');
                const cover = coverWebp || coverFallback;

                results.push({
                    seriesId,
                    slug,
                    title,
                    url,
                    cover
                });
            });

            return {
                query,
                totalResults: results.length,
                results
            };
        } catch (error) {
            console.error('Error searching manga on WeebCentral:', error);
            throw new Error(`Failed to search manga: ${error.message}`);
        }
    }
};

module.exports = searchService;
