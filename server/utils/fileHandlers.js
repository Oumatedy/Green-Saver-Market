const { FILE_CONSTRAINTS } = require('./constants');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Process and optimize image
const processImage = async (file, options = {}) => {
  const {
    width = FILE_CONSTRAINTS.MAX_IMAGE_DIMENSIONS.WIDTH,
    height = FILE_CONSTRAINTS.MAX_IMAGE_DIMENSIONS.HEIGHT,
    quality = 80,
    format = 'webp'
  } = options;

  try {
    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    // Resize image while maintaining aspect ratio
    const resizeOptions = {
      width: Math.min(width, metadata.width),
      height: Math.min(height, metadata.height),
      fit: 'inside',
      withoutEnlargement: true
    };

    const processed = await image
      .resize(resizeOptions)
      [format]({ quality })
      .toBuffer();

    return {
      success: true,
      data: {
        buffer: processed,
        format,
        width: resizeOptions.width,
        height: resizeOptions.height
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to process image'
    };
  }
};

// Generate unique filename
const generateUniqueFilename = (originalname, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalname);
  return `${prefix}${timestamp}-${random}${ext}`;
};

// Save file to disk
const saveFileToDisk = async (buffer, filename, uploadDir) => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    return {
      success: true,
      filepath
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to save file'
    };
  }
};

// Delete file from disk
const deleteFileFromDisk = async (filepath) => {
  try {
    await fs.unlink(filepath);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete file'
    };
  }
};

// Get file mime type
const getFileMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

module.exports = {
  processImage,
  generateUniqueFilename,
  saveFileToDisk,
  deleteFileFromDisk,
  getFileMimeType
};
