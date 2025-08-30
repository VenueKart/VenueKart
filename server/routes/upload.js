import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadImage, uploadMultipleImages, deleteImage } from '../services/cloudinaryService.js';

const router = Router();

// Upload single image
router.post('/image', authenticateToken, async (req, res) => {
  try {
    const { imageData, folder = 'venuekart' } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Validate base64 format
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Please provide a valid base64 image.' });
    }

    const result = await uploadImage(imageData, folder);
    
    res.json({
      message: 'Image uploaded successfully',
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// Upload multiple images
router.post('/images', authenticateToken, async (req, res) => {
  try {
    const { images, folder = 'venuekart' } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    if (images.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 images allowed' });
    }

    // Validate all images are base64 format
    for (const imageData of images) {
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ error: 'All images must be valid base64 format' });
      }
    }

    const results = await uploadMultipleImages(images, folder);
    
    res.json({
      message: 'Images uploaded successfully',
      images: results.map(result => ({
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format
      }))
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload images' });
  }
});

// Delete image
router.delete('/image/:publicId', authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Decode public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteImage(decodedPublicId);
    
    res.json({
      message: 'Image deleted successfully',
      result: result
    });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete image' });
  }
});

export default router;
