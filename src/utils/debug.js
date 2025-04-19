const fs = require('fs');
const path = require('path');

/**
 * Save HTML content to a file for debugging
 * @param {string} html - HTML content to save
 * @param {string} filename - Name of the file to save to
 */
const saveHtmlToFile = (html, filename) => {
  try {
    const debugDir = path.join(__dirname, '../../debug');
    
    // Create debug directory if it doesn't exist
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }
    
    const filePath = path.join(debugDir, filename);
    fs.writeFileSync(filePath, html);
    console.log(`HTML saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving HTML to file:', error);
  }
};

module.exports = {
  saveHtmlToFile
}; 