import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NotificationContainer, useNotifications } from '@/components/ui/notification';
import { useAuth } from '../contexts/AuthContext';
import AddVenueForm from '@/components/AddVenueForm';
import EditVenueForm from '@/components/EditVenueForm';
import notificationService from '../services/notificationService';
import venueService from '../services/venueService';
import apiClient from '../lib/apiClient';
import { getUserFriendlyError } from '../lib/errorMessages';
import { formatPrice } from '@/lib/priceUtils';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  Building,
  Home,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Users,
  MapPin,
  DollarSign,
  Trash2,
  Bell,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

// API service functions using the new apiClient
const apiCall = async (url, options = {}) => {
  try {
    return await apiClient.callJson(url, options);
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();
  const [showAddVenueForm, setShowAddVenueForm] = useState(false);
  const [showEditVenueForm, setShowEditVenueForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalVenues: 0,
    activeVenues: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
  });
  const openConfirm = (config) => setConfirmDialog({
    open: true,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    ...config,
  });
  const navigate = useNavigate();
  const { user, logout, isVenueOwner } = useAuth();

  useEffect(() => {
    // Check if user is authenticated as venue owner or admin
    if (!user || (!isVenueOwner() && user?.userType !== 'admin')) {
      navigate('/signin');
    } else {
      loadDashboardData();
    }
  }, [user, isVenueOwner, navigate]);

  // Real-time updates with dynamic polling
  useEffect(() => {
    if (user && (isVenueOwner() || user?.userType === 'admin')) {
      let interval;

      const setupPolling = () => {
        // Poll more frequently when on overview or bookings section
        const pollInterval = (activeSection === 'overview' || activeSection === 'bookings') ? 15000 : 45000;

        interval = setInterval(async () => {
          try {
            const previousCount = inquiryCount;
            await loadInquiryCount();

            // If we're on the relevant sections, reload data
            if (activeSection === 'overview' || activeSection === 'bookings') {
              await loadBookings();
              await loadDashboardStats();
            }

            // Only reload inquiries if notifications panel is open
            if (showNotifications) {
              await loadInquiries();
            }

            // Show notification if new inquiries arrived
            const currentCount = inquiryCount;
            if (currentCount > previousCount) {
              showSuccess(`🔔 ${currentCount - previousCount} new inquiry${currentCount - previousCount > 1 ? 'ies' : ''} received!`);
            }
          } catch (error) {
            console.error('Error auto-refreshing data:', error);
          }
        }, pollInterval);
      };

      setupPolling();

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [user, isVenueOwner, activeSection, showNotifications, inquiryCount]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadVenues(),
        loadBookings(),
        loadDashboardStats(),
        loadInquiryCount()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInquiryCount = async () => {
    try {
      const data = await apiCall('/api/bookings/owner/inquiry-count');
      setInquiryCount(data.inquiryCount || 0);
    } catch (error) {
      console.error('Error loading inquiry count:', error);
    }
  };

  const loadInquiries = async () => {
    try {
      const data = await apiCall('/api/bookings/owner/inquiries');
      const normalized = Array.isArray(data) ? data.map(i => ({ ...i, id: i.id || i._id })) : [];
      setInquiries(normalized);
    } catch (error) {
      console.error('Error loading inquiries:', error);
    }
  };

  const loadVenues = async () => {
    try {
      const data = await apiCall('/api/venues/owner/my-venues');
      const normalized = Array.isArray(data) ? data.map(v => ({ ...v, id: v.id || v._id })) : [];
      setVenues(normalized);
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await apiCall('/api/bookings/owner?limit=10');
      const normalized = Array.isArray(data) ? data.map(b => ({ ...b, id: b.id || b._id })) : [];
      setBookings(normalized);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const data = await apiCall('/api/venues/owner/dashboard-stats');
      setDashboardStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'venues', label: 'Venues', icon: Building },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleEmailVerification = async () => {
    if (!emailOtp.trim()) {
      showError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      const response = await apiCall('/api/auth/verify-email-update', {
        method: 'POST',
        body: JSON.stringify({
          email: pendingEmailUpdate,
          otp: emailOtp
        })
      });

      // Update successful
      setShowEmailVerification(false);
      setIsEditingAccount(false);
      setPendingEmailUpdate('');
      setEmailOtp('');
      setAccountData(prev => ({ ...prev, password: '' }));
      showSuccess('Email verified and profile updated successfully!');

      // You might want to update user context here with response.user
    } catch (error) {
      console.error('Error verifying email:', error);
      showError(error.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-venue-dark">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your venues.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Venues</p>
                <p className="text-3xl font-bold text-venue-dark">{loading ? '...' : dashboardStats.totalVenues}</p>
              </div>
              <Building className="h-8 w-8 text-venue-indigo" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-venue-dark">{loading ? '...' : dashboardStats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-venue-indigo" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-venue-dark">
                  {loading ? '...' : formatPrice(dashboardStats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-venue-indigo" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Venues</p>
                <p className="text-3xl font-bold text-venue-dark">{loading ? '...' : dashboardStats.activeVenues}</p>
              </div>
              <Users className="h-8 w-8 text-venue-indigo" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Inquiries - Priority Section */}
      {bookings.filter(b => b.status === 'pending').length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Bell className="h-5 w-5" />
              Pending Inquiries
              <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            </CardTitle>
            <CardDescription>Customer inquiries awaiting your response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.filter(b => b.status === 'pending').slice(0, 3).map((inquiry) => (
                <div key={inquiry.id || inquiry._id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 bg-white border border-yellow-200 rounded-lg hover:border-yellow-300 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-gradient-to-r from-venue-indigo to-venue-purple rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {inquiry.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="font-semibold text-venue-dark">{inquiry.customer_name}</h4>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">NEW</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-10">{inquiry.venue_name} • {new Date(inquiry.event_date).toLocaleDateString()} • {inquiry.guest_count} guests</p>
                  </div>
                  <div className="md:text-right">
                    <p className="font-semibold text-venue-dark mb-2">{formatPrice(inquiry.amount)}</p>
                    <div className="grid grid-cols-2 gap-2 md:flex md:grid-cols-none">
                      <Button
                        size="sm"
                        className="bg-venue-purple hover:bg-venue-indigo text-white w-full md:w-auto justify-center"
                        onClick={() => handleBookingAction(inquiry.id, 'confirmed')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBookingAction(inquiry.id, 'cancelled')}
                        className="w-full md:w-auto justify-center"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {bookings.filter(b => b.status === 'pending').length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection('bookings')}
                    className="border-venue-purple text-venue-purple hover:bg-venue-lavender"
                  >
                    View All {bookings.filter(b => b.status === 'pending').length} Inquiries
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest confirmed and cancelled bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading bookings...</div>
            ) : bookings.filter(b => b.status !== 'pending').length === 0 ? (
              <div className="text-center py-4 text-gray-500">No confirmed or cancelled bookings yet</div>
            ) : (
              bookings.filter(b => b.status !== 'pending').slice(0, 3).map((booking) => (
                <div key={booking.id || booking._id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold text-venue-dark">{booking.customer_name}</h4>
                    <p className="text-sm text-gray-600">{booking.venue_name} • {new Date(booking.event_date).toLocaleDateString()}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-semibold text-venue-dark">{formatPrice(booking.amount)}</p>
                    <p className={`text-sm ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVenues = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-venue-dark">Venue Management</h1>
          <p className="text-gray-600">Manage your venue listings and details</p>
        </div>
        <Button
          className="bg-venue-indigo hover:bg-venue-purple text-white w-full sm:w-auto"
          onClick={() => setShowAddVenueForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Venue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No venues yet. Add your first venue to get started!</p>
          </div>
        ) : (
          venues.map((venue) => (
            <Card key={venue.id || venue._id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={venue.images && venue.images.length > 0 ? venue.images[0] : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop"}
                    alt={venue.name}
                    className="w-full h-40 sm:w-24 sm:h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-venue-dark mb-2">{venue.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {venue.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {venue.capacity} guests
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {venue.price_per_day ? formatPrice(parseFloat(venue.price_per_day)) : 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {venue.booking_count || 0} bookings
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${venue.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {venue.status ? venue.status.charAt(0).toUpperCase() + venue.status.slice(1) : 'Active'}
                      </span>
                      <div className="grid grid-cols-2 sm:flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(venue)}
                          className="border-venue-indigo text-black hover:bg-venue-lavender hover:text-black active:text-black focus:text-black w-full sm:w-auto justify-center"
                        >
                          Edit
                        </Button>
                        <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteVenue(venue.id || venue._id, venue.name)}
                          className="text-red-600 hover:text-white hover:bg-red-600 border-red-300 w-full sm:w-auto justify-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-venue-dark">Booking Overview</h1>
          <p className="text-gray-600">Track and manage venue bookings</p>
        </div>
        <Button
          onClick={async () => {
            setLoading(true);
            try {
              await Promise.all([
                loadBookings(),
                loadInquiryCount(),
                loadDashboardStats()
              ]);
              showSuccess('📊 Data refreshed successfully!');
            } catch (error) {
              showError('Failed to refresh data');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          variant="outline"
          className="border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Data'
          )}
        </Button>
      </div>

      {/* Booking Status Filter */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4">
        <Button
          variant={!statusFilter || statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
          className={`${!statusFilter || statusFilter === 'all' ? 'bg-venue-indigo hover:bg-venue-purple text-white' : 'border-venue-indigo text-venue-indigo hover:bg-venue-lavender'} w-full sm:w-auto`}
        >
          All Bookings ({bookings.length})
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('pending')}
          className={`${statusFilter === 'pending' ? 'bg-venue-purple hover:bg-venue-indigo text-white' : 'border-venue-purple text-venue-purple hover:bg-venue-lavender'} w-full sm:w-auto`}
        >
          Pending ({bookings.filter(b => b.status === 'pending').length})
        </Button>
        <Button
          variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('confirmed')}
          className={`${statusFilter === 'confirmed' ? 'bg-venue-indigo hover:bg-venue-purple text-white' : 'border-venue-indigo text-venue-indigo hover:bg-venue-lavender'} w-full sm:w-auto`}
        >
          Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
        </Button>
        <Button
          variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('cancelled')}
          className={`${statusFilter === 'cancelled' ? 'bg-venue-dark hover:bg-gray-700 text-white' : 'border-venue-dark text-venue-dark hover:bg-gray-100'} w-full sm:w-auto`}
        >
          Declined ({bookings.filter(b => b.status === 'cancelled').length})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking History & Management</CardTitle>
          <CardDescription>Complete timeline of all venue bookings with customer details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Venue</th>
                  <th className="text-left p-4">Event Date</th>
                  <th className="text-left p-4">Guests</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">Loading bookings...</td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No bookings found</td>
                  </tr>
                ) : (
                  bookings
                    .filter(booking => !statusFilter || statusFilter === 'all' || booking.status === statusFilter)
                    .map((booking) => (
                    <tr key={booking.id || booking._id} className="border-b">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{booking.customer_name}</p>
                        </div>
                      </td>
                      <td className="p-4">{booking.venue_name}</td>
                      <td className="p-4">{new Date(booking.event_date).toLocaleDateString()}</td>
                      <td className="p-4">{booking.guest_count}</td>
                      <td className="p-4">{formatPrice(booking.amount)}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          {booking.status !== 'pending' && (
                            <span className="text-xs text-gray-500">
                              Updated {new Date(booking.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3 mt-4">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading bookings...</div>
            ) : bookings.filter(booking => !statusFilter || statusFilter === 'all' || booking.status === statusFilter).length === 0 ? (
              <div className="p-4 text-center text-gray-500">No bookings found</div>
            ) : (
              bookings
                .filter(booking => !statusFilter || statusFilter === 'all' || booking.status === statusFilter)
                .map((booking) => (
                  <div key={booking.id || booking._id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-venue-dark">{booking.customer_name}</p>
                        <p className="text-sm text-gray-600">{booking.venue_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>📅 {new Date(booking.event_date).toLocaleDateString()}</div>
                      <div>👥 {booking.guest_count} guests</div>
                      <div className="col-span-2 font-medium text-venue-dark">{formatPrice(booking.amount)}</div>
                    </div>
                    {booking.status !== 'pending' && (
                      <p className="mt-2 text-xs text-gray-500">Updated {new Date(booking.updated_at).toLocaleDateString()}</p>
                    )}
                  </div>
                ))
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );


  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: ''
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

  useEffect(() => {
    if (user) {
      setAccountData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || user.mobile_number || '',
        password: ''
      });
    }
  }, [user]);

  const handleAccountChange = (field, value) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (accountErrors[field]) {
      setAccountErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateAccountData = () => {
    const newErrors = {};

    if (!accountData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!accountData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (accountData.mobileNumber && !/^[0-9]{10}$/.test(accountData.mobileNumber.replace(/\s+/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (accountData.password && accountData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setAccountErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAccount = async () => {
    if (!validateAccountData()) {
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        name: accountData.name,
        email: accountData.email,
        mobileNumber: accountData.mobileNumber
      };

      // Only include password if it's provided
      if (accountData.password) {
        updateData.password = accountData.password;
      }

      const response = await apiCall('/api/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.requiresVerification) {
        // Email verification required
        setPendingEmailUpdate(response.newEmail);
        setShowEmailVerification(true);
        showSuccess('Verification code sent to your new email address. Please check your email.');
      } else {
        // Normal update successful
        setIsEditingAccount(false);
        setAccountData(prev => ({ ...prev, password: '' })); // Clear password field
        showSuccess('Your profile has been updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      showError(getUserFriendlyError(error, 'general'));
    } finally {
      setLoading(false);
    }
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-venue-dark">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your basic account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                value={accountData.name}
                onChange={(e) => handleAccountChange('name', e.target.value)}
                placeholder="Enter your name"
                className={`mt-1 ${accountErrors.name ? 'border-red-500' : ''}`}
                disabled={!isEditingAccount}
              />
              {accountErrors.name && (
                <p className="text-red-500 text-sm mt-1">{accountErrors.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                value={accountData.email}
                onChange={(e) => handleAccountChange('email', e.target.value)}
                placeholder="Enter your email"
                className={`mt-1 ${accountErrors.email ? 'border-red-500' : ''}`}
                disabled={!isEditingAccount}
              />
              {accountErrors.email && (
                <p className="text-red-500 text-sm mt-1">{accountErrors.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mobile Number</label>
              <Input
                value={accountData.mobileNumber}
                onChange={(e) => handleAccountChange('mobileNumber', e.target.value)}
                placeholder="Enter your mobile number"
                className={`mt-1 ${accountErrors.mobileNumber ? 'border-red-500' : ''}`}
                disabled={!isEditingAccount}
              />
              {accountErrors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">{accountErrors.mobileNumber}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password {isEditingAccount && '(Leave blank to keep current password)'}
              </label>
              <Input
                type="password"
                value={accountData.password}
                onChange={(e) => handleAccountChange('password', e.target.value)}
                placeholder={isEditingAccount ? "Enter new password (optional)" : "••••••••"}
                className={`mt-1 ${accountErrors.password ? 'border-red-500' : ''}`}
                disabled={!isEditingAccount}
              />
              {accountErrors.password && (
                <p className="text-red-500 text-sm mt-1">{accountErrors.password}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">User Type</label>
              <Input
                value={user?.userType === 'venue-owner' ? 'Venue Owner' : 'Customer'}
                className="mt-1"
                disabled
              />
            </div>

            <div className="flex gap-3 pt-4">
              {!isEditingAccount ? (
                <Button
                  onClick={() => setIsEditingAccount(true)}
                  className="bg-venue-indigo hover:bg-venue-purple text-white"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSaveAccount}
                    disabled={loading}
                    className="bg-venue-indigo hover:bg-venue-purple text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingAccount(false);
                      setAccountErrors({});
                      // Reset data to original values
                      setAccountData({
                        name: user?.name || '',
                        email: user?.email || '',
                        mobileNumber: user?.mobileNumber || '',
                        password: ''
                      });
                    }}
                    variant="outline"
                    className="border-venue-indigo text-venue-indigo hover:bg-venue-lavender"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const handleAddVenue = async (venueData) => {
    try {
      setLoading(true);
      await apiCall('/api/venues', {
        method: 'POST',
        body: JSON.stringify(venueData)
      });

      // Reload venues and stats after successful creation
      await loadVenues();
      await loadDashboardStats();

      setShowAddVenueForm(false);
      showSuccess('Venue added successfully!');
    } catch (error) {
      console.error('Error adding venue:', error);
      showError(getUserFriendlyError(error, 'general'));
      // Don't close the form on error - let user fix issues and retry
      throw error; // Re-throw so AddVenueForm can handle it
    } finally {
      setLoading(false);
    }
  };

  const handleEditVenue = async (updatedVenueData) => {
    try {
      setLoading(true);
      await apiCall(`/api/venues/${updatedVenueData.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedVenueData)
      });

      // Reload venues after successful update
      await loadVenues();

      setShowEditVenueForm(false);
      setEditingVenue(null);
    } catch (error) {
      console.error('Error updating venue:', error);
      showError(getUserFriendlyError(error, 'general'));
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (venue) => {
    setEditingVenue(venue);
    setShowEditVenueForm(true);
  };

  const handleDeleteVenue = (venueId, venueName) => {
    openConfirm({
      title: 'Delete Venue',
      description: `Are you sure you want to delete "${venueName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setLoading(true);
          await venueService.deleteVenue(venueId);
          showSuccess('Venue deleted successfully');
          await loadVenues();
          await loadDashboardStats();
        } catch (error) {
          console.error('Error deleting venue:', error);
          showError(getUserFriendlyError(error, 'general'));
        } finally {
          setLoading(false);
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleBookingAction = (bookingId, newStatus) => {
    const actionText = newStatus === 'confirmed' ? 'accept' : 'reject';
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      showError('Booking not found. Please refresh the page.');
      return;
    }

    openConfirm({
      title: newStatus === 'confirmed' ? 'Accept Booking' : 'Decline Booking',
      description: `Are you sure you want to ${actionText} the booking for ${booking.customer_name} at ${booking.venue_name}?`,
      confirmText: newStatus === 'confirmed' ? 'Accept' : 'Decline',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const originalBookings = [...bookings];
        setBookings(prevBookings =>
          prevBookings.map(b =>
            b.id === bookingId ? { ...b, status: newStatus } : b
          )
        );
        setInquiryCount(prev => Math.max(0, prev - 1));
        try {
          await apiCall(`/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
          });
          showSuccess(
            newStatus === 'confirmed'
              ? `✅ Booking accepted! ${booking.customer_name} has been notified via email.`
              : `❌ Booking declined. ${booking.customer_name} has been notified via email.`
          );
          await Promise.all([
            loadBookings(),
            loadDashboardStats(),
            loadInquiryCount()
          ]);
          notificationService.triggerUpdate();
        } catch (error) {
          console.error(`Error ${actionText}ing booking:`, error);
          setBookings(originalBookings);
          setInquiryCount(prev => prev + 1);
          showError(`Failed to ${actionText} booking. Please try again.`);
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'venues':
        return renderVenues();
      case 'bookings':
        return renderBookings();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-venue-dark">Admin Portal</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              title="Close Admin Portal"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg mb-1 transition-colors text-sm ${
                  activeSection === item.id
                    ? 'bg-venue-indigo text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-4">
              {/* Enhanced Notification Bell */}
            <div className="relative">
              <motion.div
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="inline-block"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (!showNotifications) {
                      await loadInquiries();
                    }
                    setShowNotifications(!showNotifications);
                  }}
                  className={`relative transition-all duration-300 ease-in-out transform hover:scale-110 ${
                    inquiryCount > 0
                      ? 'text-venue-purple hover:text-venue-indigo hover:bg-venue-lavender/20'
                      : 'text-gray-500 hover:text-venue-indigo hover:bg-venue-lavender/10'
                  } ${showNotifications ? 'bg-venue-lavender/30 text-venue-indigo' : ''}`}
                >
                  <motion.span
                    whileTap={{ rotate: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex"
                  >
                    <Bell className={`h-5 w-5 transition-all duration-300 ${
                      inquiryCount > 0 ? 'animate-pulse' : ''
                    }`} />
                  </motion.span>

                  {/* Enhanced notification badge */}
                  {inquiryCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-bounce">
                      {inquiryCount > 99 ? '99+' : inquiryCount}
                    </span>
                  )}

                  {/* Pulse effect for new notifications */}
                  {inquiryCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-400 rounded-full h-5 w-5 animate-ping opacity-75"></span>
                  )}
                </Button>
              </motion.div>

              {/* Enhanced Notifications Dropdown - Sticky & Responsive */}
              {showNotifications && (
                <div className="fixed right-4 top-20 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 transform transition-all duration-300 ease-out scale-100 opacity-100 max-h-[calc(100vh-6rem)] overflow-hidden">
                  {/* Header with gradient */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-venue-indigo to-venue-purple text-white rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Venue Inquiries
                      </h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {inquiryCount} pending
                      </span>
                    </div>
                    <p className="text-sm text-white/90 mt-1">
                      {inquiryCount === 0 ? 'All caught up!' : `You have ${inquiryCount} new ${inquiryCount === 1 ? 'inquiry' : 'inquiries'}`}
                    </p>
                  </div>

                  {/* Scrollable content - Mobile responsive */}
                  <div className="max-h-60 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {inquiries.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No pending inquiries</p>
                        <p className="text-xs text-gray-400 mt-1">New inquiries will appear here</p>
                      </div>
                    ) : (
                      inquiries.slice(0, 6).map((inquiry, index) => (
                        <div
                          key={inquiry.id || inquiry._id}
                          className="p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-venue-lavender/20 hover:to-venue-lavender/10 transition-all duration-200 cursor-pointer group"
                          onClick={() => {
                            setActiveSection('bookings');
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 bg-gradient-to-r from-venue-indigo to-venue-purple rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {inquiry.customer_name.charAt(0).toUpperCase()}
                                </div>
                                <p className="font-semibold text-sm text-gray-900 group-hover:text-venue-indigo transition-colors">
                                  {inquiry.customer_name}
                                </p>
                              </div>
                              <p className="text-xs text-gray-600 mb-1 ml-10">{inquiry.venue_name}</p>
                              <p className="text-xs text-gray-500 ml-10 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                                {new Date(inquiry.event_date).toLocaleDateString()}
                                <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mx-1"></span>
                                {inquiry.guest_count} guests
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-venue-indigo">
                                {formatPrice(inquiry.amount)}
                              </span>
                              <div className="text-xs text-gray-400 mt-1">
                                {index < 3 && <span className="text-green-500 font-medium">New</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer with action buttons - Mobile responsive */}
                  {inquiries.length > 0 && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-venue-indigo hover:bg-venue-purple text-white transition-all duration-200 text-xs sm:text-sm"
                          onClick={() => {
                            setActiveSection('bookings');
                            setShowNotifications(false);
                          }}
                        >
                          View All ({inquiries.length})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="sm:px-4 hover:bg-venue-lavender hover:border-venue-indigo hover:text-venue-indigo transition-all duration-200 text-xs sm:text-sm"
                          onClick={() => setShowNotifications(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

              <span className="text-sm text-gray-600">
                Welcome back, {user?.name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            key={activeSection}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={transition}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notification overlay with backdrop blur */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
          onClick={() => setShowNotifications(false)}
        />
      )}

      <AddVenueForm
        isOpen={showAddVenueForm}
        onClose={() => setShowAddVenueForm(false)}
        onSubmit={handleAddVenue}
      />

      <EditVenueForm
        isOpen={showEditVenueForm}
        onClose={() => {
          setShowEditVenueForm(false);
          setEditingVenue(null);
        }}
        onSubmit={handleEditVenue}
        venue={editingVenue}
      />

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Verify Your New Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We've sent a verification code to <strong>{pendingEmailUpdate}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="w-full"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleEmailVerification}
                  disabled={loading}
                  className="flex-1 bg-venue-indigo hover:bg-venue-purple text-white"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
                <Button
                  onClick={() => {
                    setShowEmailVerification(false);
                    setPendingEmailUpdate('');
                    setEmailOtp('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        onConfirm={async () => {
          const fn = confirmDialog.onConfirm;
          if (fn) await fn();
        }}
      />

      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
}
