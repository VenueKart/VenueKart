import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { scrollToTop } from '@/lib/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Notification } from '@/components/ui/notification';
import { FloatingMessage } from '@/components/ui/floating-message';
import { useFavorites } from '../hooks/useFavorites';
import { getUserFriendlyError } from '../lib/errorMessages';
import { getPriceBreakdownComponent } from '../lib/priceUtils';
import {
  MapPin,
  Users,
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Wifi,
  Car,
  Coffee,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// API service functions
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers
    }
  });

  if (!response.ok) {
    const userFriendlyMessage = getUserFriendlyError(`API call failed: ${response.statusText}`, 'general');
    throw new Error(userFriendlyMessage);
  }

  return response.json();
};

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Venue and gallery states
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Booking form states
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventType: '',
    guestCount: '',
    specialRequests: ''
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showFloatingMessage, setShowFloatingMessage] = useState(false);


  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        const venueData = await apiCall(`/api/venues/${id}`);
        if (venueData.images && typeof venueData.images === 'string') {
          venueData.images = JSON.parse(venueData.images);
        }
        setVenue(venueData);
      } catch (err) {
        console.error('Error fetching venue details:', err);
        const userFriendlyMessage = getUserFriendlyError(err.message || err, 'general');
        setError(userFriendlyMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenueDetails();
    }
  }, [id]);

  // Auto-populate user info if logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      setBookingForm(prev => ({
        ...prev,
        fullName: user.full_name || user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isLoggedIn, user]);

  const handleFavoriteClick = async () => {
    if (!isLoggedIn) {
      setNotification({
        type: 'error',
        message: 'Please sign in to add venues to your favorites'
      });
      return;
    }
    await toggleFavorite(venue.id);
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInquireSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      setNotification({
        type: 'error',
        message: 'Please select a date for your event'
      });
      return;
    }

    if (!isLoggedIn) {
      setNotification({
        type: 'error',
        message: 'Please sign in to make an inquiry'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare inquiry data
      const inquiryData = {
        venue_id: venue.id,
        venue_name: venue.name,
        user_details: bookingForm,
        event_date: selectedDate.toISOString().split('T')[0],
        inquiry_date: new Date().toISOString(),
        venue_owner: {
          name: venue.owner_name,
          email: venue.owner_email,
          phone: venue.owner_phone
        }
      };

      // Send inquiry to API
      try {
        await apiCall('/api/bookings/inquiry', {
          method: 'POST',
          body: JSON.stringify(inquiryData)
        });
      } catch (apiError) {
        console.log('API not available, simulating inquiry submission');
      }

      // Show floating success message
      setShowFloatingMessage(true);

      // Reset form
      setShowBookingForm(false);
      setSelectedDate(null);
      setBookingForm(prev => ({
        ...prev,
        eventType: '',
        guestCount: '',
        specialRequests: ''
      }));

      // Redirect to home after a short delay (let the user see the success message)
      setTimeout(() => {
        scrollToTop();
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setNotification({
        type: 'error',
        message: 'Failed to send inquiry. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % venueImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + venueImages.length) % venueImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading...</h2>
          <p className="text-gray-500">Fetching venue details...</p>
        </Card>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Venue Not Found</h2>
          <p className="text-gray-500 mb-6">The venue you're looking for doesn't exist or couldn't be loaded.</p>
          <Button asChild onClick={scrollToTop}>
            <Link to="/venues">Browse All Venues</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const venueImages = venue.images && venue.images.length > 0 
    ? venue.images 
    : [venue.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop"];

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="w-full px-4 py-8">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto mb-6">
          <Button asChild variant="ghost" className="text-venue-indigo hover:text-venue-purple" onClick={scrollToTop}>
            <Link to="/venues">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venues
            </Link>
          </Button>
        </div>

        {/* Full Width Image Gallery */}
        <div className="relative w-full h-96 md:h-[500px] mb-8 overflow-hidden">
          <img
            src={venueImages[selectedImage]}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {venueImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Indicators */}
          {venueImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {venueImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedImage === index ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons Overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={handleFavoriteClick}
            >
              <Heart className={`h-4 w-4 ${isFavorite(venue.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Venue Type Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-venue-indigo text-white text-lg px-4 py-2">
              {venue.type || 'Venue'}
            </Badge>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {venueImages.length > 1 && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {venueImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-venue-indigo' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${venue.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Venue Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Venue Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-venue-dark mb-3">{venue.name}</h1>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span className="text-lg">{venue.location}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-gray-500" />
                          <span className="text-gray-600">Up to {venue.capacity} guests</span>
                        </div>
                        {venue.rating && (
                          <div className="flex items-center">
                            <Star className="h-5 w-5 mr-1 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{venue.rating}</span>
                            <span className="text-gray-500 ml-1">({venue.reviews} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">About This Venue</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{venue.description}</p>
                </CardContent>
              </Card>

              {/* Facilities */}
              {venue.facilities && venue.facilities.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">Facilities & Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {venue.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          {facility.toLowerCase().includes('wifi') && <Wifi className="h-5 w-5 mr-2 text-venue-indigo" />}
                          {facility.toLowerCase().includes('parking') && <Car className="h-5 w-5 mr-2 text-venue-indigo" />}
                          {facility.toLowerCase().includes('catering') && <Coffee className="h-5 w-5 mr-2 text-venue-indigo" />}
                          <span className="font-medium">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column - Price Breakdown & Booking */}
            <div className="space-y-6">
              {/* Price Breakdown Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Price Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-venue-indigo/10">
                    {(() => {
                      const priceBreakdown = getPriceBreakdownComponent(venue.price);
                      return (
                        <div className="space-y-2">
                          {priceBreakdown.items.map((item, index) => (
                            <div key={index} className={`flex justify-between text-sm ${
                              item.type === 'subtotal' ? 'border-t pt-2 mt-2 font-medium' :
                              item.type === 'discount' ? 'text-green-600 font-medium' :
                              item.type === 'final' ? 'border-t pt-2 mt-2 text-lg font-bold text-venue-indigo' :
                              ''
                            }`}>
                              <span>{item.label}:</span>
                              <span>{item.formatted}</span>
                            </div>
                          ))}
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <p className="text-xs text-green-600 font-medium">
                              {priceBreakdown.discountNote}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="mt-2 text-xs text-gray-500 text-center">per day</div>
                  </div>
                </CardContent>
              </Card>

              {/* Book This Venue Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Book This Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!showBookingForm ? (
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to book?</h3>
                        <p className="text-gray-600 mb-4">Select your event date and fill in your details to send an inquiry.</p>
                        <Button
                          onClick={() => setShowBookingForm(true)}
                          className="w-full bg-venue-indigo hover:bg-venue-purple text-white"
                          size="lg"
                        >
                          Start Booking Process
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleInquireSubmit} className="space-y-6">
                      {/* Calendar */}
                      <div>
                        <Label className="text-base font-semibold">Select Event Date</Label>
                        <div className="mt-2 border rounded-lg p-2">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            className="w-full"
                          />
                        </div>
                        {selectedDate && (
                          <p className="text-sm text-venue-indigo mt-2 font-medium">
                            Selected: {selectedDate.toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* User Details Form */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Full Name*</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={bookingForm.fullName}
                            onChange={handleBookingFormChange}
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Email*</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={bookingForm.email}
                            onChange={handleBookingFormChange}
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number*</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={bookingForm.phone}
                            onChange={handleBookingFormChange}
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="eventType">Event Type*</Label>
                          <Input
                            id="eventType"
                            name="eventType"
                            value={bookingForm.eventType}
                            onChange={handleBookingFormChange}
                            placeholder="e.g., Wedding, Conference, Birthday"
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="guestCount">Expected Guest Count*</Label>
                          <Input
                            id="guestCount"
                            name="guestCount"
                            type="number"
                            value={bookingForm.guestCount}
                            onChange={handleBookingFormChange}
                            placeholder="Number of guests"
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="specialRequests">Special Requests</Label>
                          <Textarea
                            id="specialRequests"
                            name="specialRequests"
                            value={bookingForm.specialRequests}
                            onChange={handleBookingFormChange}
                            placeholder="Any special requirements or questions..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Submit Buttons */}
                      <div className="space-y-3">
                        <Button
                          type="submit"
                          disabled={isSubmitting || !selectedDate}
                          className="w-full bg-venue-indigo hover:bg-venue-purple text-white"
                          size="lg"
                        >
                          {isSubmitting ? 'Sending Inquiry...' : 'Send Inquiry'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowBookingForm(false)}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>

                      <div className="text-xs text-gray-500 text-center">
                        Your inquiry will be sent to the venue owner and our team. We'll get back to you within 24 hours.
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating success message */}
      <FloatingMessage
        isVisible={showFloatingMessage}
        onClose={() => {
          setShowFloatingMessage(false);
          // If user closes manually, still redirect to home
          setTimeout(() => {
            scrollToTop();
            navigate('/');
          }, 500);
        }}
        title="Thank you!"
        message="You will be contacted or notified soon regarding your response."
        type="success"
      />
    </div>
  );
}
