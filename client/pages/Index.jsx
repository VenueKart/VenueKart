import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { scrollToTop } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

import apiClient from '../lib/apiClient.js';
import { motion } from 'framer-motion';

const apiCall = async (url, options = {}) => {
  if (!options.method || options.method.toUpperCase() === 'GET') {
    return apiClient.getJson(url, options);
  }
  return apiClient.callJson(url, options);
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

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

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
      window.dispatchEvent(new CustomEvent('app-error', { detail: { title: 'Sign in required', message: 'Please sign in to add venues to your favorites.' } }));
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

      const venues = data.venues || data;

      const formattedVenues = venues.map(venue => {
        const basePrice = parseFloat(venue.price_per_day || venue.price);
        const pricingInfo = getPricingInfo(basePrice, 'listing');

        return {
          id: venue._id || venue.id,
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
      <motion.section
        className="relative h-[70vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transition}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat home-hero-image"
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </motion.div>

        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-4 font-poppins"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={transition}
            >
              Find the Perfect Venue for Your Event
            </motion.h1>
            <motion.p
              className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: 0.1 }}
            >
              Discover verified venues with transparent pricing
            </motion.p>

            <motion.div
              className="max-w-4xl mx-auto"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: 0.2 }}
            >
              <form
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                    <div className="relative flex-1">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-venue-indigo z-10" />
                      <AutocompleteInput
                        options={filterOptionsLoading ? ['Loading...'] : locations}
                        value={searchLocation}
                        onChange={setSearchLocation}
                        placeholder={filterOptionsLoading ? 'Loading...' : 'Search city or area'}
                        disabled={filterOptionsLoading}
                        className="pl-12 h-12 border-2 border-gray-200 focus:border-transparent bg-white rounded-xl text-gray-700 placeholder:text-gray-400 font-medium transition-all duration-200 hover:border-venue-purple focus:ring-2 focus:ring-venue-indigo/20"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-venue-indigo z-10" />
                      <AutocompleteInput
                        options={filterOptionsLoading ? ['Loading...'] : venueTypes}
                        value={searchVenue}
                        onChange={setSearchVenue}
                        placeholder={filterOptionsLoading ? 'Loading...' : 'Select venue type'}
                        disabled={filterOptionsLoading}
                        className="pl-12 h-12 border-2 border-gray-200 focus:border-transparent bg-white rounded-xl text-gray-700 placeholder:text-gray-400 font-medium transition-all duration-200 hover:border-venue-purple focus:ring-2 focus:ring-venue-indigo/20"
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
      </motion.section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={transition}
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
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ ...transition, delay: index * 0.05 }}
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

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={transition}
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
              popularVenues.map((venue, idx) => (
                <motion.div
                  key={venue.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ ...transition, delay: idx * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group transition-transform hover:-translate-y-0.5">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <CardFooter className="flex items-center justify-between mt-4 p-0">
                        <span className="text-2xl font-bold text-venue-indigo">{venue.price || '₹0'}</span>
                        <Button asChild className="bg-venue-indigo hover:bg-venue-purple" onClick={scrollToTop}>
                          <Link to={`/venue/${venue.id}`}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </motion.div>
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

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={transition}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book your perfect venue in just three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  className="text-center relative"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ ...transition, delay: index * 0.05 }}
                >
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
