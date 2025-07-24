const fs = require('fs');
const path = require('path');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);

/**
 * Deletes a file at specified path if exists
 * @param {string} filePath 
 */
async function deleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    // optionally rethrow or handle as needed
  }
}

/**
 * Generate file path or URL for uploaded files
 * @param {string} filename 
 * @param {string} folder 
 */
function getFileUrl(filename, folder = 'uploads') {
  return path.join('/', folder, filename); // depending on static setup
}

module.exports = {
  deleteFile,
  getFileUrl,
};
