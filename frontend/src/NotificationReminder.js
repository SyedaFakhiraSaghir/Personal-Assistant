import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import styles from './NotificationReminder.module.css';

const NotificationReminder = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/upcoming?userId=${userId}&limit=3`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        
        const data = await response.json();
        setUnreadCount(data.length);
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className={styles.container}>
      <button 
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {notifications.length === 0 ? (
            <div className={styles.empty}>No new notifications</div>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className={styles.dropdownItem}>
                <div className={styles.dropdownHeader}>
                  <strong>{notification.title}</strong>
                  <small>{notification.module}</small>
                </div>
                <p>{notification.message}</p>
              </div>
            ))
          )}
          <div className={styles.dropdownFooter}>
            <a href="/notifications">View all notifications</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationReminder;