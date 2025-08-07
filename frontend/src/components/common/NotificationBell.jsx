import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationService.getNotificationCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    
    // Refresh notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
      </div>
    );
  }

  return (
    <Link to="/notifications" className="relative">
      <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </Link>
  );
};

export default NotificationBell;
