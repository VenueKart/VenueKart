import { getUserFriendlyError } from './errorMessages.js';

class ApiClient {
  constructor() {
    this.baseURL = '';
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Process failed requests queue after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Get current tokens
  getTokens() {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    };
  }

  // Set tokens in localStorage
  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Refresh access token using refresh token
  async refreshToken() {
    const { refreshToken } = this.getTokens();

    if (!refreshToken) {
      const userFriendlyMessage = getUserFriendlyError('No refresh token available', 'general');
      throw new Error(userFriendlyMessage);
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      // Read response body once as text
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (readError) {
        console.error('Failed to read refresh response body:', readError);
        throw new Error('Failed to refresh authentication token');
      }

      // Parse as JSON
      let data = null;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse refresh response as JSON:', parseError);
          throw new Error('Invalid server response during token refresh');
        }
      }

      if (!response.ok) {
        const originalError = data?.error || 'Token refresh failed';
        const userFriendlyMessage = getUserFriendlyError(originalError, 'general');
        throw new Error(userFriendlyMessage);
      }
      this.setTokens(data.accessToken, refreshToken);
      return data.accessToken;
    } catch (error) {
      this.clearTokens();
      // Redirect to login page
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin?expired=true';
      }
      // Make sure the error message is user-friendly
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      throw new Error(userFriendlyMessage);
    }
  }

  // Main API call method with automatic token refresh
  async call(url, options = {}) {
    const { accessToken } = this.getTokens();
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      // Make initial request
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If request succeeds, return response
      if (response.ok) {
        return response;
      }

      // If 401 (unauthorized) and we have a refresh token, try to refresh
      if (response.status === 401 && this.getTokens().refreshToken) {
        return this.handleTokenRefresh(url, options);
      }

      // For other errors, return the response as-is
      return response;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  // Handle token refresh and retry logic
  async handleTokenRefresh(originalUrl, originalOptions) {
    // If already refreshing, add to queue
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        // Retry original request with new token
        return this.call(originalUrl, originalOptions);
      });
    }

    this.isRefreshing = true;

    try {
      // Attempt to refresh token
      const newAccessToken = await this.refreshToken();
      
      // Process queue with success
      this.processQueue(null, newAccessToken);
      
      // Retry original request with new token
      const { refreshToken } = this.getTokens();
      const headers = {
        'Content-Type': 'application/json',
        ...originalOptions.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return fetch(originalUrl, {
        ...originalOptions,
        headers,
      });
    } catch (refreshError) {
      // Process queue with error
      this.processQueue(refreshError, null);
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Convenience methods for common HTTP verbs
  async get(url, options = {}) {
    return this.call(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.call(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(url, data, options = {}) {
    return this.call(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(url, options = {}) {
    return this.call(url, { ...options, method: 'DELETE' });
  }

  // Helper method for API calls that need JSON response - completely self-contained
  async callJson(url, options = {}) {
    const { accessToken } = this.getTokens();

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      // Make the fetch request directly
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Read response body once as text immediately
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (readError) {
        console.error('Failed to read response body:', readError);
        throw new Error('Failed to communicate with server. Please try again.');
      }

      // Try to parse response as JSON
      let responseData = null;
      if (responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          console.error('Response text:', responseText);

          // If it's an error response and we can't parse it, give a generic error
          if (!response.ok) {
            throw new Error(`Server error (${response.status}). Please try again.`);
          }

          // If it's a success response but not JSON, that's unexpected
          throw new Error('Server returned an invalid response. Please try again.');
        }
      }

      // Handle 401 unauthorized responses with token refresh
      if (response.status === 401 && this.getTokens().refreshToken) {
        try {
          // Try to refresh token
          await this.refreshToken();

          // Retry the original request with new token
          const newAccessToken = this.getTokens().accessToken;
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          };

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          const retryText = await retryResponse.text();
          let retryData = null;

          if (retryText.trim()) {
            try {
              retryData = JSON.parse(retryText);
            } catch {
              if (!retryResponse.ok) {
                throw new Error(`Server error (${retryResponse.status}). Please try again.`);
              }
              throw new Error('Server returned an invalid response. Please try again.');
            }
          }

          if (!retryResponse.ok) {
            const retryError = retryData?.error || retryData?.message || `Server error (${retryResponse.status})`;
            throw new Error(getUserFriendlyError(retryError, 'general'));
          }

          return retryData;

        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.clearTokens();
          if (window.location.pathname !== '/signin') {
            window.location.href = '/signin?expired=true';
          }
          throw new Error('Your session has expired. Please sign in again.');
        }
      }

      // Handle error responses
      if (!response.ok) {
        const originalError = responseData?.error || responseData?.message || `Server error (${response.status})`;
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          originalError
        });
        throw new Error(getUserFriendlyError(originalError, 'general'));
      }

      console.log('Successful API response:', responseData);
      // Return parsed JSON for successful responses
      return responseData;

    } catch (error) {
      console.error('API callJson error details:', {
        message: error.message,
        stack: error.stack,
        url,
        options
      });

      // If it's already a user-friendly error, don't wrap it again
      if (error.message && (
        error.message.includes('Please') ||
        error.message.includes('try again') ||
        error.message.includes('session has expired')
      )) {
        throw error;
      }

      // Convert technical errors to user-friendly messages
      throw new Error(getUserFriendlyError(error.message || 'Network error', 'general'));
    }
  }

  // JSON convenience methods
  async getJson(url, options = {}) {
    return this.callJson(url, {
      ...options,
      method: 'GET'
    });
  }

  async postJson(url, data, options = {}) {
    return this.callJson(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async putJson(url, data, options = {}) {
    return this.callJson(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJson(url, options = {}) {
    return this.callJson(url, {
      ...options,
      method: 'DELETE'
    });
  }
}

// Export singleton instance
export default new ApiClient();
