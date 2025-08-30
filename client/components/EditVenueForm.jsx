import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { VENUE_TYPES } from '@/constants/venueOptions';

export default function EditVenueForm({ isOpen, onClose, onSubmit, venue }) {
  const [formData, setFormData] = useState({
    venueName: '',
    description: '',
    venueType: '',
    footfall: '',
    location: '',
    images: [],
    facilities: [''],
    price: ''
  });

  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when venue prop changes
  useEffect(() => {
    if (venue) {
      setFormData({
        venueName: venue.name || '',
        description: venue.description || '',
        venueType: venue.type || '',
        footfall: venue.capacity || '',
        location: venue.location || '',
        images: venue.images || [venue.image || ''],
        facilities: venue.facilities || [''],
        price: venue.price || venue.priceMin || ''
      });
    }
  }, [venue]);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
      return;
    }

    files.forEach(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: 'Each image must be less than 10MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
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

    if (!formData.venueName.trim()) {
      newErrors.venueName = 'Venue name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.footfall || formData.footfall <= 0) {
      newErrors.footfall = 'Valid footfall capacity is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    // Images are now optional - no validation needed
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData.facilities.filter(f => f.trim()).length === 0) {
      newErrors.facilities = 'At least one facility is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImagesToCloudinary = async (imageDataArray) => {
    try {
      setUploadingImages(true);

      // Filter out already uploaded images (URLs) from new base64 images
      const newImages = imageDataArray.filter(img => img.startsWith('data:image/'));
      const existingUrls = imageDataArray.filter(img => !img.startsWith('data:image/'));

      let newImageUrls = [];
      if (newImages.length > 0) {
        const response = await fetch('/api/upload/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            images: newImages,
            folder: 'venuekart/venues'
          })
        });

        if (!response.ok) {
          // Simple error handling without cloning
          console.error('Image upload failed:', response.status, response.statusText);
          // Return existing URLs and continue without new images
          setErrors(prev => ({ ...prev, images: 'New image upload failed, but venue can be saved with existing images' }));
          return existingUrls;
        }

        const data = await response.json();
        newImageUrls = data.images.map(img => img.url);
      }

      return [...existingUrls, ...newImageUrls];
    } catch (error) {
      console.error('Image upload error:', error);
      // Return existing URLs and continue
      setErrors(prev => ({ ...prev, images: 'Image upload failed, but venue can be saved with existing images' }));
      return imageDataArray.filter(img => !img.startsWith('data:image/'));
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

        // Upload new images to Cloudinary (optional)
        let imageUrls = await uploadImagesToCloudinary(formData.images);

        const venueData = {
          ...formData,
          images: imageUrls, // Use Cloudinary URLs
          facilities: formData.facilities.filter(f => f.trim()),
          footfall: parseInt(formData.footfall),
          price: parseInt(formData.price),
          venueType: formData.venueType
        };
        await onSubmit({ ...venue, ...venueData });
        onClose();
        setErrors({});
      } catch (error) {
        console.error('Form submission failed:', error);
        setErrors(prev => ({ ...prev, general: error.message || 'Failed to submit form' }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-venue-dark">Edit Venue</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name *
              </label>
              <Input
                value={formData.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                placeholder="Enter venue name"
                className={errors.venueName ? 'border-red-500' : ''}
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
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Venue Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Type (Optional)
              </label>
              <AutocompleteInput
                options={VENUE_TYPES}
                value={formData.venueType}
                onChange={(value) => handleInputChange('venueType', value)}
                placeholder="Type to search..."
                className={`w-full ${errors.venueType ? 'border-red-500' : ''}`}
              />
              {errors.venueType && (
                <p className="text-red-500 text-sm mt-1">{errors.venueType}</p>
              )}
            </div>

            {/* Footfall and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footfall Capacity *
                </label>
                <Input
                  type="number"
                  value={formData.footfall}
                  onChange={(e) => handleInputChange('footfall', e.target.value)}
                  placeholder="Maximum guests"
                  className={errors.footfall ? 'border-red-500' : ''}
                />
                {errors.footfall && (
                  <p className="text-red-500 text-sm mt-1">{errors.footfall}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day (₹) *
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter price"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Optional - up to 10 allowed)
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> venue images
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Venue ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
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
                
                <p className="text-sm text-gray-600">
                  {formData.images.length}/10 images uploaded
                  {formData.images.length === 0 && ' (Images are optional)'}
                </p>
              </div>
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facilities *
              </label>
              <div className="space-y-2">
                {formData.facilities.map((facility, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={facility}
                      onChange={(e) => handleFacilityChange(index, e.target.value)}
                      placeholder="Enter facility (e.g., AC, Parking, Catering)"
                      className="flex-1"
                    />
                    {formData.facilities.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
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
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Facility
                </Button>
              </div>
              {errors.facilities && (
                <p className="text-red-500 text-sm mt-1">{errors.facilities}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadingImages || isSubmitting}
                className="flex-1 bg-venue-indigo hover:bg-venue-purple text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading Images...
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Venue...
                  </div>
                ) : 'Update Venue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
