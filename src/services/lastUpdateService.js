const axios = require('axios');
const cheerio = require('cheerio');
const { BASE_URL } = require('../utils/constants');

/**
 * Service for handling last update manga operations
 */
const lastUpdateService = {
  /**
   * Get last updated manga by category and page
   * @param {string} category - Category name (manga, manhwa, manhua)
   * @param {number} page - Page number
   * @returns {Promise<Object>} - Last update manga data with pagination info
   */
  getLastUpdates: async (category = 'manga', page = 1) => {
    try {
      // Validate category
      const validCategories = ['manga', 'manhwa', 'manhua'];
      if (!validCategories.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
      
      // Validate page
      if (page < 1) {
        page = 1;
      }
      
      // Construct the API URL - using the correct format for Komiku
      const apiUrl = `https://api.komiku.id/manga/page/${page}/?category_name=${category}`;
      
      // Fetch the last update page
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
      
      // Extract manga list
      const mangaList = [];
      
      // Find all manga entries
      const mangaElements = $('.bge');
      
      // If no manga elements found, check if we're on the last page
      if (mangaElements.length === 0) {
        // Check if there's a previous page link to determine if this is a valid page
        const hasPreviousPage = $('.pagination .prev').length > 0;
        if (!hasPreviousPage && page > 1) {
          // If we're on a page > 1 and there's no previous page, this is an invalid page
          return {
            category,
            page,
            hasNextPage: false,
            mangaList: [],
            message: 'No manga found on this page'
          };
        }
      }
      
      mangaElements.each((index, element) => {
        const $element = $(element);
        
        // Extract manga details
        const title = $element.find('.kan h3').text().trim();
        const url = $element.find('.bgei a').attr('href');
        
        // Handle lazy-loaded images
        const $img = $element.find('.bgei img');
        let imageUrl = '';
        
        if ($img.hasClass('lazy')) {
          // If image has lazy class, use data-src attribute
          imageUrl = $img.attr('data-src');
        } else {
          // Otherwise use src attribute
          imageUrl = $img.attr('src');
        }
        
        // Extract type and genre
        const typeInfoText = $element.find('.tpe1_inf').text().trim();
        const typeMatch = typeInfoText.match(/^(\w+)\s+(.+)$/);
        const type = typeMatch ? typeMatch[1] : '';
        const genre = typeMatch ? typeMatch[2] : '';
        
        // Extract stats - Updated regex to match the new format
        const statsText = $element.find('.judul2').text().trim();
        const statsMatch = statsText.match(/(\d+(?:\.\d+)?(?:jt|rb)?)\s*pembaca\s*•\s*(\d+)\s*(\w+)(?:\s*lalu)?(?:\s*•\s*(\w+))?/);
        const views = statsMatch ? statsMatch[1] : '';
        const timeAgo = statsMatch ? `${statsMatch[2]} ${statsMatch[3]}` : '';
        const isColored = statsMatch && statsMatch[4] === 'Berwarna';
        
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
            timeAgo,
            isColored
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
        mangaList,
        totalItems: mangaList.length
      };
    } catch (error) {
      console.error('Error fetching last updates:', error);
      throw new Error(`Failed to fetch last updates: ${error.message}`);
    }
  }
};

module.exports = lastUpdateService; 