import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { scrollToTop } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import venueService from '../services/venueService';
import { getUserFriendlyError } from '../lib/errorMessages';
import { getPricingInfo } from '../lib/priceUtils';
import { PUNE_AREAS, VENUE_TYPES } from '@/constants/venueOptions';
import {
  MapPin,
  Users,
  Filter,
  X,
  SlidersHorizontal,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

export default function Venues() {
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);
  const [venueTypes, setVenueTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [venuesPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isLoggedIn } = useAuth();

  const handleFavoriteClick = async (venueId) => {
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent('app-error', { detail: { title: 'Sign in required', message: 'Please sign in to add venues to your favorites.' } }));
      return;
    }
    await toggleFavorite(venueId);
  };

  // Filter states
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [capacityRange, setCapacityRange] = useState([0, 5000]);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [maxCapacity, setMaxCapacity] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadVenues();
  }, [currentPage, selectedType, selectedLocation, searchQuery]);

  useEffect(() => {
    const location = searchParams.get('location');
    const venue = searchParams.get('venue');
    const type = searchParams.get('type');

    if (location) {
      setSelectedLocation(location);
    }
    if (venue) {
      setSearchQuery(venue);
    }
    if (type) {
      const typeMap = {
        'banquet': 'Banquet halls',
        'wedding': 'Wedding Venues',
        'conference': 'Conference Halls',
        'resort': 'Hotels & resorts'
      };
      setSelectedType(typeMap[type] || type);
    }
  }, [searchParams]);

  const loadFilterOptions = async () => {
    try {
      setFilterOptionsLoading(true);
      const options = await venueService.getFilterOptions();

      setVenueTypes(options.venueTypes || []);
      setLocations(options.locations || []);

      if (options.priceRange) {
        const roundedMaxPrice = Math.ceil(options.priceRange.max / 10000) * 10000;
        setMaxPrice(roundedMaxPrice);
        setPriceRange([0, roundedMaxPrice]);
      }

      if (options.capacityRange) {
        const roundedMaxCapacity = Math.ceil(options.capacityRange.max / 100) * 100;
        setMaxCapacity(roundedMaxCapacity);
        setCapacityRange([0, roundedMaxCapacity]);
      }

      console.log('Loaded filter options:', options);
    } catch (error) {
      console.error('Error loading filter options:', error);
      setVenueTypes(VENUE_TYPES);
      setLocations(PUNE_AREAS);
    } finally {
      setFilterOptionsLoading(false);
    }
  };

  const loadVenues = async () => {
    try {
      setLoading(true);

      const filters = {
        page: currentPage,
        limit: venuesPerPage,
        location: selectedLocation || undefined,
        type: selectedType || undefined,
        search: searchQuery || undefined
      };

      const response = await venueService.getVenues(filters);

      const apiVenues = response.venues.map(venue => ({
        id: venue._id || venue.id,
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
        price: parseFloat(venue.price_per_day || venue.price),
        reviews: venue.total_bookings || 0,
        image: venue.images && venue.images.length > 0 ? venue.images[0] : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
        facilities: venue.facilities || [],
        type: venue.type || "Venue",
        description: venue.description || "Beautiful venue perfect for your special events."
      }));

      setVenues(apiVenues);
      setPagination(response.pagination);

    } catch (error) {
      console.error('Error loading venues:', error);
      const fallbackVenues = [
        {
          id: 1,
          name: "Elegant Banquet Hall",
          type: "Banquet halls",
          location: "Kharadi",
          capacity: 300,
          price: 45000,
          price_per_day: 45000,
          description: "Perfect venue for weddings and celebrations",
          images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop"],
          facilities: ["Air Conditioning", "Parking", "Catering"],
          status: "active"
        },
        {
          id: 2,
          name: "Garden Paradise Resort",
          type: "Hotels & resorts",
          location: "Wagholi",
          capacity: 500,
          price: 65000,
          price_per_day: 65000,
          description: "Beautiful garden resort for outdoor events",
          images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop"],
          facilities: ["Garden Area", "Swimming Pool", "Catering"],
          status: "active"
        },
        {
          id: 3,
          name: "Royal Conference Center",
          type: "Auditoriums",
          location: "Hinjewadi",
          capacity: 200,
          price: 35000,
          price_per_day: 35000,
          description: "Modern conference facility with latest technology",
          images: ["https://images.unsplash.com/photo-1540518614846-7eded47ee3b7?w=400&h=300&fit=crop"],
          facilities: ["AV Equipment", "WiFi", "Air Conditioning"],
          status: "active"
        }
      ];
      setVenues(fallbackVenues);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: fallbackVenues.length,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVenues = () => {
    let filtered = venues;

    if (showFavoritesOnly) {
      filtered = filtered.filter(venue => isFavorite(venue.id));
    }

    filtered = filtered.filter(venue =>
      venue.price >= priceRange[0] && venue.price <= priceRange[1] &&
      venue.capacity >= capacityRange[0] && venue.capacity <= capacityRange[1]
    );

    return filtered;
  };

  const filteredVenues = getFilteredVenues();

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedType, selectedLocation, searchQuery]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedType("");
    setSelectedLocation("");
    setSearchQuery("");
    setShowFavoritesOnly(false);
    setCurrentPage(1);
    loadFilterOptions();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        {/* Header (instant show) */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
            Find Your Perfect Venue
          </h1>
          <p className="text-gray-600 mb-6">
            {loading ? 'Loading venues...' : `Discover ${pagination.totalCount} amazing venues for your special occasions`}
          </p>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <motion.div
            className={`lg:w-72 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'} lg:sticky lg:top-24 lg:self-start`}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={transition}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-venue-dark flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </h2>
                  <Button
                    variant={showFavoritesOnly ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={showFavoritesOnly ? "bg-venue-indigo text-white" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    Favorites
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <Input
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>


              {/* Venue Type */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">Venue Type</label>
                <AutocompleteInput
                  options={filterOptionsLoading ? ['Loading...'] : venueTypes}
                  value={selectedType}
                  onChange={setSelectedType}
                  placeholder={filterOptionsLoading ? "Loading..." : "Select venue type..."}
                  disabled={filterOptionsLoading}
                  className="w-full"
                />
              </div>

              {/* Location */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <AutocompleteInput
                  options={filterOptionsLoading ? ['Loading...'] : locations}
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  placeholder={filterOptionsLoading ? "Loading..." : "Select location..."}
                  disabled={filterOptionsLoading}
                  className="w-full"
                />
              </div>

              {/* Price Range */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={maxPrice}
                  step={10000}
                  className="w-full"
                  disabled={filterOptionsLoading}
                />
              </div>

              {/* Capacity Range */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Capacity: {capacityRange[0]} - {capacityRange[1]} guests
                </label>
                <Slider
                  value={capacityRange}
                  onValueChange={setCapacityRange}
                  max={maxCapacity}
                  step={100}
                  className="w-full"
                  disabled={filterOptionsLoading}
                />
              </div>

              {/* Clear All Button at Bottom */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Venue Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="h-56 bg-gray-200"></div>
                    <CardContent className="p-6 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredVenues.length === 0 && venues.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No venues available</h3>
                <p className="text-gray-500 mb-4">Check back later for new venue listings</p>
              </Card>
            ) : filteredVenues.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No venues found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters to see more results</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <>
                {/* Results Summary */}
                <motion.div
                  className="flex justify-between items-center mb-6"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  transition={transition}
                >
                  <p className="text-gray-600">
                    Showing {filteredVenues.length} of {pagination.totalCount} venues
                    {showFavoritesOnly || selectedType || selectedLocation || searchQuery || (priceRange[0] > 0) || (capacityRange[0] > 0) ? ' (filtered)' : ''}
                  </p>
                  {pagination.totalPages > 1 && (
                    <div className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                  )}
                </motion.div>

                {/* Venue Grid - Max 4 cards per row with wider cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr mb-8">
                  {filteredVenues.map((venue, idx) => (
                    <motion.div
                      key={venue.id}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ ...transition, delay: (idx % 4) * 0.05 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full w-full">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={venue.image}
                            alt={venue.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4 flex gap-2">
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
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary" className="bg-venue-indigo text-white">
                              {venue.type}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-5 flex flex-col flex-1">
                          <h3 className="text-lg font-semibold text-venue-dark mb-2 group-hover:text-venue-indigo transition-colors line-clamp-1">
                            {venue.name}
                          </h3>

                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="text-sm line-clamp-1">{venue.location}</span>
                          </div>

                          <div className="flex items-center text-gray-600 mb-4">
                            <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="text-sm">Up to {venue.capacity} guests</span>
                          </div>

                          <div className="mt-auto space-y-3">
                            <div className="text-center">
                              <span className="text-xl font-bold text-venue-indigo">
                                {getPricingInfo(venue.price, 'listing').formattedPrice}
                              </span>
                              <span className="text-gray-500 text-sm ml-1">/day</span>
                            </div>
                            <Button
                              asChild
                              className="w-full bg-venue-indigo hover:bg-venue-purple text-white"
                              onClick={scrollToTop}
                            >
                              <Link to={`/venue/${venue.id}`}>
                                Book Now
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div
                    className="flex justify-center items-center space-x-2 mt-8"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    transition={transition}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="flex items-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNumber = pagination.totalPages - 4 + i;
                        } else {
                          pageNumber = pagination.currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={pagination.currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className={pagination.currentPage === pageNumber ? "bg-venue-indigo text-white" : ""}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
