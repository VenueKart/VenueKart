import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { scrollToTop } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import venueService from '../services/venueService';
import { PUNE_AREAS, VENUE_TYPES } from '@/constants/venueOptions';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import { getUserFriendlyError } from '../lib/errorMessages';
import { getPricingInfo } from '../lib/priceUtils';
import {
  Search,
  MapPin,
  Users,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar,
  Award,
  Heart,
  Globe
} from 'lucide-react';

// API service functions
const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const userFriendlyMessage = getUserFriendlyError(`API call failed: ${response.statusText}`, 'general');
    throw new Error(userFriendlyMessage);
  }

  return response.json();
};

const howItWorks = [
  {
    step: 1,
    title: "Search & Browse",
    description: "Find venues that match your requirements using our smart filters",
    icon: Search
  },
  {
    step: 2,
    title: "Compare & Choose",
    description: "Compare prices, facilities, and reviews to make the best choice",
    icon: CheckCircle
  },
  {
    step: 3,
    title: "Book & Celebrate",
    description: "Secure your booking and celebrate your special moments worry-free",
    icon: Calendar
  }
];

const features = [
  {
    title: "Verified Listings",
    description: "All venues are thoroughly verified for authenticity and quality",
    icon: Shield
  },
  {
    title: "Transparent Pricing",
    description: "No hidden costs. See all charges upfront before booking",
    icon: DollarSign
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock customer support for all your queries",
    icon: Clock
  },
  {
    title: "Quality Assurance",
    description: "Premium venues curated by our expert team",
    icon: Award
  }
];

export default function Index() {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchVenue, setSearchVenue] = useState('');
  const [popularVenues, setPopularVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);
  const [venueTypes, setVenueTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isLoggedIn } = useAuth();

  const handleFavoriteClick = async (venueId) => {
    if (!isLoggedIn) {
      alert('Please sign in to add venues to your favorites');
      return;
    }
    await toggleFavorite(venueId);
  };

  useEffect(() => {
    loadPopularVenues();
    loadFilterOptions();
  }, []);

  const loadPopularVenues = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/venues?limit=3');

      // Extract venues array from API response
      const venues = data.venues || data;

      // Format venues data for display
      const formattedVenues = venues.map(venue => {
        const basePrice = parseFloat(venue.price_per_day || venue.price);
        const pricingInfo = getPricingInfo(basePrice, 'listing');

        return {
          id: venue.id,
          name: venue.name,
          location: venue.location,
          capacity: `Up to ${venue.capacity} guests`,
          price: pricingInfo.formattedPrice,
          image: venue.images && venue.images.length > 0 ? venue.images[0] : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
          facilities: venue.facilities || []
        };
      });

      setPopularVenues(formattedVenues);
    } catch (error) {
      console.error('Error loading popular venues:', error);
      // Fallback to demo venues if API fails
      const fallbackVenues = [
        {
          id: 1,
          name: "Elegant Banquet Hall",
          location: "Kharadi",
          capacity: "Up to 300 guests",
          price: "₹45,000",
          image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
          facilities: ["Air Conditioning", "Parking", "Catering"]
        },
        {
          id: 2,
          name: "Garden Paradise Resort",
          location: "Wagholi",
          capacity: "Up to 500 guests",
          price: "₹65,000",
          image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
          facilities: ["Garden Area", "Swimming Pool", "Catering"]
        },
        {
          id: 3,
          name: "Royal Conference Center",
          location: "Hinjewadi",
          capacity: "Up to 200 guests",
          price: "₹35,000",
          image: "https://images.unsplash.com/photo-1540518614846-7eded47ee3b7?w=400&h=300&fit=crop",
          facilities: ["AV Equipment", "WiFi", "Air Conditioning"]
        }
      ];
      setPopularVenues(fallbackVenues);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchVenue) params.set('type', searchVenue);
    window.location.href = `/venues?${params.toString()}`;
  };

  const loadFilterOptions = async () => {
    try {
      setFilterOptionsLoading(true);
      const options = await venueService.getFilterOptions();
      setVenueTypes(options.venueTypes || []);
      setLocations(options.locations || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
      setVenueTypes(VENUE_TYPES);
      setLocations(PUNE_AREAS);
    } finally {
      setFilterOptionsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Hotel Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-bold text-white mb-4 font-poppins"
            >
              Find the Perfect Venue for Your Event
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
            >
              Discover verified venues with transparent pricing
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="max-w-4xl mx-auto"
            >
              <form
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                    <div className="relative flex-1">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-venue-indigo" />
                      <AutocompleteInput
                        options={filterOptionsLoading ? ['Loading...'] : locations}
                        value={searchLocation}
                        onChange={setSearchLocation}
                        placeholder={filterOptionsLoading ? 'Loading...' : 'Search city or area'}
                        disabled={filterOptionsLoading}
                        className="pl-12 h-12 border-2 border-gray-200 focus:border-venue-indigo bg-white rounded-xl text-gray-700 placeholder:text-gray-400 font-medium transition-all duration-200 hover:border-venue-purple focus:ring-2 focus:ring-venue-indigo/20"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-venue-indigo" />
                      <AutocompleteInput
                        options={filterOptionsLoading ? ['Loading...'] : venueTypes}
                        value={searchVenue}
                        onChange={setSearchVenue}
                        placeholder={filterOptionsLoading ? 'Loading...' : 'Select venue type'}
                        disabled={filterOptionsLoading}
                        className="pl-12 h-12 border-2 border-gray-200 focus:border-venue-indigo bg-white rounded-xl text-gray-700 placeholder:text-gray-400 font-medium transition-all duration-200 hover:border-venue-purple focus:ring-2 focus:ring-venue-indigo/20"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-venue-indigo hover:bg-venue-purple text-white font-semibold whitespace-nowrap rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[120px]"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              Why Choose VenueKart?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make venue booking simple, transparent, and reliable with our premium features
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow duration-300 h-full">
                    <CardHeader>
                      <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-venue-indigo" />
                      </div>
                      <CardTitle className="text-venue-dark">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Venues */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              Popular Venues
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most loved venues, perfect for any celebration
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : popularVenues.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No venues available at the moment</p>
                <p className="text-gray-400">Check back later for amazing venue listings</p>
              </div>
            ) : (
              popularVenues.map((venue) => (
                <Card key={venue.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFavoriteClick(venue.id);
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            isFavorite(venue.id)
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-600 hover:text-red-500'
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">{venue.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{venue.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{venue.capacity}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {venue.facilities && venue.facilities.slice(0, 4).map((facility, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-venue-indigo">{venue.price}</span>
                      <Button asChild className="bg-venue-indigo hover:bg-venue-purple" onClick={scrollToTop}>
                        <Link to={`/venue/${venue.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-venue-indigo hover:bg-venue-purple" onClick={scrollToTop}>
              <Link to="/venues">
                View All Venues
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book your perfect venue in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center relative">
                  <div className="relative w-20 h-20 bg-venue-indigo rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-10 w-10 text-white" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-venue-purple rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-venue-dark mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full">
                      <ArrowRight className="h-6 w-6 text-venue-purple mx-auto" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
