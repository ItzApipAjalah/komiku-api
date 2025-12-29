const axios = require('axios');
const cheerio = require('cheerio');
const { DOUJIN_BASE_URL } = require('../utils/constants');

/**
 * Service for handling chapter view operations on KomikDewasa
 */
const chapterService = {
    /**
     * Get chapter content by URL
     * @param {string} url - Full URL or slug of the chapter
     * @returns {Promise<Object>} - Chapter content with images
     */
    getChapter: async (url) => {
        try {
            if (!url || url.trim() === '') {
                throw new Error('URL is required');
            }

            // Extract slug from URL
            let slug = url;
            if (url.includes('komikdewasa.id/baca/')) {
                slug = url.split('/baca/')[1].split('/')[0].split('?')[0];
            }

            const chapterUrl = `${DOUJIN_BASE_URL}/baca/${slug}`;

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': DOUJIN_BASE_URL
            };

            const response = await axios.get(chapterUrl, { headers });
            const $ = cheerio.load(response.data);

            // Extract title
            const fullTitle = $('#chapter-title').text().trim();
            const titleParts = fullTitle.split('\n').map(s => s.trim()).filter(s => s);
            const mangaTitle = titleParts[0]?.replace('Baca ', '') || '';
            const chapterNumber = titleParts[1] || '';

            // Extract manga URL
            const mangaLink = $('a[href*="/komik/"]').first();
            const mangaUrl = mangaLink.attr('href');
            const mangaSlug = mangaUrl ? mangaUrl.replace('/komik/', '') : '';

            // Extract prev/next chapter
            let prevChapter = null;
            let nextChapter = null;

            $('nav a').each((i, el) => {
                const $el = $(el);
                const href = $el.attr('href');
                const text = $el.text().trim().toLowerCase();

                if (href && href.includes('/baca/')) {
                    if (text.includes('prev')) {
                        prevChapter = {
                            slug: href.replace('/baca/', ''),
                            url: `${DOUJIN_BASE_URL}${href}`
                        };
                    } else if (text.includes('next')) {
                        nextChapter = {
                            slug: href.replace('/baca/', ''),
                            url: `${DOUJIN_BASE_URL}${href}`
                        };
                    }
                }
            });

            // Extract images
            const images = [];
            $('div.flex.flex-col.items-center img[itemprop="image"]').each((index, element) => {
                const $img = $(element);
                const src = $img.attr('src');
                const alt = $img.attr('alt');

                if (src) {
                    images.push({
                        page: index + 1,
                        url: src,
                        alt: alt || `Page ${index + 1}`
                    });
                }
            });

            return {
                slug,
                mangaTitle,
                mangaSlug,
                mangaUrl: mangaUrl ? `${DOUJIN_BASE_URL}${mangaUrl}` : '',
                chapterNumber,
                url: chapterUrl,
                prevChapter,
                nextChapter,
                totalImages: images.length,
                images
            };
        } catch (error) {
            console.error('Error getting chapter on KomikDewasa:', error);
            throw new Error(`Failed to get chapter: ${error.message}`);
        }
    }
};

module.exports = chapterService;
