const axios = require('axios');
const cheerio = require('cheerio');
const { WEEB_BASE_URL } = require('../utils/constants');

/**
 * Service for handling chapter view operations on WeebCentral
 */
const chapterService = {
    /**
     * Get chapter content by URL
     * @param {string} url - Full URL or chapter ID
     * @returns {Promise<Object>} - Chapter content with images
     */
    getChapter: async (url) => {
        try {
            if (!url || url.trim() === '') {
                throw new Error('URL is required');
            }

            // Extract chapter ID from URL
            let chapterId = url;
            if (url.includes('/chapters/')) {
                chapterId = url.split('/chapters/')[1].split('/')[0].split('?')[0];
            }

            const chapterUrl = `${WEEB_BASE_URL}/chapters/${chapterId}`;
            const imagesUrl = `${WEEB_BASE_URL}/chapters/${chapterId}/images?reading_style=long_strip`;

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': WEEB_BASE_URL,
                'HX-Request': 'true'
            };

            // Fetch chapter page and images in parallel
            const [chapterResponse, imagesResponse] = await Promise.all([
                axios.get(chapterUrl, { headers }),
                axios.get(imagesUrl, { headers })
            ]);

            const $ = cheerio.load(chapterResponse.data);
            const $images = cheerio.load(imagesResponse.data);

            // Extract manga info and series ID
            let mangaTitle = '';
            let mangaUrl = '';
            let seriesId = '';

            $('a[href*="/series/"]').each((i, el) => {
                const href = $(el).attr('href');
                const text = $(el).find('span.line-clamp-1, span.flex-1').text().trim();
                if (href && href.includes('/series/') && !href.includes('/random') && text) {
                    mangaUrl = href;
                    mangaTitle = text;
                    const parts = href.split('/series/')[1].split('/');
                    seriesId = parts[0];
                    return false;
                }
            });

            // Extract chapter number
            let chapterNumber = '';
            $('button span, span').each((i, el) => {
                const text = $(el).text().trim();
                if (text.match(/^Chapter\s+[\d.]+/i) && !chapterNumber) {
                    chapterNumber = text;
                    return false;
                }
            });

            // Extract prev/next from chapter-select hx-get attribute
            let prevChapter = null;
            let nextChapter = null;

            // Find the chapter-select button to get current_chapter parameter
            const chapterSelectBtn = $('button[hx-get*="/chapter-select"]');
            if (chapterSelectBtn.length > 0 && seriesId) {
                // Fetch the full chapter list
                try {
                    const chapterListUrl = `${WEEB_BASE_URL}/series/${seriesId}/full-chapter-list`;
                    const listResponse = await axios.get(chapterListUrl, { headers });
                    const $list = cheerio.load(listResponse.data);

                    // Find all chapter links
                    const chapters = [];
                    $list('a[href*="/chapters/"]').each((i, el) => {
                        const href = $list(el).attr('href');
                        if (href) {
                            const id = href.split('/chapters/')[1]?.split('/')[0]?.split('?')[0];
                            if (id) {
                                chapters.push({
                                    chapterId: id,
                                    url: `${WEEB_BASE_URL}/chapters/${id}`
                                });
                            }
                        }
                    });

                    // Find current chapter index
                    const currentIndex = chapters.findIndex(c => c.chapterId === chapterId);
                    if (currentIndex !== -1) {
                        // Chapters are usually in descending order (newest first)
                        // So "prev" is the one after current (older), "next" is the one before (newer)
                        if (currentIndex < chapters.length - 1) {
                            prevChapter = chapters[currentIndex + 1];
                        }
                        if (currentIndex > 0) {
                            nextChapter = chapters[currentIndex - 1];
                        }
                    }
                } catch (listError) {
                    console.log('Could not fetch chapter list for prev/next:', listError.message);
                }
            }

            // Extract all images
            const images = [];
            $images('img').each((index, element) => {
                const $img = $images(element);
                const src = $img.attr('src');

                if (src && !src.includes('/static/') && !src.includes('broken_image')) {
                    const alt = $img.attr('alt');
                    const width = $img.attr('width');
                    const height = $img.attr('height');

                    images.push({
                        page: images.length + 1,
                        url: src,
                        alt: alt || `Page ${images.length + 1}`,
                        width: width ? parseInt(width) : null,
                        height: height ? parseInt(height) : null
                    });
                }
            });

            return {
                chapterId,
                chapterNumber,
                mangaTitle,
                mangaUrl,
                seriesId,
                url: chapterUrl,
                prevChapter,
                nextChapter,
                totalImages: images.length,
                images
            };
        } catch (error) {
            console.error('Error getting chapter on WeebCentral:', error);
            throw new Error(`Failed to get chapter: ${error.message}`);
        }
    }
};

module.exports = chapterService;
