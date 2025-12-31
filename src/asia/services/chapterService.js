const axios = require('axios');
const { WEST_BASE_URL } = require('../utils/constants');

/**
 * Service for handling chapter view operations on WestManga
 */
const chapterService = {
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

            const apiUrl = `https://data.westmanga.me/api/v/${slug}`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Referer': WEST_BASE_URL,
                    'Origin': WEST_BASE_URL
                }
            });

            const chapterData = response.data.data;

            // Extract content info (comic info is in 'content' object)
            const content = chapterData.content || {};
            const contentSlug = content.slug;
            const contentTitle = content.title;
            const contentId = content.id;

            // Extract prev/next from chapters array
            let prevChapter = null;
            let nextChapter = null;

            const chapters = chapterData.chapters || [];
            if (chapters.length > 0) {
                // Find current chapter in the array
                const currentIndex = chapters.findIndex(c => c.slug === slug);

                if (currentIndex !== -1) {
                    // Chapters array order: check if ascending or descending
                    // Usually: index 0 = oldest, last index = newest (ascending)
                    // Or: index 0 = newest, last index = oldest (descending)

                    // Check order by comparing numbers
                    const isAscending = chapters.length > 1 &&
                        parseFloat(chapters[0]?.number || 0) < parseFloat(chapters[chapters.length - 1]?.number || 0);

                    if (isAscending) {
                        // Ascending: prev = lower index, next = higher index
                        if (currentIndex > 0) {
                            const prev = chapters[currentIndex - 1];
                            prevChapter = {
                                slug: prev.slug,
                                number: prev.number,
                                title: `Chapter ${prev.number}`,
                                url: `${WEST_BASE_URL}/view/${prev.slug}`
                            };
                        }
                        if (currentIndex < chapters.length - 1) {
                            const next = chapters[currentIndex + 1];
                            nextChapter = {
                                slug: next.slug,
                                number: next.number,
                                title: `Chapter ${next.number}`,
                                url: `${WEST_BASE_URL}/view/${next.slug}`
                            };
                        }
                    } else {
                        // Descending: prev = higher index (older), next = lower index (newer)
                        if (currentIndex < chapters.length - 1) {
                            const prev = chapters[currentIndex + 1];
                            prevChapter = {
                                slug: prev.slug,
                                number: prev.number,
                                title: `Chapter ${prev.number}`,
                                url: `${WEST_BASE_URL}/view/${prev.slug}`
                            };
                        }
                        if (currentIndex > 0) {
                            const next = chapters[currentIndex - 1];
                            nextChapter = {
                                slug: next.slug,
                                number: next.number,
                                title: `Chapter ${next.number}`,
                                url: `${WEST_BASE_URL}/view/${next.slug}`
                            };
                        }
                    }
                }
            }

            return {
                id: chapterData.id,
                slug: chapterData.slug,
                number: chapterData.number,
                title: chapterData.title || `Chapter ${chapterData.number}`,
                contentId: contentId,
                contentSlug: contentSlug,
                contentTitle: contentTitle,
                url: `${WEST_BASE_URL}/view/${chapterData.slug}`,
                comicUrl: contentSlug ? `${WEST_BASE_URL}/comic/${contentSlug}` : null,
                createdAt: chapterData.created_at?.formatted,
                updatedAt: chapterData.updated_at?.formatted,
                prevChapter,
                nextChapter,
                totalImages: (chapterData.images || []).length,
                images: chapterData.images || []
            };
        } catch (error) {
            console.error('Error getting chapter on WestManga:', error);
            throw new Error(`Failed to get chapter: ${error.message}`);
        }
    }
};

module.exports = chapterService;
