import apiClient from '../lib/apiClient.js';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.isPolling = false;
    this.pollInterval = null;
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Start polling if not already started
    if (!this.isPolling) {
      this.startPolling();
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
      
      // Stop polling if no listeners
      if (this.listeners.length === 0) {
        this.stopPolling();
      }
    };
  }

  // Notify all subscribers
  notify(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Start polling for updates
  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollInterval = setInterval(() => {
      this.checkForUpdates();
    }, 15000); // Check every 15 seconds
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
  }

  // Check for notification updates
  async checkForUpdates() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const data = await apiClient.getJson('/api/bookings/customer/notification-count');
      if (data) {
        this.notify({
          type: 'count_update',
          count: data.unreadCount || 0
        });
      }
    } catch (error) {
      console.error('Error checking for notification updates:', error);
    }
  }

  // Manual trigger for immediate update check
  async triggerUpdate() {
    await this.checkForUpdates();
  }

  // Get latest notifications
  async getNotifications() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];

      const notifications = await apiClient.getJson('/api/bookings/customer/notifications');

      if (notifications) {
        this.notify({
          type: 'notifications_update',
          notifications: notifications || []
        });
        return notifications || [];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    return [];
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;
