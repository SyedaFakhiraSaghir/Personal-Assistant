import { useEffect, useCallback } from 'react';
import {
  notifySuccess,
  notifyInfo,
  notifyWarning,
  notifyError,
} from './NotificationService';

// Moved outside component to prevent recreation on every render
const healthTips = [
  { message: "🚰 Time to hydrate! Drink a glass of water", type: 'success' },
  { message: "🍎 Time to eat your meal!", type: 'info' },
  { message: "🏃♀️ You've been inactive for 1 hour. Time to stretch!", type: 'warning' },
  { message: "🎉 Congratulations! You've reached your step goal", type: 'success' },
  { message: "⚠️ Low activity level detected this week", type: 'error' },
  { message: "🧘 Reminder: Time for your afternoon meditation", type: 'info' },
];

const NotificationReminder = () => {
  const triggerNotification = useCallback((notification) => {
    switch (notification.type) {
      case 'success':
        notifySuccess(notification.message);
        break;
      case 'info':
        notifyInfo(notification.message);
        break;
      case 'warning':
        notifyWarning(notification.message);
        break;
      case 'error':
        notifyError(notification.message);
        break;
      default:
        notifyInfo(notification.message);
    }
  }, []);

  const showRandomNotification = useCallback(() => {
    const randomNotification = healthTips[Math.floor(Math.random() * healthTips.length)];
    triggerNotification(randomNotification);
  }, [triggerNotification]);

  useEffect(() => {
    // Keyboard shortcut
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'n') {
        showRandomNotification();
      }
    };

    // Regular interval notifications (every hour)
    const interval = setInterval(showRandomNotification, 3600000); // 1 hour
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showRandomNotification]);

  return null; // This component doesn't render anything visible
};

export default NotificationReminder;