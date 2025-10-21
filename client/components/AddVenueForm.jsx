import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { PUNE_AREAS, VENUE_TYPES } from '@/constants/venueOptions';
import { getUserFriendlyError } from '@/lib/errorMessages';
import apiClient from '../lib/apiClient.js';

export default function AddVenueForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    venueName: '',
    description: '',
    venueType: '',
    area: '',
    footfall: '',
    price: '',
    facilities: [''],
    images: []
  });

  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Image compression function
  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
      return;
    }

    // Process files one by one for better performance
    for (const file of files) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: 'Each image must be less than 10MB' }));
        continue;
      }

      try {
        // Compress image for faster upload
        const compressedFile = await compressImage(file, 800, 0.8);

        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, e.target.result]
          }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        setErrors(prev => ({ ...prev, images: 'Error processing image. Please try again.' }));
      }
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFacilityChange = (index, value) => {
    const newFacilities = [...formData.facilities];
    newFacilities[index] = value;
    setFormData(prev => ({
      ...prev,
      facilities: newFacilities
    }));
  };

  const addFacility = () => {
    setFormData(prev => ({
      ...prev,
      facilities: [...prev.facilities, '']
    }));
  };

  const removeFacility = (index) => {
    if (formData.facilities.length > 1) {
      setFormData(prev => ({
        ...prev,
        facilities: prev.facilities.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.venueName.trim()) {
      newErrors.venueName = 'Venue name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.area) {
      newErrors.area = 'Area is required';
    }

    // Footfall validation
    const footfall = parseInt(formData.footfall);
    if (!formData.footfall || isNaN(footfall) || footfall <= 0) {
      newErrors.footfall = 'Footfall capacity must be a number greater than 0';
    }

    // Price validation
    const price = parseInt(formData.price);

    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be a number greater than 0';
    }

    // Note: Images and facilities are now optional (no validation required)
    // Venue type is also optional (not required by server)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImagesToCloudinary = async (imageDataArray) => {
    // If no images, return empty array
    if (!imageDataArray || imageDataArray.length === 0) {
      return [];
    }

    try {
      setUploadingImages(true);
      const uploadedUrls = [];

      // Upload images sequentially for better performance and progress tracking
      for (let i = 0; i < imageDataArray.length; i++) {
        setErrors(prev => ({
          ...prev,
          images: `Uploading image ${i + 1} of ${imageDataArray.length}...`
        }));

        try {
          const data = await apiClient.postJson('/api/upload/image', {
            imageData: imageDataArray[i],
            folder: 'venuekart/venues'
          });

          if (!data || !data.url) {
            console.error('Image upload failed: invalid response');
            setErrors(prev => ({
              ...prev,
              images: `Warning: Failed to upload image ${i + 1}. Continuing with others...`
            }));
            continue;
          }

          uploadedUrls.push(data.url);

        } catch (imageError) {
          console.error(`Error uploading image ${i + 1}:`, imageError);
          // Continue with other images
          setErrors(prev => ({
            ...prev,
            images: `Warning: Failed to upload image ${i + 1}. Continuing with others...`
          }));
        }
      }

      // Clear upload progress message
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });

      return uploadedUrls;
    } catch (error) {
      console.error('Image upload error:', error);

      // Show more specific error message
      let userMessage = 'Image upload failed, but venue can be saved without images';
      if (error.message.includes('Must supply api_key') || error.message.includes('demo')) {
        userMessage = 'Image upload service not configured. Venue will be saved without images.';
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        userMessage = 'Authentication failed. Please sign in again.';
      } else if (error.message.includes('413') || error.message.includes('too large')) {
        userMessage = 'Images are too large. Please use smaller images.';
      }

      setErrors(prev => ({ ...prev, images: userMessage }));
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || uploadingImages) {
      return;
    }

    if (validateForm()) {
      try {
        setIsSubmitting(true);

        // Upload images to Cloudinary (optional)
        let imageUrls = await uploadImagesToCloudinary(formData.images);

        const venueData = {
          venueName: formData.venueName,
          description: formData.description,
          location: `${formData.area}, Pune`,
          footfall: parseInt(formData.footfall),
          price: parseInt(formData.price),
          images: imageUrls, // Use Cloudinary URLs instead of base64
          facilities: formData.facilities.filter(f => f.trim())
        };

        // Add optional fields only if they have values
        if (formData.venueType && formData.venueType.trim()) {
          venueData.venueType = formData.venueType;
        }

        await onSubmit(venueData);
        // Reset form only after successful submission
        setFormData({
          venueName: '',
          description: '',
          venueType: '',
          area: '',
          footfall: '',
          price: '',
          facilities: [''],
          images: []
        });
        setErrors({});
      } catch (error) {
        // Form stays open with data intact if submission fails
        console.error('Form submission failed:', error);
        setErrors(prev => ({ ...prev, general: getUserFriendlyError(error, 'general') }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 10, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl"
          >
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Add New Venue</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto px-6 py-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name *
              </label>
              <Input
                value={formData.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                placeholder="Enter venue name"
                className={`h-10 ${errors.venueName ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {errors.venueName && (
                <p className="text-red-500 text-sm mt-1">{errors.venueName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your venue..."
                rows={4}
                className={`resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Venue Type and Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Type (Optional)
                </label>
                <AutocompleteInput
                  options={VENUE_TYPES}
                  value={formData.venueType}
                  onChange={(value) => handleInputChange('venueType', value)}
                  placeholder="Type to search..."
                  className={`w-full h-10 ${errors.venueType ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500`}
                  data-field="venueType"
                  data-value={formData.venueType}
                />
                {errors.venueType && (
                  <p className="text-red-500 text-sm mt-1">{errors.venueType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (Pune) *
                </label>
                <AutocompleteInput
                  options={PUNE_AREAS}
                  value={formData.area}
                  onChange={(value) => handleInputChange('area', value)}
                  placeholder="Type to search..."
                  className={`w-full h-10 ${errors.area ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500`}
                  data-field="area"
                  data-value={formData.area}
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                )}
              </div>
            </div>

            {/* Footfall Capacity and Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footfall Capacity *
                </label>
                <Input
                  type="number"
                  value={formData.footfall}
                  onChange={(e) => handleInputChange('footfall', e.target.value)}
                  placeholder="Maximum guests"
                  className={`h-10 ${errors.footfall ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
                />
                {errors.footfall && (
                  <p className="text-red-500 text-sm mt-1">{errors.footfall}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Day (₹) *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Price per day"
                  className={`h-10 ${errors.price ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facilities (Optional)
              </label>
              <div className="space-y-2">
                {formData.facilities.map((facility, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={facility}
                      onChange={(e) => handleFacilityChange(index, e.target.value)}
                      placeholder="Enter facility (e.g., AC, Parking, Catering) - Optional"
                  className="flex-1 h-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {formData.facilities.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => removeFacility(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFacility}
                  className="w-full h-10 text-sm border-gray-300 hover:bg-gray-50 text-venue-indigo hover:text-venue-indigo focus:text-venue-indigo"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Facility
                </Button>
              </div>
              {errors.facilities && (
                <p className="text-red-500 text-sm mt-1">{errors.facilities}</p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Optional - up to 10 allowed)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload venue images</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                </label>
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                {formData.images.length}/10 images uploaded {formData.images.length === 0 && '(Images are optional)'}
              </p>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Venue ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.images && (
                <p className={`text-sm mt-1 ${errors.images.includes('Uploading') ? 'text-blue-600' : 'text-red-500'}`}>
                  {errors.images}
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadingImages || isSubmitting}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading Images...
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Venue...
                  </div>
                ) : 'Add Venue'}
              </Button>
            </div>
          </form>
        </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
