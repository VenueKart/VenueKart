import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Badge } from '@/components/ui/badge';
import { Upload, X, MapPin, Building, Users, DollarSign, FileText, Camera, Plus, Star, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import venueService from '@/services/venueService';
import { useNotifications } from '@/components/ui/notification';
import { PUNE_AREAS, VENUE_TYPES } from '@/constants/venueOptions';
import { getUserFriendlyError } from '@/lib/errorMessages';

// Using shared constants from venueOptions

const AVAILABLE_AMENITIES = [
  'Parking', 'WiFi', 'AC', 'Sound System', 'Projector', 'Stage', 'Catering', 
  'Bar Service', 'Photography', 'Decoration', 'Valet Parking', 'Security',
  'Garden Area', 'Swimming Pool', 'Dance Floor', 'Lighting Setup'
];

export default function AddVenue() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    venueName: '',
    area: '',
    venueType: '',
    capacity: '',
    price: '',
    description: '',
    amenities: [],
    images: []
  });
  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file,
            preview: e.target.result,
            name: file.name
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.venueName.trim()) newErrors.venueName = 'Venue name is required';
    if (!formData.area) newErrors.area = 'Area is required';
    if (!formData.venueType) newErrors.venueType = 'Venue type is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.amenities.length === 0) newErrors.amenities = 'Please select at least one amenity';
    if (uploadedImages.length === 0) newErrors.images = 'Please upload at least one image';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if user is logged in and is a venue owner
    if (!isLoggedIn) {
      showError('Please log in to add a venue');
      navigate('/signin');
      return;
    }

    if (user.userType !== 'venue-owner') {
      showError('Only venue owners can add venues');
      return;
    }

    setLoading(true);
    try {
      await venueService.createVenue(formData, uploadedImages);

      showSuccess('Venue added successfully! 🎉');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error adding venue:', error);
      showError(getUserFriendlyError(error, 'general'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-venue-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-venue-lavender/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-56 h-56 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div
                        
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-venue-purple" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-venue-purple to-venue-indigo bg-clip-text text-transparent">
                Add Your Stunning Venue
              </h1>
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
            <p className="text-gray-600 text-lg">Create a magical listing that will enchant your guests</p>
          </div>

          {/* Form Card */}
          <div
                        
                      >
            <Card className="shadow-2xl border-0 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20">
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-10">
                  
                  {/* Venue Name - Full Width */}
                  <div
                    
                    animate={{ opacity: 1, x: 0 }}
                    
                    className="space-y-3"
                  >
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-venue-purple to-venue-indigo rounded-xl text-white">
                        <Building className="w-5 h-5" />
                      </div>
                      Venue Name
                    </label>
                    <Input
                      value={formData.venueName}
                      onChange={(e) => handleInputChange('venueName', e.target.value)}
                      placeholder="What's your venue called? ✨"
                      className="h-14 rounded-2xl border-0 bg-white/60 backdrop-blur-sm shadow-lg text-lg font-medium placeholder:text-gray-400 focus:bg-white/80 transition-all duration-300"
                    />
                    {errors.venueName && (
                      <p 
                        
                        
                        className="text-red-500 text-sm flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.venueName}
                      </p>
                    )}
                  </div>

                  {/* Area and Venue Type Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div
                      
                      animate={{ opacity: 1, x: 0 }}
                      
                      className="space-y-3"
                    >
                      <label className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl text-white">
                          <MapPin className="w-5 h-5" />
                        </div>
                        Location Area
                      </label>
                      <AutocompleteInput
                        options={PUNE_AREAS}
                        value={formData.area}
                        onChange={(value) => handleInputChange('area', value)}
                        placeholder="Type to search areas in Pune 📍"
                        className="h-14 rounded-2xl border-0 bg-white/60 backdrop-blur-sm shadow-lg text-lg font-medium placeholder:text-gray-400 focus:bg-white/80 transition-all duration-300"
                      />
                      {errors.area && (
                        <p 
                          
                          
                          className="text-red-500 text-sm flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.area}
                        </p>
                      )}
                    </div>

                    <div
                      
                      animate={{ opacity: 1, x: 0 }}
                      
                      className="space-y-3"
                    >
                      <label className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl text-white">
                          <Star className="w-5 h-5" />
                        </div>
                        Venue Type
                      </label>
                      <AutocompleteInput
                        options={VENUE_TYPES}
                        value={formData.venueType}
                        onChange={(value) => handleInputChange('venueType', value)}
                        placeholder="Type venue type 🎭"
                        className="h-14 rounded-2xl border-0 bg-white/60 backdrop-blur-sm shadow-lg text-lg font-medium placeholder:text-gray-400 focus:bg-white/80 transition-all duration-300"
                      />
                      {errors.venueType && (
                        <p 
                          
                          
                          className="text-red-500 text-sm flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.venueType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Capacity and Price Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div
                      
                      animate={{ opacity: 1, x: 0 }}
                      
                      className="space-y-3"
                    >
                      <label className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl text-white">
                          <Users className="w-5 h-5" />
                        </div>
                        Guest Capacity
                      </label>
                      <Input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => handleInputChange('capacity', e.target.value)}
                        placeholder="How many guests can you host? 👥"
                        className="h-14 rounded-2xl border-0 bg-white/60 backdrop-blur-sm shadow-lg text-lg font-medium placeholder:text-gray-400 focus:bg-white/80 transition-all duration-300"
                      />
                      {errors.capacity && (
                        <p 
                          
                          
                          className="text-red-500 text-sm flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.capacity}
                        </p>
                      )}
                    </div>

                    <div
                      
                      animate={{ opacity: 1, x: 0 }}
                      
                      className="space-y-3"
                    >
                      <label className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl text-white">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        Price Per Event
                      </label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="Your pricing in ₹ 💰"
                        className="h-14 rounded-2xl border-0 bg-white/60 backdrop-blur-sm shadow-lg text-lg font-medium placeholder:text-gray-400 focus:bg-white/80 transition-all duration-300"
                      />
                      {errors.price && (
                        <p 
                          
                          
                          className="text-red-500 text-sm flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.price}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div
                    
                    
                    
                    className="space-y-6"
                  >
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl text-white">
                        <Plus className="w-5 h-5" />
                      </div>
                      Amazing Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {AVAILABLE_AMENITIES.map((amenity, index) => (
                        <div
                          key={amenity}
                          
                          
                          
                        >
                          <Badge
                            variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                            className={`cursor-pointer px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 text-center w-full ${
                              formData.amenities.includes(amenity)
                                ? 'bg-gradient-to-r from-venue-purple to-venue-indigo text-white shadow-lg shadow-venue-purple/25'
                                : 'hover:bg-gradient-to-r hover:from-venue-purple hover:to-venue-indigo hover:text-white border-gray-200 bg-white/50'
                            }`}
                            onClick={() => handleAmenityToggle(amenity)}
                          >
                            {amenity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {errors.amenities && (
                      <p
                        
                        
                        className="text-red-500 text-sm flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.amenities}
                      </p>
                    )}
                    {errors.images && (
                      <p
                        
                        
                        className="text-red-500 text-sm flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.images}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div
                    
                    
                    
                    className="space-y-3"
                  >
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl text-white">
                        <FileText className="w-5 h-5" />
                      </div>
                      Tell Your Story
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Paint a picture with words... What makes your venue magical? ✨"
                      className="min-h-[140px] rounded-2xl border-0 bg-white/60 backdrop-blur-sm shadow-lg text-lg resize-none placeholder:text-gray-400 focus:bg-white/80 transition-all duration-300"
                    />
                    {errors.description && (
                      <p 
                        
                        
                        className="text-red-500 text-sm flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div
                    
                    
                    
                    className="space-y-6"
                  >
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl text-white">
                        <Camera className="w-5 h-5" />
                      </div>
                      Showcase Your Beauty
                    </label>
                    
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-venue-purple/30 rounded-3xl p-12 text-center bg-gradient-to-br from-venue-lavender/10 to-venue-purple/5 hover:border-venue-purple/50 transition-all duration-300 group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-venue-purple to-venue-indigo rounded-3xl w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-700 mb-2 text-lg font-medium">Drop your stunning photos here ��</p>
                        <p className="text-gray-500">or click to browse • JPG, PNG, WebP (Max 5MB each)</p>
                      </label>
                    </div>

                    {/* Image Preview */}
                    {uploadedImages.length > 0 && (
                      <div
                        
                        
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      >
                        {uploadedImages.map((image, index) => (
                          <div 
                            key={image.id}
                            
                            
                            
                            className="relative group"
                          >
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-32 object-cover rounded-2xl shadow-lg border-2 border-white/50"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute -top-2 -right-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div
                    
                    
                    
                    className="flex flex-col sm:flex-row gap-6 pt-8"
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-16 bg-gradient-to-r from-venue-purple to-venue-indigo hover:from-venue-indigo hover:to-venue-purple text-white font-semibold text-lg rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-venue-purple/25 hover:scale-105 transform"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating Magic...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5" />
                          Create My Venue
                          <Heart className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancel}
                      className="flex-1 h-16 text-gray-600 hover:text-gray-800 hover:bg-white/50 font-semibold text-lg rounded-2xl transition-all duration-300 backdrop-blur-sm border border-gray-200/50"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
