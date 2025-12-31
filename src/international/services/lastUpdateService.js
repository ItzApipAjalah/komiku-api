const axios = require('axios');
const cheerio = require('cheerio');
const { WEEB_BASE_URL } = require('../utils/constants');

/**
 * Service for handling latest updates on WeebCentral
 */
const lastUpdateService = {
    /**
     * Get latest updates
     * @param {number} page - Page number (default: 1)
     * @returns {Promise<Object>} - Latest updates with pagination
     */
    getLastUpdates: async (page = 1) => {
        try {
            const url = `${WEEB_BASE_URL}/latest-updates/${page}`;

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': WEEB_BASE_URL
            };

            const response = await axios.get(url, { headers });
            const $ = cheerio.load(response.data);

            const results = [];

            $('article').each((index, element) => {
                const $el = $(element);

                // Get series link and info
                const seriesLink = $el.find('a[href*="/series/"]').first();
                const seriesUrl = seriesLink.attr('href') || '';
                const seriesId = seriesUrl.split('/series/')[1]?.split('/')[0] || '';
                const seriesSlug = seriesUrl.split('/series/')[1]?.split('/')[1] || '';

                // Get title from data-tip or text
                const title = $el.attr('data-tip') || $el.find('.font-semibold, .truncate').text().trim();

                // Get cover image
                const coverImg = $el.find('img');
                const cover = coverImg.attr('src') || '';
                const coverWebp = $el.find('source[type="image/webp"]').attr('srcset') || '';

                // Get chapter link and info
                const chapterLink = $el.find('a[href*="/chapters/"]').first();
                const chapterUrl = chapterLink.attr('href') || '';
                const chapterId = chapterUrl.split('/chapters/')[1]?.split('/')[0] || '';

                // Get chapter number
                const chapterText = $el.find('span').filter((i, el) => {
                    return $(el).text().match(/Chapter\s+[\d.]+/i);
                }).first().text().trim() || '';

                // Get timestamp
                const timeEl = $el.find('time');
                const datetime = timeEl.attr('datetime') || '';

                if (title && seriesId) {
                    results.push({
                        title,
                        seriesId,
                        seriesSlug,
                        seriesUrl,
                        cover: coverWebp || cover,
                        latestChapter: {
                            chapterId,
                            chapterNumber: chapterText,
                            url: chapterUrl,
                            updatedAt: datetime
                        }
                    });
                }
            });

            return {
                page,
                totalResults: results.length,
                results
            };
        } catch (error) {
            console.error('Error getting latest updates on WeebCentral:', error);
            throw new Error(`Failed to get latest updates: ${error.message}`);
        }
    }
};

module.exports = lastUpdateService;
