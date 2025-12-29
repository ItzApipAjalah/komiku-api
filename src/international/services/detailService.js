const axios = require('axios');
const cheerio = require('cheerio');
const { WEEB_BASE_URL } = require('../utils/constants');

/**
 * Service for handling manga detail operations on WeebCentral
 */
const detailService = {
    /**
     * Get manga detail by URL
     * @param {string} url - Full URL of the manga
     * @returns {Promise<Object>} - Manga detail with chapters
     */
    getDetail: async (url) => {
        try {
            if (!url || url.trim() === '') {
                throw new Error('URL is required');
            }

            // Extract series ID and slug from URL
            // URL format: https://weebcentral.com/series/01J76XYCRVY3QGYAMRR3STW941/Chainsaw-Man
            let seriesId = '';
            let slug = '';

            if (url.includes('/series/')) {
                const parts = url.split('/series/')[1].split('/');
                seriesId = parts[0];
                slug = parts[1] || '';
            } else {
                // Assume it's just the series ID
                seriesId = url;
            }

            const seriesUrl = `${WEEB_BASE_URL}/series/${seriesId}/${slug}`;
            const chaptersUrl = `${WEEB_BASE_URL}/series/${seriesId}/full-chapter-list`;

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': WEEB_BASE_URL
            };

            // Fetch both pages in parallel
            const [seriesResponse, chaptersResponse] = await Promise.all([
                axios.get(seriesUrl, { headers }),
                axios.get(chaptersUrl, { headers })
            ]);

            // Parse series page
            const $series = cheerio.load(seriesResponse.data);

            // Extract title
            const title = $series('h1.text-2xl.font-bold').text().trim();

            // Extract cover
            const coverWebp = $series('section picture source').attr('srcset');
            const coverFallback = $series('section picture img').attr('src');
            const cover = coverWebp || coverFallback;

            // Extract description
            const description = $series('section ul li p.whitespace-pre-wrap').text().trim();

            // Extract metadata from the list
            const metadata = {};
            $series('section ul li').each((index, element) => {
                const $el = $series(element);
                const strong = $el.find('strong').text().trim().replace(':', '');

                if (strong === 'Author(s)') {
                    metadata.authors = [];
                    $el.find('a').each((i, a) => {
                        metadata.authors.push($series(a).text().trim());
                    });
                } else if (strong === 'Tags(s)') {
                    metadata.tags = [];
                    $el.find('a').each((i, a) => {
                        metadata.tags.push($series(a).text().trim().replace(',', ''));
                    });
                } else if (strong === 'Type') {
                    metadata.type = $el.find('a').text().trim();
                } else if (strong === 'Status') {
                    metadata.status = $el.find('a').text().trim();
                } else if (strong === 'Released') {
                    metadata.released = $el.find('span').text().trim();
                } else if (strong === 'Official Translation') {
                    metadata.officialTranslation = $el.find('a').text().trim() === 'Yes';
                } else if (strong === 'Anime Adaptation') {
                    metadata.animeAdaptation = $el.find('a').text().trim() === 'Yes';
                } else if (strong === 'Adult Content') {
                    metadata.adultContent = $el.find('a').text().trim() === 'Yes';
                }
            });

            // Parse chapters page
            const $chapters = cheerio.load(chaptersResponse.data);
            const chapters = [];

            $chapters('div.flex.items-center').each((index, element) => {
                const $el = $chapters(element);
                const linkElement = $el.find('a[href*="/chapters/"]');
                const chapterUrl = linkElement.attr('href');

                if (!chapterUrl) return;

                // Extract chapter ID from URL
                const chapterId = chapterUrl.split('/chapters/')[1];

                // Extract chapter number/title
                const chapterTitle = $el.find('span.grow span').first().text().trim();

                // Extract date
                const dateTime = $el.find('time').attr('datetime');
                const dateText = $el.find('time').text().trim();

                chapters.push({
                    id: chapterId,
                    title: chapterTitle,
                    url: chapterUrl,
                    date: dateText || dateTime,
                    dateTime
                });
            });

            return {
                seriesId,
                slug,
                title,
                cover,
                description,
                ...metadata,
                url: seriesUrl,
                totalChapters: chapters.length,
                chapters
            };
        } catch (error) {
            console.error('Error getting manga detail on WeebCentral:', error);
            throw new Error(`Failed to get manga detail: ${error.message}`);
        }
    }
};

module.exports = detailService;
