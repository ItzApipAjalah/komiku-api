const axios = require('axios');
const { WEST_BASE_URL } = require('../utils/constants');

/**
 * Service for handling manga detail operations on WestManga
 * Uses direct API endpoint
 */
const detailService = {
    /**
     * Get manga detail by URL or slug
     * @param {string} url - Full URL or slug of the manga
     * @returns {Promise<Object>} - Manga detail with chapters
     */
    getDetail: async (url) => {
        try {
            if (!url || url.trim() === '') {
                throw new Error('URL or slug is required');
            }

            // Extract slug from URL
            let slug = url;
            if (url.includes('westmanga.me/comic/')) {
                slug = url.split('/comic/')[1].split('/')[0].split('?')[0];
            }

            // Fetch manga detail from API
            const apiUrl = `https://data.westmanga.me/api/comic/${slug}`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Referer': WEST_BASE_URL,
                    'Origin': WEST_BASE_URL
                }
            });

            const mangaData = response.data.data;

            // Transform chapters
            const chapters = (mangaData.chapters || []).map(chapter => ({
                id: chapter.id,
                number: chapter.number,
                title: `Chapter ${chapter.number}`,
                slug: chapter.slug,
                url: `${WEST_BASE_URL}/view/${chapter.slug}`,
                date: chapter.created_at?.formatted || '',
                timestamp: chapter.created_at?.time || null
            }));

            // Build response
            return {
                id: mangaData.id,
                slug: mangaData.slug,
                title: mangaData.title,
                alternativeTitle: mangaData.alternative_name,
                description: mangaData.sinopsis,
                cover: mangaData.cover,
                type: mangaData.content_type,
                status: mangaData.status,
                author: mangaData.author,
                country: mangaData.country_id,
                genres: (mangaData.genres || []).map(g => g.name),
                rating: mangaData.rating,
                views: mangaData.total_views,
                bookmarks: mangaData.bookmark_count,
                isHot: mangaData.hot,
                isProject: mangaData.is_project,
                createdAt: mangaData.created_at?.formatted,
                updatedAt: mangaData.updated_at?.formatted,
                url: `${WEST_BASE_URL}/comic/${mangaData.slug}`,
                totalChapters: chapters.length,
                chapters
            };
        } catch (error) {
            console.error('Error getting manga detail on WestManga:', error);
            throw new Error(`Failed to get manga detail: ${error.message}`);
        }
    }
};

module.exports = detailService;
