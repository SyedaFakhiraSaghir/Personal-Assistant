import { useEffect, useCallback } from 'react';
import {
  notifySuccess,
  notifyInfo,
  notifyWarning,
  notifyError,
} from './NotificationService';

const NotificationReminder = () => {
  const healthTips = [
    { message: "🚰 Time to hydrate! Drink a glass of water", type: 'success' },
    { message: "🍎 Time to eat your meal!", type: 'info' },
    { message: "🏃♀️ You've been inactive for 1 hour. Time to stretch!", type: 'warning' },
    { message: "🎉 Congratulations! You've reached your step goal", type: 'success' },
    { message: "⚠️ Low activity level detected this week", type: 'error' },
    { message: "🧘 Reminder: Time for your afternoon meditation", type: 'info' },
  ];

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
    const randomNotification =
      healthTips[Math.floor(Math.random() * healthTips.length)];
    triggerNotification(randomNotification);
  }, [healthTips, triggerNotification]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'n') {
        showRandomNotification();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showRandomNotification]);

  return null;
};

export default NotificationReminder;