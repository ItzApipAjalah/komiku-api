const axios = require('axios');
const cheerio = require('cheerio');
const { BASE_URL } = require('../utils/constants');

/**
 * Service for handling popular manga operations
 */
const popularService = {
  /**
   * Get popular manga by category, page, and sort time
   * @param {string} category - Category name (manga, manhwa, manhua)
   * @param {number} page - Page number
   * @param {string} sorttime - Sort time (daily, weekly, all)
   * @returns {Promise<Object>} - Popular manga data with pagination info
   */
  getPopularManga: async (category = 'manga', page = 1, sorttime = 'all') => {
    try {
      // Validate category
      const validCategories = ['manga', 'manhwa', 'manhua'];
      if (!validCategories.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }

      // Validate sorttime
      const validSortTimes = ['daily', 'weekly', 'all'];
      if (!validSortTimes.includes(sorttime)) {
        sorttime = 'all';
      }

      // Validate page
      if (page < 1) {
        page = 1;
      }

      // Map sorttime to API parameter
      const sorttimeParam = sorttime === 'all' ? '' : `&sorttime=${sorttime}`;

      // Construct the API URL
      const apiUrl = `https://api.komiku.id/manga/page/${page}/?orderby=meta_value_num&tipe=${category}${sorttimeParam}`;

      // Fetch the popular manga page
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });

      const html = response.data;

      // Parse the HTML
      const $ = cheerio.load(html);

      // Extract popular manga
      const mangaList = [];

      // Find all manga entries
      const mangaElements = $('.bge');

      mangaElements.each((index, element) => {
        const $element = $(element);

        // Extract manga details
        const title = $element.find('.kan h3').text().trim();
        const url = $element.find('.bgei a').attr('href');
        const imageUrl = $element.find('.bgei img').attr('src');

        // Extract type and genre
        const typeInfoText = $element.find('.tpe1_inf').text().trim();
        const typeMatch = typeInfoText.match(/^(\w+)\s+(.+)$/);
        const type = typeMatch ? typeMatch[1] : '';
        const genre = typeMatch ? typeMatch[2] : '';

        // Extract stats
        const statsText = $element.find('.judul2').text().trim();
        const statsMatch = statsText.match(/(\d+(?:\.\d+)?(?:jt|rb)?)\s*x\s*•\s*(\d+)\s*(\w+)/);
        const views = statsMatch ? statsMatch[1] : '';
        const timeAgo = statsMatch ? `${statsMatch[2]} ${statsMatch[3]}` : '';

        // Extract description
        const description = $element.find('.kan p').text().trim();

        // Extract chapter information
        const firstChapter = {
          title: $element.find('.new1:first-child span:last-child').text().trim(),
          url: $element.find('.new1:first-child a').attr('href')
        };

        const latestChapter = {
          title: $element.find('.new1:last-child span:last-child').text().trim(),
          url: $element.find('.new1:last-child a').attr('href')
        };

        // Extract update status
        const updateStatus = $element.find('.up').text().trim();

        // Add to manga list
        mangaList.push({
          title,
          url: url ? `${BASE_URL}${url}` : '',
          imageUrl,
          type,
          genre,
          stats: {
            views,
            timeAgo
          },
          description,
          firstChapter: {
            ...firstChapter,
            url: firstChapter.url ? `${BASE_URL}${firstChapter.url}` : ''
          },
          latestChapter: {
            ...latestChapter,
            url: latestChapter.url ? `${BASE_URL}${latestChapter.url}` : ''
          },
          updateStatus
        });
      });

      // Check if there's a next page
      const hasNextPage = $('.pagination .next').length > 0;

      return {
        category,
        page,
        hasNextPage,
        mangaList
      };
    } catch (error) {
      console.error('Error fetching popular manga:', error);
      throw new Error(`Failed to fetch popular manga: ${error.message}`);
    }
  }
};

module.exports = popularService; 