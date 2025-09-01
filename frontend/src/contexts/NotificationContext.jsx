import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(({ type = 'info', title, message, duration = 5000, id = Date.now() }) => {
    const newNotification = { id, type, title, message, duration };
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((title, message, duration) => {
    addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const error = useCallback((title, message, duration) => {
    addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const warning = useCallback((title, message, duration) => {
    addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  const info = useCallback((title, message, duration) => {
    addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-400';
      case 'error':
        return 'text-red-800 dark:text-red-400';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-400';
      case 'info':
        return 'text-blue-800 dark:text-blue-400';
      default:
        return 'text-blue-800 dark:text-blue-400';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBgColor(notification.type)} border rounded-xl p-4 shadow-lg animate-slide-in-right`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              {notification.title && (
                <h4 className={`font-semibold text-sm ${getTextColor(notification.type)} mb-1`}>
                  {notification.title}
                </h4>
              )}
              {notification.message && (
                <p className={`text-sm ${getTextColor(notification.type)}`}>
                  {notification.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-black/10 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 