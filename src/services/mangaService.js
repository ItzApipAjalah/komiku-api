const axios = require('axios');
const cheerio = require('cheerio');
const { BASE_URL } = require('../utils/constants');

/**
 * Service for handling manga details operations
 */
const mangaService = {
  /**
   * Get manga details and chapter list
   * @param {string} mangaUrl - URL of the manga
   * @returns {Promise<Object>} - Manga details and chapter list
   */
  getMangaDetails: async (mangaUrl) => {
    try {
      // Fetch the manga page with headers
      const response = await axios.get(mangaUrl, {
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
      
      // Extract manga details
      const title = $('h1 span[itemprop="name"]').text().trim();
      const alternativeTitle = $('.j2').text().trim();
      const description = $('.desc').text().trim();
      const coverImage = $('.ims img').attr('src');
      
      // Extract manga type and genres
      const type = $('.inftable tr:contains("Jenis Komik") td:last-child').text().trim();
      const genres = [];
      $('.genre a span[itemprop="genre"]').each((index, element) => {
        genres.push($(element).text().trim());
      });
      
      // Extract status
      const status = $('.inftable tr:contains("Status") td:last-child').text().trim();
      
      // Extract author
      const author = $('.inftable tr:contains("Pengarang") td:last-child').text().trim();
      
      // Extract chapter list
      const chapters = [];
      $('#Daftar_Chapter tr').each((index, element) => {
        const $element = $(element);
        
        // Skip header row if it exists
        if (index === 0 && $element.find('th').length > 0) {
          return;
        }
        
        const chapterTitle = $element.find('.judulseries span').text().trim();
        const chapterUrl = $element.find('.judulseries a').attr('href');
        const readers = $element.find('.pembaca i').text().trim();
        const date = $element.find('.tanggalseries').text().trim();
        
        chapters.push({
          title: chapterTitle,
          url: chapterUrl ? `${BASE_URL}${chapterUrl}` : '',
          readers: parseInt(readers) || 0,
          date: date
        });
      });
      
      // Return manga details and chapter list
      return {
        title,
        alternativeTitle,
        description,
        coverImage,
        type,
        genres,
        status,
        author,
        chapters
      };
    } catch (error) {
      console.error('Error fetching manga details:', error);
      throw new Error(`Failed to fetch manga details: ${error.message}`);
    }
  }
};

module.exports = mangaService; 