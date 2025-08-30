import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

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
      setFavoriteIds(new Set(ids));
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        // Token might be expired, clear the favorites
        setFavoriteIds(new Set());
        console.log('Authentication required for favorites');
      } else {
        console.error('Error loading favorite IDs:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add venue to favorites
  const addToFavorites = async (venueId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('Please sign in to add favorites');
      return false;
    }

    try {
      await apiClient.postJson(`${API_BASE}/${venueId}`, {});
      setFavoriteIds(prev => new Set([...prev, parseInt(venueId)]));
      return true;
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('Please sign in to add favorites');
      } else {
        console.error('Error adding to favorites:', error);
      }
    }
    return false;
  };

  // Remove venue from favorites
  const removeFromFavorites = async (venueId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('Please sign in to manage favorites');
      return false;
    }

    try {
      await apiClient.deleteJson(`${API_BASE}/${venueId}`);
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(parseInt(venueId));
        return newSet;
      });
      return true;
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('Please sign in to manage favorites');
      } else {
        console.error('Error removing from favorites:', error);
      }
    }
    return false;
  };

  // Toggle favorite status
  const toggleFavorite = async (venueId) => {
    const isFavorite = favoriteIds.has(parseInt(venueId));
    
    if (isFavorite) {
      return await removeFromFavorites(venueId);
    } else {
      return await addToFavorites(venueId);
    }
  };

  // Check if venue is favorite
  const isFavorite = (venueId) => {
    return favoriteIds.has(parseInt(venueId));
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
