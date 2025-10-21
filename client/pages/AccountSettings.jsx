import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserFriendlyError } from '../lib/errorMessages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import apiClient from '../lib/apiClient.js';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Camera,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

export default function AccountSettings() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    location: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.mobileNumber || '',
        businessName: user.business_name || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profileData.phone && !/^[0-9]{10}$/.test(profileData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    try {
      setLoading(true);
      
      await apiClient.putJson('/api/auth/update-profile', {
        ...profileData,
        mobileNumber: profileData.phone
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      if (updateProfile) {
        updateProfile(profileData);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      
      await apiClient.putJson('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'password-reset');
      setErrors({ password: userFriendlyMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={transition}
        >
          <Button asChild variant="ghost" className="text-venue-indigo hover:text-venue-purple mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-venue-dark">Account Settings</h1>
              <p className="text-gray-600 mt-2">Manage your profile and account preferences</p>
            </div>
            <Badge className={`${user?.user_type === 'venue-owner' ? 'bg-venue-indigo' : 'bg-gray-500'} text-white`}>
              {user?.user_type === 'venue-owner' ? 'Venue Owner' : 'Customer'}
            </Badge>
          </div>
        </motion.div>

        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={transition}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Your settings have been saved successfully!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* General Error */}
        {errors.general && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={transition}
          >
            <p className="text-sm text-red-800">{errors.general}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            className="lg:col-span-2"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={transition}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleProfileInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleProfileInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                          className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    {/* Business Name (for venue owners) */}
                    {user?.user_type === 'venue-owner' && (
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={profileData.businessName}
                          onChange={(e) => handleProfileInputChange('businessName', e.target.value)}
                          placeholder="Enter your business name"
                        />
                      </div>
                    )}

                    {/* Location */}
                    <div className={`space-y-2 ${user?.user_type === 'venue-owner' ? '' : 'md:col-span-2'}`}>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleProfileInputChange('location', e.target.value)}
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-venue-indigo hover:bg-venue-purple"
                    >
                      {loading ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Password Error */}
                {errors.password && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800">{errors.password}</p>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        placeholder="Enter your current password"
                        className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password *</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                          placeholder="Enter new password"
                          className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-sm text-red-600">{errors.newPassword}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm new password"
                          className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      variant="outline"
                      className="border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white"
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Summary */}
          <motion.div
            className="space-y-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...transition, delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-venue-indigo rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-venue-dark">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account Type</span>
                    <Badge className={user?.user_type === 'venue-owner' ? 'bg-venue-indigo' : 'bg-gray-500'}>
                      {user?.user_type === 'venue-owner' ? 'Venue Owner' : 'Customer'}
                    </Badge>
                  </div>
                  
                  {user?.is_verified && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Verification</span>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                  )}

                  {user?.mobileNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{user.mobileNumber}</span>
                    </div>
                  )}

                  {user?.location && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{user.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.user_type === 'venue-owner' && (
                  <Button asChild className="w-full bg-venue-indigo hover:bg-venue-purple">
                    <Link to="/admin">
                      Go to Admin Dashboard
                    </Link>
                  </Button>
                )}
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/venues">
                    Browse Venues
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link to="/contact">
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
