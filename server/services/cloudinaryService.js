import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate Cloudinary environment variables
const validateCloudinaryConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing Cloudinary environment variables: ${missing.join(', ')}`);
    console.warn('Image upload functionality will be disabled. Please configure Cloudinary credentials.');
    return false;
  }

  // Check for demo/placeholder values
  if (process.env.CLOUDINARY_API_KEY === 'demo_key' ||
      process.env.CLOUDINARY_CLOUD_NAME === 'demo' ||
      process.env.CLOUDINARY_API_SECRET === 'demo_secret') {
    console.warn('⚠️  Using demo Cloudinary credentials. Image upload will fail.');
    console.warn('Please set valid Cloudinary credentials to enable image uploads.');
    return false;
  }

  return true;
};

const isCloudinaryConfigured = validateCloudinaryConfig();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload image to Cloudinary
 * @param {string} imageData - Base64 image data or file path
 * @param {string} folder - Cloudinary folder name (optional)
 * @param {string} publicId - Custom public ID (optional)
 * @returns {Promise<Object>} - Cloudinary response with secure_url
 */
export async function uploadImage(imageData, folder = 'venuekart', publicId = null) {
  // Return mock data if Cloudinary is not properly configured
  if (!isCloudinaryConfigured) {
    console.log('📸 Cloudinary not configured, returning mock image URL');
    return {
      url: 'https://via.placeholder.com/800x600/6C63FF/FFFFFF?text=Image+Upload+Disabled',
      publicId: `mock_${Date.now()}`,
      width: 800,
      height: 600,
      format: 'jpg'
    };
  }

  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto:low', // Reduced quality for faster upload
      fetch_format: 'auto',
      transformation: [
        {
          width: 800,  // Reduced from 1200 for faster processing
          height: 600, // Reduced from 800 for faster processing
          crop: 'limit'
        }
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const result = await cloudinary.uploader.upload(imageData, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
export async function deleteImage(publicId) {
  // Return mock success if Cloudinary is not properly configured
  if (!isCloudinaryConfigured) {
    console.log('📸 Cloudinary not configured, simulating image deletion');
    return { result: 'ok' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} imageDataArray - Array of base64 image data
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<Object>>} - Array of Cloudinary responses
 */
export async function uploadMultipleImages(imageDataArray, folder = 'venuekart') {
  try {
    const results = [];

    // Upload images sequentially to reduce memory usage and server load
    for (const imageData of imageDataArray) {
      const result = await uploadImage(imageData, folder);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Multiple images upload error:', error);
    throw new Error(`Failed to upload multiple images to Cloudinary: ${error.message}`);
  }
}

export default cloudinary;
