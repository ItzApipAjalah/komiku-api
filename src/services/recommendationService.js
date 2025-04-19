const axios = require('axios');
const cheerio = require('cheerio');
const { BASE_URL } = require('../utils/constants');

/**
 * Service for handling manga recommendations
 */
const recommendationService = {
  /**
   * Get manga recommendations from the homepage
   * @returns {Promise<Array>} - Array of recommended manga
   */
  getRecommendations: async () => {
    try {
      // Fetch the homepage
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
      
      const html = response.data;
      
      // Parse the HTML
      const $ = cheerio.load(html);
      
      // Extract recommendations
      const recommendations = [];
      
      // Find the recommendations section
      const recommendationsSection = $('.perapih:contains("Rekomendasi Komiku")');
      
      if (recommendationsSection.length) {
        // Find all manga entries in the recommendations section
        const mangaElements = recommendationsSection.find('.ls2');
        
        mangaElements.each((index, element) => {
          const $element = $(element);
          
          // Extract manga details
          const title = $element.find('h3 a').text().trim();
          const url = $element.find('h3 a').attr('href');
          const imageUrl = $element.find('.ls2v img').attr('src');
          const genre = $element.find('.ls2t').text().trim();
          const latestChapter = {
            title: $element.find('.ls2l').text().trim(),
            url: $element.find('.ls2l').attr('href')
          };
          
          // Check if it's a hot manga
          const isHot = $element.find('.svg.hot').length > 0;
          
          // Add to recommendations
          recommendations.push({
            title,
            url: url ? `${BASE_URL}${url}` : '',
            imageUrl,
            genre,
            latestChapter: {
              ...latestChapter,
              url: latestChapter.url ? `${BASE_URL}${latestChapter.url}` : ''
            },
            isHot
          });
        });
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }
  }
};

module.exports = recommendationService; 