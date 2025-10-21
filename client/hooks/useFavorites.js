import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient.js';
import { toast } from '@/components/ui/use-toast';

const API_BASE = '/api/favorites';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load user's favorite venue IDs
  const loadFavoriteIds = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const ids = await apiClient.getJson(`${API_BASE}/ids`);
      // Normalize to string IDs (MongoDB ObjectId)
      setFavoriteIds(new Set(ids.map(String)));
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403') || error.message.toLowerCase().includes('session')) {
        // Token expired/invalid: clear favorites silently
        setFavoriteIds(new Set());
      } else {
        console.error('Error loading favorite IDs:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add venue to favorites (optimistic)
  const addToFavorites = async (venueId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast({ title: 'Sign in required', description: 'Please sign in to add favorites', variant: 'destructive' });
      return false;
    }

    // optimistic update
    setFavoriteIds(prev => new Set([...prev, String(venueId)]));
    try {
      await apiClient.postJson(`${API_BASE}/${venueId}`, {});
      toast({ title: 'Added to favorites', description: 'We saved this venue to your favorites.' });
      return true;
    } catch (error) {
      // revert on error
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.delete(String(venueId));
        return next;
      });
      if (error.message.includes('401') || error.message.includes('403')) {
        toast({ title: 'Sign in required', description: 'Please sign in to add favorites', variant: 'destructive' });
      } else {
        window.dispatchEvent(new CustomEvent('app-error', { detail: { title: 'Unable to add favorite', message: error.message } }));
      }
    }
    return false;
  };

  // Remove venue from favorites (optimistic)
  const removeFromFavorites = async (venueId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast({ title: 'Sign in required', description: 'Please sign in to manage favorites', variant: 'destructive' });
      return false;
    }

    // optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      next.delete(String(venueId));
      return next;
    });

    try {
      await apiClient.deleteJson(`${API_BASE}/${venueId}`);
      toast({ title: 'Removed from favorites' });
      return true;
    } catch (error) {
      // revert on error
      setFavoriteIds(prev => new Set([...prev, String(venueId)]));
      if (error.message.includes('401') || error.message.includes('403')) {
        toast({ title: 'Sign in required', description: 'Please sign in to manage favorites', variant: 'destructive' });
      } else {
        window.dispatchEvent(new CustomEvent('app-error', { detail: { title: 'Unable to remove favorite', message: error.message } }));
      }
    }
    return false;
  };

  // Toggle favorite status
  const toggleFavorite = async (venueId) => {
    const favorite = favoriteIds.has(String(venueId));
    if (favorite) {
      return await removeFromFavorites(venueId);
    } else {
      return await addToFavorites(venueId);
    }
  };

  // Check if venue is favorite
  const isFavorite = (venueId) => {
    return favoriteIds.has(String(venueId));
  };

  // Load favorites on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadFavoriteIds();
    }
  }, []);

  return {
    favoriteIds,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    loadFavoriteIds
  };
};
