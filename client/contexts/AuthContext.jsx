import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Handle OAuth callback if present
      if (window.location.search.includes('access_token')) {
        authService.handleOAuthCallback();
      }

      // Get current user
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (email, name, userType, password, mobileNumber) => {
    return await authService.register(email, name, userType, password, mobileNumber);
  };

  const verifyOTP = async (email, otp) => {
    const result = await authService.verifyOTP(email, otp);
    setUser(result.user);
    return result;
  };

  const resendOTP = async (email) => {
    return await authService.resendOTP(email);
  };

  const loginWithGoogle = async (userType = 'customer') => {
    try {
      const result = await authService.initiateGoogleAuth(userType);
      // Get current user data after successful auth
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
      return result;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  };

  const loginWithPassword = async (email, password) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    return result;
  };

  const isVenueOwner = () => {
    return user && user.userType === 'venue-owner';
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (email, otp, newPassword) => {
    return await authService.resetPassword(email, otp, newPassword);
  };

  const value = {
    user,
    login,
    logout,
    register,
    verifyOTP,
    resendOTP,
    loginWithGoogle,
    loginWithPassword,
    forgotPassword,
    resetPassword,
    isVenueOwner,
    isLoading,
    isLoggedIn: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
