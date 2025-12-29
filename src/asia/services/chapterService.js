const axios = require('axios');
const { WEST_BASE_URL } = require('../utils/constants');

/**
 * Service for handling chapter view operations on WestManga
 * Uses direct API endpoint
 */
const chapterService = {
    /**
     * Get chapter content by URL or slug
     * @param {string} url - Full URL or slug of the chapter
     * @returns {Promise<Object>} - Chapter content with images
     */
    getChapter: async (url) => {
        try {
            if (!url || url.trim() === '') {
                throw new Error('URL or slug is required');
            }

            // Extract slug from URL
            let slug = url;
            if (url.includes('westmanga.me/view/')) {
                slug = url.split('/view/')[1].split('/')[0].split('?')[0];
            }

            // Fetch chapter content from API
            const apiUrl = `https://data.westmanga.me/api/v/${slug}`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Referer': WEST_BASE_URL,
                    'Origin': WEST_BASE_URL
                }
            });

            const chapterData = response.data.data;

            // Build response
            return {
                id: chapterData.id,
                slug: chapterData.slug,
                number: chapterData.number,
                title: chapterData.title || `Chapter ${chapterData.number}`,
                contentId: chapterData.content_id,
                contentSlug: chapterData.content_slug,
                contentTitle: chapterData.content_title,
                url: `${WEST_BASE_URL}/view/${chapterData.slug}`,
                comicUrl: `${WEST_BASE_URL}/comic/${chapterData.content_slug}`,
                createdAt: chapterData.created_at?.formatted,
                updatedAt: chapterData.updated_at?.formatted,
                prevChapter: chapterData.prev_chapter ? {
                    slug: chapterData.prev_chapter.slug,
                    number: chapterData.prev_chapter.number,
                    url: `${WEST_BASE_URL}/view/${chapterData.prev_chapter.slug}`
                } : null,
                nextChapter: chapterData.next_chapter ? {
                    slug: chapterData.next_chapter.slug,
                    number: chapterData.next_chapter.number,
                    url: `${WEST_BASE_URL}/view/${chapterData.next_chapter.slug}`
                } : null,
                totalImages: (chapterData.images || chapterData.chapter_images || []).length,
                images: chapterData.images || chapterData.chapter_images || []
            };
        } catch (error) {
            console.error('Error getting chapter on WestManga:', error);
            throw new Error(`Failed to get chapter: ${error.message}`);
        }
    }
};

module.exports = chapterService;
