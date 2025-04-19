const axios = require('axios');
const cheerio = require('cheerio');
const { BASE_URL } = require('../utils/constants');

/**
 * Service for handling chapter details operations
 */
const chapterService = {
  /**
   * Get chapter details and images
   * @param {string} chapterUrl - URL of the chapter
   * @returns {Promise<Object>} - Chapter details and images
   */
  getChapterDetails: async (chapterUrl) => {
    try {
      // Fetch the chapter page with headers
      const response = await axios.get(chapterUrl, {
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
      
      // Extract chapter details
      const title = $('#Judul h1').text().trim();
      
      // Extract manga title more accurately
      let mangaTitle = '';
      const mangaTitleElement = $('#Judul p a[title^="Komik"]');
      if (mangaTitleElement.length) {
        mangaTitle = mangaTitleElement.text().trim().replace('Komik ', '');
      } else {
        // Fallback to the first link in the description
        mangaTitle = $('#Judul p a b').first().text().trim();
      }
      
      const releaseDate = $('.tbl tr:contains("Tanggal Rilis") td:last-child').text().trim();
      const readDirection = $('.tbl tr:contains("Arah Baca") td:last-child').text().trim();
      
      // Extract chapter images
      const images = [];
      $('img[itemprop="image"]').each((index, element) => {
        const imageUrl = $(element).attr('src');
        const imageAlt = $(element).attr('alt');
        
        images.push({
          url: imageUrl,
          alt: imageAlt,
          order: index + 1
        });
      });
      
      // Extract navigation links from botmenu
      const botmenu = $('.botmenu .nxpr');
      const prevChapterUrl = botmenu.find('a.rl:first-child').attr('href');
      const chapterListUrl = botmenu.find('a:not(.rl)').attr('href');
      const nextChapterUrl = botmenu.find('a.rl:last-child').attr('href');
      
      // Extract chapter titles for navigation
      const prevChapterTitle = botmenu.find('a.rl:first-child').attr('title');
      const nextChapterTitle = botmenu.find('a.rl:last-child').attr('title');
      
      // Return chapter details and images
      return {
        title,
        mangaTitle,
        releaseDate,
        readDirection,
        images,
        navigation: {
          prev: {
            url: prevChapterUrl ? `${BASE_URL}${prevChapterUrl}` : null,
            title: prevChapterTitle || null
          },
          chapterList: chapterListUrl ? `${BASE_URL}${chapterListUrl}` : null,
          next: {
            url: nextChapterUrl ? `${BASE_URL}${nextChapterUrl}` : null,
            title: nextChapterTitle || null
          }
        }
      };
    } catch (error) {
      console.error('Error fetching chapter details:', error);
      throw new Error(`Failed to fetch chapter details: ${error.message}`);
    }
  }
};

module.exports = chapterService; 