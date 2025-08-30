import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import apiClient from '../lib/apiClient';
import { formatPrice } from '@/lib/priceUtils';
import RazorpayPayment from '../components/RazorpayPayment';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Clock,
  Eye,
  Bell,
  Save,
  Loader2
} from 'lucide-react';

export default function UserDashboard() {
  const { user, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.mobileNumber || user.mobile_number || user.phone || ''
      });
    }
  }, [user]);

  // Load user bookings and notifications
  useEffect(() => {
    if (isLoggedIn) {
      loadUserData();
    }
  }, [isLoggedIn]);

  // Auto-refresh user data every 60 seconds
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(async () => {
        try {
          const previousNotificationCount = notificationCount;
          await loadUserData();

          // Show notification if new updates arrived
          if (notificationCount > previousNotificationCount) {
            toast({
              title: "New Updates!",
              description: `You have ${notificationCount - previousNotificationCount} new notification${notificationCount - previousNotificationCount > 1 ? 's' : ''}.`,
              duration: 5000,
            });
          }
        } catch (error) {
          console.error('Error auto-refreshing user data:', error);
        }
      }, 60000); // 60 seconds

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, notificationCount]);

  const apiCall = async (url, options = {}) => {
    try {
      return await apiClient.callJson(url, options);
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      throw error;
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [bookingsData, notificationsData, notificationCountData] = await Promise.all([
        apiCall('/api/bookings/customer'),
        apiCall('/api/bookings/customer/notifications'),
        apiCall('/api/bookings/customer/notification-count')
      ]);
      
      setBookings(bookingsData || []);
      setNotifications(notificationsData || []);
      setNotificationCount(notificationCountData.unreadCount || 0);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load your dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setProfileLoading(true);
      await apiCall('/api/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          mobileNumber: profileData.phone
        })
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error", 
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Accepted';
      case 'cancelled': return 'Declined';
      default: return status;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to view your dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-venue-dark mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">Manage your bookings and profile from your dashboard.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inquired Venues Section - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-venue-purple" />
                  Your Booking History
                </CardTitle>
                <CardDescription>
                  Track all your venue inquiries and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-venue-purple" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You haven't made any venue inquiries yet.</p>
                    <Button variant="outline" onClick={() => window.location.href = '/venues'}>
                      Browse Venues
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                          booking.status === 'confirmed' ? 'border-l-4 border-l-green-500 bg-green-50/30' :
                          booking.status === 'cancelled' ? 'border-l-4 border-l-red-500 bg-red-50/30' :
                          'border-l-4 border-l-yellow-500 bg-yellow-50/30'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start md:items-center gap-3 mb-2">
                              <h3 className="font-semibold text-venue-dark">
                                {booking.venue_name || 'Venue'}
                              </h3>
                              <Badge variant={getStatusBadgeVariant(booking.status)}>
                                {getStatusText(booking.status)}
                              </Badge>
                              {booking.status !== 'pending' && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  Updated {new Date(booking.updated_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Event: {new Date(booking.event_date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {booking.guest_count} guests
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Inquired: {new Date(booking.created_at || booking.booking_date).toLocaleDateString()}
                              </div>
                            </div>

                            {/* Status-specific messages */}
                            {booking.status === 'confirmed' && (
                              <div className="mt-2 space-y-2">
                                <div className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-md">
                                  ✅ Your booking has been confirmed! {booking.payment_status === 'completed' ? 'Payment completed successfully.' : 'Please complete your payment to secure your booking.'}
                                </div>
                                <RazorpayPayment
                                  booking={booking}
                                  onPaymentSuccess={(paymentId) => {
                                    toast({
                                      title: "Payment Successful!",
                                      description: `Payment completed. ID: ${paymentId}`,
                                      variant: "default",
                                    });
                                    // Refresh booking data to show updated payment status
                                    loadUserData();
                                  }}
                                  onPaymentFailure={(error) => {
                                    toast({
                                      title: "Payment Failed",
                                      description: error || "Please try again or contact support.",
                                      variant: "destructive",
                                    });
                                  }}
                                />
                              </div>
                            )}
                            {booking.status === 'cancelled' && (
                              <div className="mt-2 text-sm text-red-700 bg-red-100 px-3 py-1 rounded-md">
                                ❌ This booking was declined. You may contact the venue directly or look for alternatives.
                              </div>
                            )}
                            {booking.status === 'pending' && (
                              <div className="mt-2 text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-md">
                                ⏳ Your inquiry is pending review. The venue owner will respond within 24 hours.
                              </div>
                            )}
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Booking Details</DialogTitle>
                                <DialogDescription>
                                  Complete information about your venue inquiry
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">Venue</Label>
                                    <p className="text-sm text-gray-600">{selectedBooking.venue_name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Event Type</Label>
                                    <p className="text-sm text-gray-600">{selectedBooking.event_type}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Event Date</Label>
                                    <p className="text-sm text-gray-600">
                                      {new Date(selectedBooking.event_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Guest Count</Label>
                                    <p className="text-sm text-gray-600">{selectedBooking.guest_count}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Amount to Pay</Label>
                                    <p className="text-sm text-gray-600">{formatPrice(selectedBooking.payment_amount || selectedBooking.amount)}</p>
                                    {selectedBooking.payment_amount && selectedBooking.amount !== selectedBooking.payment_amount && (
                                      <p className="text-xs text-gray-500 mt-1">Display price: {formatPrice(selectedBooking.amount)}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div className="mt-1">
                                      <Badge variant={getStatusBadgeVariant(selectedBooking.status)}>
                                        {getStatusText(selectedBooking.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                  {selectedBooking.special_requirements && (
                                    <div>
                                      <Label className="text-sm font-medium">Special Requirements</Label>
                                      <p className="text-sm text-gray-600">{selectedBooking.special_requirements}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Profile Panel - Right Column */}
          <div className="space-y-6">
            {/* Notifications Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-venue-purple" />
                    Notifications
                  </div>
                  <div className="flex items-center gap-2">
                    {notificationCount > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-lg">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadUserData}
                      className="text-venue-purple hover:text-venue-indigo"
                    >
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Your recent booking updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notificationCount === 0 ? (
                  <div className="text-center py-6">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification, index) => (
                      <div key={index} className="border-l-4 border-venue-purple pl-3 py-2 bg-gray-50 rounded-r">
                        <p className="text-sm font-medium">
                          Booking {notification.status === 'confirmed' ? 'Accepted' : 'Declined'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        And {notifications.length - 5} more notifications...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-venue-purple" />
                  Your Profile
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>

                <Button 
                  onClick={updateProfile} 
                  disabled={profileLoading}
                  className="w-full"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
