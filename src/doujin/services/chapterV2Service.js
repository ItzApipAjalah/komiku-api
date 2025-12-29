const axios = require('axios');
const cheerio = require('cheerio');

// FlareSolverr URL
const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'https://dcdn.komikkuya.my.id/v1';
const MANHWADESU_BASE_URL = 'https://manhwadesu.io';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60 * 60 * 24 * 7 * 1000; // 1 week in milliseconds

// Retry settings
const MAX_RETRIES = 3;
const FLARESOLVERR_TIMEOUT = 120000;

/**
 * Service for handling chapter view operations on ManhwaDesu (V2)
 * Uses FlareSolverr to bypass Cloudflare with in-memory caching
 */
const chapterV2Service = {
    /**
     * Get from cache
     */
    getFromCache: (key) => {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log('Cache HIT:', key);
            return cached.data;
        }
        if (cached) {
            cache.delete(key); // Expired
        }
        console.log('Cache MISS:', key);
        return null;
    },

    /**
     * Save to cache
     */
    saveToCache: (key, data) => {
        cache.set(key, { data, timestamp: Date.now() });
        console.log('Cache SAVED:', key, '(TTL: 1 week)');
    },

    /**
     * Make request to FlareSolverr with retry
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
                timeout: FLARESOLVERR_TIMEOUT + 30000
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
     * Get chapter content by slug using FlareSolverr with caching
     */
    getChapter: async (slug) => {
        try {
            if (!slug || slug.trim() === '') {
                throw new Error('Slug is required');
            }

            // Clean slug
            let cleanSlug = slug;
            if (slug.includes('komikdewasa.id/baca/')) {
                cleanSlug = slug.split('/baca/')[1].split('/')[0].split('?')[0];
            } else if (slug.includes('manhwadesu.io/')) {
                cleanSlug = slug.split('manhwadesu.io/')[1].split('/')[0].split('?')[0];
            }

            // Check cache first
            const cached = chapterV2Service.getFromCache(cleanSlug);
            if (cached) {
                return cached;
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

            const result = {
                slug: cleanSlug,
                title: h1Title || pageTitle,
                source: 'manhwadesu.io',
                url: chapterUrl,
                prevChapter,
                nextChapter,
                totalImages: images.length,
                images,
                cached: true,
                cachedAt: new Date().toISOString()
            };

            // Save to cache
            chapterV2Service.saveToCache(cleanSlug, result);

            return result;
        } catch (error) {
            console.error('Error getting chapter on ManhwaDesu (V2):', error.message);
            throw new Error(`Failed to get chapter: ${error.message}`);
        }
    }
};

module.exports = chapterV2Service;
