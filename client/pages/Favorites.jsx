import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scrollToTop } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '../hooks/useFavorites';
import { formatPrice, formatPriceRange } from '@/lib/priceUtils';
import {
  MapPin,
  Users,
  Heart,
  ArrowRight
} from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/favorites', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (venueId) => {
    await toggleFavorite(venueId);
    // Remove from local state immediately for better UX
    setFavorites(prev => prev.filter(venue => venue.id !== venueId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-venue-indigo mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-venue-dark mb-4">Your Favorite Venues</h1>
          <p className="text-gray-600 mb-6">
            {favorites.length === 0 
              ? 'You haven\'t added any venues to your favorites yet.'
              : `You have ${favorites.length} favorite venue${favorites.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start exploring and click the heart icon on venues you love!</p>
            <Button asChild className="bg-venue-indigo hover:bg-venue-purple">
              <Link to="/venues" onClick={scrollToTop}>Browse Venues</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((venue) => (
              <Card key={venue.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={venue.images && venue.images.length > 0 ? venue.images[0] : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop"}
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
                          handleRemoveFavorite(venue.id);
                        }}
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      </Button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-venue-indigo text-white">
                        {venue.type || 'Venue'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-venue-dark mb-2 group-hover:text-venue-indigo transition-colors">
                      {venue.name}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{venue.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">Up to {venue.capacity} guests</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {venue.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {venue.facilities && venue.facilities.slice(0, 3).map((facility, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {venue.facilities && venue.facilities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{venue.facilities.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        {venue.priceMin && venue.priceMax && venue.priceMin !== venue.priceMax ? (
                          <div>
                            <span className="text-xl font-bold text-venue-indigo">
                              {formatPriceRange(venue.priceMin, venue.priceMax)}
                            </span>
                            <div className="text-sm text-gray-500">per day</div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xl font-bold text-venue-indigo">
                              {formatPrice(venue.price)}
                            </span>
                            <div className="text-sm text-gray-500">per day</div>
                          </div>
                        )}
                      </div>
                      <Button 
                        asChild 
                        className="bg-venue-indigo hover:bg-venue-purple"
                        onClick={scrollToTop}
                      >
                        <Link to={`/venue/${venue.id}`}>
                          View Details
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
