import { getUserFriendlyError } from './errorMessages.js';

function dispatchAppError(title, message) {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-error', { detail: { title, message } }));
    }
  } catch (_) {
    // no-op
  }
}

class ApiClient {
  constructor() {
    const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : null;
    const rawBase = env && env.VITE_BACKEND_URL ? env.VITE_BACKEND_URL : '';
    // In development, always use same-origin so Vite proxy handles /api.
    // Only honor VITE_BACKEND_URL in production builds.
    const useBase = !!rawBase && !!(env && env.PROD);
    this.baseURL = useBase ? rawBase.replace(/\/+$/, '') : '';
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  resolveUrl(url) {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    const base = this.baseURL || '';
    // If a backend base URL is configured, route /api calls through it for cross-domain production deployments;
    // otherwise, keep same-origin so Vite dev proxy works.
    if (url.startsWith('/api')) {
      return base ? `${base}${url}` : url;
    }
    if (!base) return url;
    if (url.startsWith('/')) return `${base}${url}`;
    return `${base}/${url}`;
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
    try {
      return {
        accessToken: window.localStorage ? localStorage.getItem('accessToken') : null,
        refreshToken: window.localStorage ? localStorage.getItem('refreshToken') : null
      };
    } catch (_err) {
      return { accessToken: null, refreshToken: null };
    }
  }

  // Set tokens in localStorage
  setTokens(accessToken, refreshToken) {
    try {
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (_err) {
      // Ignore storage errors
    }
  }

  // Clear all tokens
  clearTokens() {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (_err) {
      // Ignore storage errors
    }
  }

  // Refresh access token using refresh token
  async refreshToken() {
    const { refreshToken } = this.getTokens();

    if (!refreshToken) {
      const userFriendlyMessage = getUserFriendlyError('No refresh token available', 'general');
      throw new Error(userFriendlyMessage);
    }

    try {
      const response = await fetch(this.resolveUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      // Read response body once as text (tolerate stream errors)
      let responseText = '';
      try {
        const cloned = response.clone();
        responseText = await cloned.text();
      } catch (_e1) {
        try {
          responseText = await response.text();
        } catch (readError) {
          console.warn('Failed to read refresh response body, continuing without body:', readError);
          responseText = '';
        }
      }

      // Parse as JSON
      let data = null;
      if (responseText && responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (_parseError) {
          // Fall through; we'll use status codes below
          data = null;
        }
      }

      if (!response.ok) {
        const originalError = data?.error || 'Token refresh failed';
        const userFriendlyMessage = getUserFriendlyError(originalError, 'general');
        dispatchAppError('Authentication', userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }
      this.setTokens(data.accessToken, refreshToken);
      return data.accessToken;
    } catch (error) {
      this.clearTokens();
      // Redirect to login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
        window.location.href = '/signin?expired=true';
      }
      // Make sure the error message is user-friendly
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'general');
      dispatchAppError('Authentication', userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  }

  // Main API call method with automatic token refresh
  async call(url, options = {}) {
    const { accessToken } = this.getTokens();
    
    // Prepare headers
    const isFormData = options && options.body instanceof FormData;
    const headers = {
      ...(options.headers || {}),
    };

    if (!isFormData && !('Content-Type' in headers)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if token exists
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      // Make initial request
      const response = await fetch(this.resolveUrl(url), {
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

      return fetch(this.resolveUrl(originalUrl), {
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

    // Determine method and body type
    const method = (options.method || 'GET').toUpperCase();
    const isFormData = options && options.body instanceof FormData;

    // Prepare headers without forcing Content-Type on GET/HEAD
    const headers = {
      ...(options.headers || {}),
    };
    if (method !== 'GET' && method !== 'HEAD' && !isFormData && !('Content-Type' in headers)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if token exists
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      // Make the fetch request directly
      const response = await fetch(this.resolveUrl(url), {
        ...options,
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      });

      // Read response body once as text immediately (be tolerant to stream state)
      let responseText = '';
      try {
        // Prefer reading from a clone to avoid interfering with consumers
        const cloned = response.clone();
        responseText = await cloned.text();
      } catch (cloneReadError) {
        try {
          responseText = await response.text();
        } catch (readError) {
          console.warn('Failed to read response body, continuing without body:', readError);
          responseText = '';
        }
      }

      // Try to parse response as JSON when we have a body
      let responseData = null;
      if (responseText && responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.warn('Failed to parse response as JSON. Falling back to status-based handling.');
        }
      }

      // Handle 401 unauthorized responses with token refresh
      if (response.status === 401 && this.getTokens().refreshToken) {
        try {
          // Try to refresh token
          await this.refreshToken();

          // Retry the original request with new token
          const newAccessToken = this.getTokens().accessToken;
          const retryMethod = (options.method || 'GET').toUpperCase();
          const retryIsFormData = options && options.body instanceof FormData;
          const retryHeaders = {
            ...(options.headers || {}),
          };
          if (retryMethod !== 'GET' && retryMethod !== 'HEAD' && !retryIsFormData && !('Content-Type' in retryHeaders)) {
            retryHeaders['Content-Type'] = 'application/json';
          }
          if (newAccessToken) {
            retryHeaders.Authorization = `Bearer ${newAccessToken}`;
          }

          const retryResponse = await fetch(this.resolveUrl(url), {
            ...options,
            headers: retryHeaders,
          });

          // Read retry response safely
          let retryText = '';
          try {
            const retryClone = retryResponse.clone();
            retryText = await retryClone.text();
          } catch (_e1) {
            try {
              retryText = await retryResponse.text();
            } catch (_e2) {
              retryText = '';
            }
          }
          let retryData = null;

          if (retryText && retryText.trim()) {
            try {
              retryData = JSON.parse(retryText);
            } catch {
              retryData = null;
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
        // Try to salvage a useful message even if JSON parsing failed
        let originalError = responseData?.error || responseData?.message || '';
        if (!originalError && responseText) {
          const trimmed = responseText.trim();
          const looksHtml = trimmed.startsWith('<') && trimmed.endsWith('>');
          if (!looksHtml) {
            originalError = trimmed.slice(0, 300);
          }
        }
        // Provide better defaults: 4xx => validation/user input; 5xx => server error
        if (!originalError) {
          if (response.status >= 400 && response.status < 500) {
            originalError = 'validation error';
          } else {
            originalError = `Server error (${response.status})`;
          }
        }
        console.error('Server error response:', JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          bodyPreview: (responseText || '').slice(0, 300),
          originalError
        }));
        const friendly = getUserFriendlyError(originalError, 'general');
        dispatchAppError('Request Failed', friendly);
        throw new Error(friendly);
      }

      console.log('Successful API response:', responseData);
      // Return parsed JSON for successful responses
      return responseData;

    } catch (error) {
      console.error('API callJson error details: ' + JSON.stringify({
        message: error.message,
        stack: error.stack,
        url,
        options
      }, null, 2));

      // If it's already a user-friendly error, don't wrap it again
      if (error.message && (
        error.message.includes('Please') ||
        error.message.includes('try again') ||
        error.message.includes('session has expired')
      )) {
        dispatchAppError('Request Failed', error.message);
        throw error;
      }

      // Convert technical errors to user-friendly messages
      const friendly = getUserFriendlyError(error.message || 'Network error', 'general');
      dispatchAppError('Network', friendly);
      throw new Error(friendly);
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
