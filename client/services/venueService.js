import apiClient from '../lib/apiClient.js';
import { getUserFriendlyError } from '../lib/errorMessages.js';

const API_BASE = '/api/venues';

class VenueService {
  async createVenue(venueData, images) {
    try {
      // First upload images if any
      let uploadedImageUrls = [];
      if (images.length > 0) {
        uploadedImageUrls = await this.uploadImages(images);
      }

      // Prepare venue data for API (matching the expected format)
      const apiData = {
        venueName: venueData.venueName,
        description: venueData.description,
        location: venueData.area, // API expects 'location' field
        footfall: parseInt(venueData.capacity),
        priceMin: parseInt(venueData.price),
        priceMax: parseInt(venueData.price), // Using same price for both min/max for now
        images: uploadedImageUrls,
        facilities: venueData.amenities
      };

      return await apiClient.postJson(API_BASE, apiData);
    } catch (error) {
      console.error('Error creating venue:', error);
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      throw new Error(userFriendlyMessage);
    }
  }

  async uploadImages(images) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const userFriendlyMessage = getUserFriendlyError('Authentication required', 'general');
      throw new Error(userFriendlyMessage);
    }

    const uploadedUrls = [];

    for (const image of images) {
      try {
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('folder', 'venues');

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          const originalError = data.error || 'Failed to upload image';
          const userFriendlyMessage = getUserFriendlyError(originalError, 'general');
          throw new Error(userFriendlyMessage);
        }

        uploadedUrls.push(data.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
        const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
        throw new Error(userFriendlyMessage);
      }
    }

    return uploadedUrls;
  }

  async getVenues(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Pagination parameters
      if (filters.page) {
        queryParams.append('page', filters.page);
      }

      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }

      // Search and filter parameters
      if (filters.location) {
        queryParams.append('location', filters.location);
      }

      if (filters.type) {
        queryParams.append('type', filters.type);
      }

      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      // Legacy support for offset-based pagination
      if (filters.offset && !filters.page) {
        queryParams.append('offset', filters.offset);
      }

      const url = `${API_BASE}?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const userFriendlyMessage = getUserFriendlyError('Failed to fetch venues', 'general');
        throw new Error(userFriendlyMessage);
      }

      const data = await response.json();

      // Handle both old and new API response formats
      if (data.venues && data.pagination) {
        // New paginated response format
        return {
          venues: data.venues,
          pagination: data.pagination
        };
      } else if (Array.isArray(data)) {
        // Old response format (array of venues) - convert to new format for backward compatibility
        return {
          venues: data,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: data.length,
            limit: data.length,
            hasNextPage: false,
            hasPrevPage: false
          }
        };
      } else {
        // Unexpected format
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      throw new Error(userFriendlyMessage);
    }
  }

  async getVenueById(id) {
    try {
      const response = await fetch(`${API_BASE}/${id}`);

      if (!response.ok) {
        const userFriendlyMessage = getUserFriendlyError('Failed to fetch venue', 'general');
        throw new Error(userFriendlyMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching venue:', error);
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      throw new Error(userFriendlyMessage);
    }
  }

  async getMyVenues() {
    try {
      return await apiClient.getJson(`${API_BASE}/owner/my-venues`);
    } catch (error) {
      console.error('Error fetching my venues:', error);
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      throw new Error(userFriendlyMessage);
    }
  }

  async updateVenue(id, venueData, images) {
    try {
      // Upload new images if any
      let uploadedImageUrls = [];
      if (images.length > 0) {
        uploadedImageUrls = await this.uploadImages(images);
      }

      // Prepare venue data for API
      const apiData = {
        venueName: venueData.venueName,
        description: venueData.description,
        location: venueData.area,
        footfall: parseInt(venueData.capacity),
        priceMin: parseInt(venueData.price),
        priceMax: parseInt(venueData.price),
        images: uploadedImageUrls,
        facilities: venueData.amenities
      };

      return await apiClient.putJson(`${API_BASE}/${id}`, apiData);
    } catch (error) {
      console.error('Error updating venue:', error);
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      throw new Error(userFriendlyMessage);
    }
  }

  async deleteVenue(id) {
    try {
      await apiClient.deleteJson(`${API_BASE}/${id}`);
      return { message: 'Venue deleted successfully' };
    } catch (error) {
      console.error('Error deleting venue:', error);
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      throw new Error(userFriendlyMessage);
    }
  }

  async getFilterOptions() {
    try {
      const response = await fetch(`${API_BASE}/filter-options`);

      if (!response.ok) {
        const userFriendlyMessage = getUserFriendlyError('Failed to fetch filter options', 'general');
        throw new Error(userFriendlyMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching filter options:', error);
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      throw new Error(userFriendlyMessage);
    }
  }
}

export default new VenueService();
