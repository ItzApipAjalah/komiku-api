const axios = require('axios');
const cheerio = require('cheerio');
const { DOUJIN_BASE_URL } = require('../utils/constants');

/**
 * Service for handling last update operations on KomikDewasa
 */
const lastUpdateService = {
    /**
     * Get latest updates
     * @param {number} page - Page number (default: 1)
     * @returns {Promise<Object>} - Latest update results
     */
    getLastUpdate: async (page = 1) => {
        try {
            // Construct URL
            const url = page > 1
                ? `${DOUJIN_BASE_URL}/update-terbaru?page=${page}`
                : `${DOUJIN_BASE_URL}/update-terbaru`;

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': DOUJIN_BASE_URL
            };

            const response = await axios.get(url, { headers });
            const $ = cheerio.load(response.data);

            const results = [];

            // Find all article elements
            $('article.flex.gap-6').each((index, element) => {
                const $el = $(element);

                // Extract manga link and image
                const mangaLink = $el.find('a[href*="/komik/"]').first();
                const mangaUrl = mangaLink.attr('href');
                const slug = mangaUrl ? mangaUrl.replace('/komik/', '') : '';

                // Extract image
                const imageUrl = $el.find('img').attr('src');

                // Extract title
                const title = $el.find('h2 a').text().trim();

                // Extract genres
                const genres = [];
                $el.find('ul.flex.gap-1 li a').each((i, genreEl) => {
                    genres.push($(genreEl).text().trim());
                });

                // Extract chapters
                const chapters = [];
                $el.find('ul.flex.flex-col li a').each((i, chapterEl) => {
                    const $chapter = $(chapterEl);
                    const chapterUrl = $chapter.attr('href');
                    const chapterTitle = $chapter.text().trim();

                    if (chapterUrl && chapterUrl.includes('/baca/')) {
                        chapters.push({
                            title: chapterTitle,
                            url: `${DOUJIN_BASE_URL}${chapterUrl}`,
                            slug: chapterUrl.replace('/baca/', '')
                        });
                    }
                });

                if (title) {
                    results.push({
                        title,
                        slug,
                        url: `${DOUJIN_BASE_URL}${mangaUrl}`,
                        imageUrl,
                        genres,
                        chapters
                    });
                }
            });

            return {
                page,
                totalResults: results.length,
                results
            };
        } catch (error) {
            console.error('Error getting last update on KomikDewasa:', error);
            throw new Error(`Failed to get last update: ${error.message}`);
        }
    }
};

module.exports = lastUpdateService;
