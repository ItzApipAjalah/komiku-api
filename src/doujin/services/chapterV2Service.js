const axios = require('axios');
const cheerio = require('cheerio');

// FlareSolverr URL - update this to your Ubuntu server IP
const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'https://dcdn.komikkuya.my.id/v1';
const MANHWADESU_BASE_URL = 'https://manhwadesu.io';

// Retry settings
const MAX_RETRIES = 3;
const FLARESOLVERR_TIMEOUT = 120000; // 120 seconds

/**
 * Service for handling chapter view operations on ManhwaDesu (V2)
 * Uses FlareSolverr to bypass Cloudflare with retry logic
 */
const chapterV2Service = {
    /**
     * Make request to FlareSolverr with retry
     * @param {string} url - URL to fetch
     * @param {number} attempt - Current attempt number
     * @returns {Promise<string>} - HTML content
     */
    fetchWithRetry: async (url, attempt = 1) => {
        try {
            console.log(`FlareSolverr attempt ${attempt}/${MAX_RETRIES}: ${url}`);

            const response = await axios.post(FLARESOLVERR_URL, {
                cmd: 'request.get',
                url: url,
                maxTimeout: FLARESOLVERR_TIMEOUT
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: FLARESOLVERR_TIMEOUT + 30000 // Extra 30s for network
            });

            if (response.data.status !== 'ok') {
                throw new Error(`FlareSolverr error: ${response.data.message}`);
            }

            return response.data.solution.response;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);

            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return chapterV2Service.fetchWithRetry(url, attempt + 1);
            }

            throw error;
        }
    },

    /**
     * Get chapter content by slug using FlareSolverr
     * @param {string} slug - Chapter slug (e.g., wireless-onahole-chapter-2)
     * @returns {Promise<Object>} - Chapter content with images
     */
    getChapter: async (slug) => {
        try {
            if (!slug || slug.trim() === '') {
                throw new Error('Slug is required');
            }

            // Clean slug if it's a full URL
            let cleanSlug = slug;
            if (slug.includes('komikdewasa.id/baca/')) {
                cleanSlug = slug.split('/baca/')[1].split('/')[0].split('?')[0];
            } else if (slug.includes('manhwadesu.io/')) {
                cleanSlug = slug.split('manhwadesu.io/')[1].split('/')[0].split('?')[0];
            }

            const chapterUrl = `${MANHWADESU_BASE_URL}/${cleanSlug}/`;

            // Fetch with retry
            const html = await chapterV2Service.fetchWithRetry(chapterUrl);
            const $ = cheerio.load(html);

            console.log('FlareSolverr response received!');

            // Extract title
            const pageTitle = $('title').text().trim();
            const h1Title = $('h1').first().text().trim();

            // Extract images
            const images = [];
            $('#readerarea img, img.ts-main-image').each((index, element) => {
                const $img = $(element);
                const src = $img.attr('src');
                const alt = $img.attr('alt');
                const dataIndex = $img.attr('data-index');
                const server = $img.attr('data-server');

                if (src && (src.includes('cdn') || src.includes('manga') || src.includes('chapter') || src.includes('gilakomik'))) {
                    images.push({
                        page: dataIndex ? parseInt(dataIndex) + 1 : images.length + 1,
                        url: src,
                        alt: alt || `Page ${images.length + 1}`,
                        server: server || 'default'
                    });
                }
            });

            // Extract navigation
            let prevChapter = null;
            let nextChapter = null;

            $('a[rel="prev"], a.prev').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href !== '#') {
                    prevChapter = { slug: href.replace(/\//g, '').replace(MANHWADESU_BASE_URL, ''), url: href };
                }
            });

            $('a[rel="next"], a.next').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href !== '#') {
                    nextChapter = { slug: href.replace(/\//g, '').replace(MANHWADESU_BASE_URL, ''), url: href };
                }
            });

            console.log(`Found ${images.length} images`);

            return {
                slug: cleanSlug,
                title: h1Title || pageTitle,
                source: 'manhwadesu.io',
                url: chapterUrl,
                prevChapter,
                nextChapter,
                totalImages: images.length,
                images
            };
        } catch (error) {
            console.error('Error getting chapter on ManhwaDesu (V2):', error.message);
            throw new Error(`Failed to get chapter: ${error.message}`);
        }
    }
};

module.exports = chapterV2Service;
