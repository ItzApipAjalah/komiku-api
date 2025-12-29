const axios = require('axios');
const cheerio = require('cheerio');
const { DOUJIN_BASE_URL } = require('../utils/constants');

/**
 * Service for handling manga detail operations on KomikDewasa
 */
const detailService = {
    /**
     * Get manga detail by URL
     * @param {string} url - Full URL or slug of the manga
     * @returns {Promise<Object>} - Manga detail with chapters
     */
    getDetail: async (url) => {
        try {
            if (!url || url.trim() === '') {
                throw new Error('URL is required');
            }

            // Extract slug from URL
            let slug = url;
            if (url.includes('komikdewasa.id/komik/')) {
                slug = url.split('/komik/')[1].split('/')[0].split('?')[0];
            }

            const detailUrl = `${DOUJIN_BASE_URL}/komik/${slug}`;

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': DOUJIN_BASE_URL
            };

            const response = await axios.get(detailUrl, { headers });
            const $ = cheerio.load(response.data);

            // Extract title
            const title = $('h1[itemprop="name"]').text().trim().replace('Komik ', '');

            // Extract cover image
            const cover = $('img[itemprop="image"]').attr('src') || $('article img').first().attr('src');

            // Extract genres
            const genres = [];
            $('ul.flex.flex-wrap li a[itemprop="genre"]').each((i, el) => {
                genres.push($(el).text().trim());
            });

            // Extract metadata
            let type = '';
            let status = '';
            let author = '';
            let lastUpdate = '';

            $('div.flex.items-center.gap-2').each((i, el) => {
                const $el = $(el);
                const label = $el.find('span.font-medium').text().trim().replace(':', '');
                const value = $el.find('a').text().trim() || $el.find('span[itemprop="author"]').text().trim() || $el.contents().last().text().trim();

                if (label.includes('Tipe')) {
                    type = value;
                } else if (label.includes('Status')) {
                    status = value;
                } else if (label.includes('Author')) {
                    author = value;
                } else if (label.includes('Update')) {
                    lastUpdate = value;
                }
            });

            // Extract description
            const description = $('#comic-description').text().trim();

            // Extract chapters
            const chapters = [];
            $('#chapter-list li').each((index, element) => {
                const $el = $(element);
                const chapterNumber = $el.attr('data-comic-number');
                const linkElement = $el.find('a');
                const chapterUrl = linkElement.attr('href');
                const chapterTitle = linkElement.text().trim();

                if (chapterUrl) {
                    chapters.push({
                        number: chapterNumber,
                        title: chapterTitle,
                        slug: chapterUrl.replace('/baca/', ''),
                        url: `${DOUJIN_BASE_URL}${chapterUrl}`
                    });
                }
            });

            return {
                slug,
                title,
                cover,
                type,
                status,
                author,
                lastUpdate,
                genres,
                description,
                url: detailUrl,
                totalChapters: chapters.length,
                chapters
            };
        } catch (error) {
            console.error('Error getting manga detail on KomikDewasa:', error);
            throw new Error(`Failed to get manga detail: ${error.message}`);
        }
    }
};

module.exports = detailService;
