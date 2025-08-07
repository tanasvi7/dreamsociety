import api from './apiService';

export interface Notification {
  id: number;
  user_id: number;
  type: 'job_posting' | 'job_application' | 'skill_endorsement' | 'profile_update' | 'system_announcement';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface NotificationCount {
  unreadCount: number;
}

export const notificationService = {
  // Get user notifications with pagination
  getUserNotifications: async (page: number = 1, limit: number = 10): Promise<NotificationResponse> => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get notification count for navbar
  getNotificationCount: async (): Promise<NotificationCount> => {
    const response = await api.get('/notifications/count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<{ message: string }> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};
