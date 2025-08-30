import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const notificationTypes = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-500'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-500'
  }
};

export const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export const Notification = ({ notification, onClose }) => {
  const { type, title, message, duration = 5000 } = notification;
  const config = notificationTypes[type] || notificationTypes.info;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={cn(
      'flex items-start p-4 border rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out transform',
      'animate-in slide-in-from-right-full fade-in',
      config.className
    )}>
      <Icon className={cn('h-5 w-5 mt-0.5 mr-3 flex-shrink-0', config.iconClassName)} />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-medium mb-1">{title}</h4>
        )}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (message, title = 'Success') => {
    addNotification({ type: 'success', title, message });
  };

  const showError = (message, title = 'Error') => {
    addNotification({ type: 'error', title, message });
  };

  const showWarning = (message, title = 'Warning') => {
    addNotification({ type: 'warning', title, message });
  };

  const showInfo = (message, title = 'Info') => {
    addNotification({ type: 'info', title, message });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
