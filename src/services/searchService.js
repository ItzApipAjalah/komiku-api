const axios = require('axios');
const cheerio = require('cheerio');
const { BASE_URL } = require('../utils/constants');

/**
 * Service for handling manga search operations
 */
const searchService = {
  /**
   * Check if the website is accessible
   * @returns {Promise<boolean>} - Whether the website is accessible
   */
  checkWebsiteAccess: async () => {
    try {
      const response = await axios.get(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });
      
      console.log('Website check status:', response.status);
      console.log('Website title:', cheerio.load(response.data)('title').text());
      
      return response.status === 200;
    } catch (error) {
      console.error('Error checking website access:', error);
      return false;
    }
  },

  /**
   * Search for manga based on query
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of manga results
   */
  searchManga: async (query) => {
    try {
      // Check if the website is accessible
      const isAccessible = await searchService.checkWebsiteAccess();
      if (!isAccessible) {
        throw new Error('Website is not accessible');
      }
      
      // First, get the search page to get any necessary tokens or cookies
      const searchPageUrl = `${BASE_URL}?post_type=manga&s=${encodeURIComponent(query)}`;
      console.log('Search page URL:', searchPageUrl);
      
      const searchPageResponse = await axios.get(searchPageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });
      
      // Now make the API request that HTMX would make
      const apiUrl = `https://api.komiku.id/?post_type=manga&s=${encodeURIComponent(query)}`;
      console.log('API URL:', apiUrl);
      
      const apiResponse = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'HX-Request': 'true',
          'HX-Trigger': 'revealed',
          'HX-Target': 'next',
          'HX-Current-URL': searchPageUrl
        }
      });
      
      const html = apiResponse.data;
      
      
      // Parse the HTML
      const $ = cheerio.load(html);
      
      // Extract manga results
      const results = [];
      
      // Find all manga entries using the correct selector path
      const mangaElements = $('.bge');
      console.log('Number of manga elements found:', mangaElements.length);
      
      // Debug: Log the HTML structure of the first manga element if any
      if (mangaElements.length > 0) {
        // console.log('First manga element HTML:', mangaElements.first().html());
        
        // Process each manga element
        mangaElements.each((index, element) => {
          const $element = $(element);
          
          // Extract manga details
          const title = $element.find('.kan h3').text().trim();
          const alternativeTitle = $element.find('.judul2').text().trim();
          const description = $element.find('.kan p').text().trim();
          const imageUrl = $element.find('.bgei img').attr('src');
          const mangaUrl = $element.find('.bgei a').attr('href');
          
          // Extract type and genre
          const typeInfoText = $element.find('.tpe1_inf').text().trim();
          const typeMatch = typeInfoText.match(/^(\w+)\s+(.+)$/);
          const type = typeMatch ? typeMatch[1] : '';
          const genre = typeMatch ? typeMatch[2] : '';
          
          // Extract chapter information
          const firstChapter = {
            title: $element.find('.new1:first-child span:last-child').text().trim(),
            url: $element.find('.new1:first-child a').attr('href')
          };
          
          const latestChapter = {
            title: $element.find('.new1:last-child span:last-child').text().trim(),
            url: $element.find('.new1:last-child a').attr('href')
          };
          
          // Add to results
          results.push({
            title,
            alternativeTitle,
            description,
            imageUrl,
            mangaUrl: mangaUrl ? `${BASE_URL}${mangaUrl}` : '',
            type,
            genre,
            firstChapter: {
              ...firstChapter,
              url: firstChapter.url ? `${BASE_URL}${firstChapter.url}` : ''
            },
            latestChapter: {
              ...latestChapter,
              url: latestChapter.url ? `${BASE_URL}${latestChapter.url}` : ''
            }
          });
        });
      } else {
        console.log('No manga elements found in the API response');
        console.log('API Response:', html);
      }
      
      console.log('Number of results extracted:', results.length);
      return results;
    } catch (error) {
      console.error('Error searching manga:', error);
      throw new Error(`Failed to search manga: ${error.message}`);
    }
  }
};

module.exports = searchService; 