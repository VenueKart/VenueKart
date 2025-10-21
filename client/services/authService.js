import { getUserFriendlyError } from '../lib/errorMessages.js';
import apiClient from '../lib/apiClient.js';

const API_BASE = '/api/auth';

class AuthService {
  constructor() {
    // Safely access localStorage (iframes or privacy settings can block it)
    try {
      this.accessToken = window.localStorage ? localStorage.getItem('accessToken') : null;
      this.refreshToken = window.localStorage ? localStorage.getItem('refreshToken') : null;
    } catch (_err) {
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  async login(email, password) {
    try {
      const data = await apiClient.postJson(`${API_BASE}/login`, { email, password });

      // Store tokens
      this.setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      // Convert to user-friendly signin-specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'signin');
      throw new Error(userFriendlyMessage);
    }
  }

  async register(email, name, userType = 'customer', password = null, mobileNumber = null) {
    try {
      const data = await apiClient.postJson(`${API_BASE}/register`, {
        email,
        name,
        userType,
        password,
        mobileNumber
      });

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      // Convert to user-friendly signup-specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'signup');
      throw new Error(userFriendlyMessage);
    }
  }

  async verifyOTP(email, otp) {
    try {
      const data = await apiClient.postJson(`${API_BASE}/verify-otp`, { email, otp });

      // Store tokens
      this.setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      // Convert to user-friendly OTP-specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'otp');
      throw new Error(userFriendlyMessage);
    }
  }

  async resendOTP(email) {
    try {
      const data = await apiClient.postJson(`${API_BASE}/resend-otp`, { email });
      return data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      // Convert to user-friendly OTP-specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'otp');
      throw new Error(userFriendlyMessage);
    }
  }

  async getCurrentUser() {
    // Re-read latest token to avoid stale constructor value
    let token = null;
    try {
      token = window.localStorage ? localStorage.getItem('accessToken') : this.accessToken;
    } catch (_err) {
      token = this.accessToken;
    }
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }

    try {
      return await apiClient.getJson(`${API_BASE}/me`);
    } catch (error) {
      // On network errors, clear tokens silently to stop repeated failing calls
      if (String(error.message).toLowerCase().includes('failed to fetch') || String(error.message).toLowerCase().includes('network')) {
        this.clearTokens();
        return null;
      }
      // For other errors (e.g., 401), also clear tokens
      this.clearTokens();
      return null;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const data = await apiClient.postJson(`${API_BASE}/refresh`, { refreshToken: this.refreshToken });
      this.setTokens(data.accessToken, this.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return false;
    }
  }

  async logout() {
    try {
      if (this.accessToken) {
        await apiClient.postJson(`${API_BASE}/logout`, {
          refreshToken: this.refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    try {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (_err) {
      // Ignore storage errors in restricted environments
    }
    // Update apiClient tokens as well
    apiClient.setTokens(accessToken, refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user'); // Clear old user data
    } catch (_err) {
      // Ignore storage errors
    }
    // Clear apiClient tokens as well
    apiClient.clearTokens();
  }

  initiateGoogleAuth(userType = 'customer') {
    return new Promise((resolve, reject) => {
      // Open Google auth in popup to avoid iframe restrictions
      const width = 500;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      // Include userType as a query parameter (always same-origin)
      // Include the opener origin so the server can postMessage back to the correct origin
      const authUrl = `${API_BASE}/google?userType=${encodeURIComponent(userType)}&origin=${encodeURIComponent(window.location.origin)}`;

      const popup = window.open(
        authUrl,
        'googleAuth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups and try again.'));
        return;
      }

      let isResolved = false;

      // Listen for messages from popup
      const messageListener = (event) => {
        console.log('[authService] message received from', event.origin, event.data);
        // Allow messages from current origin or known backend origins (localhost:5001, fly.dev, etc.)
        try {
          const origin = event.origin || '';
          const isSameOrigin = origin === window.location.origin || origin === `${window.location.protocol}//${window.location.host}`;
          const isLocalBackend = origin.includes(':5001');
          const isFly = origin.endsWith('.fly.dev');
          const backendEnv = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ? (import.meta.env.VITE_BACKEND_URL || '') : '';
          const matchesEnv = backendEnv && origin === backendEnv.replace(/\/+$/, '');
          if (!(isSameOrigin || isLocalBackend || isFly || matchesEnv)) {
            console.log('[authService] Ignored message from:', origin);
            return;
          }
        } catch (e) {
          console.warn('[authService] Error validating message origin:', e);
          return;
        }

        if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          console.log('[authService] GOOGLE_AUTH_SUCCESS received');
          isResolved = true;
          clearInterval(checkClosed);
          this.setTokens(event.data.accessToken, event.data.refreshToken);
          window.removeEventListener('message', messageListener);
          resolve(event.data);
        } else if (event.data && event.data.type === 'GOOGLE_AUTH_ERROR') {
          console.log('[authService] GOOGLE_AUTH_ERROR received', event.data);
          isResolved = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error(event.data.error || 'Google authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);

      // Listen for popup to close (fallback) - give some time for message processing
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          console.log('[authService] popup closed detected');
          // Give a small delay to allow message processing
          setTimeout(() => {
            if (!isResolved) {
              console.log('[authService] popup closed without resolution - rejecting');
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              reject(new Error('Authentication cancelled'));
            }
          }, 500);
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!isResolved) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Authentication timeout'));
        }
      }, 300000);
    });
  }

  async forgotPassword(email) {
    try {
      const data = await apiClient.postJson(`${API_BASE}/forgot-password`, { email });
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      // Convert to user-friendly password-reset specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'password-reset');
      throw new Error(userFriendlyMessage);
    }
  }

  async resetPassword(email, otp, newPassword) {
    try {
      const data = await apiClient.postJson(`${API_BASE}/reset-password`, {
        email,
        otp,
        newPassword
      });
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      // Convert to user-friendly password-reset specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'password-reset');
      throw new Error(userFriendlyMessage);
    }
  }

  // Handle OAuth callback tokens from URL
  handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const error = urlParams.get('error');

    if (error) {
      throw new Error('Authentication failed');
    }

    if (accessToken && refreshToken) {
      this.setTokens(accessToken, refreshToken);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }

    return false;
  }
}

export default new AuthService();
