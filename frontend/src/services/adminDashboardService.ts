import api from './apiService';

export interface DashboardStats {
  label: string;
  value: string;
  change: string;
  color: string;
  icon: string;
}

export interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
}

export interface RecentJob {
  id: number;
  title: string;
  company: string;
  applicants: number;
  status: string;
}

export interface UserAnalytics {
  registrationTrend: {
    months: string[];
    userCounts: number[];
  };
  roleDistribution: {
    role: string;
    count: number;
  }[];
  verificationStatus: {
    verified: boolean;
    count: number;
  }[];
}

export interface JobAnalytics {
  jobStatusDistribution: {
    status: string;
    count: number;
  }[];
  jobTypeDistribution: {
    type: string;
    count: number;
  }[];
  topJobsByApplications: {
    id: number;
    title: string;
    applications: number;
  }[];
}

export const adminDashboardService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<{ stats: DashboardStats[] }> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Get recent users
  getRecentUsers: async (limit: number = 5): Promise<{ users: RecentUser[] }> => {
    const response = await api.get(`/admin/dashboard/recent-users?limit=${limit}`);
    return response.data;
  },

  // Get recent jobs
  getRecentJobs: async (limit: number = 5): Promise<{ jobs: RecentJob[] }> => {
    const response = await api.get(`/admin/dashboard/recent-jobs?limit=${limit}`);
    return response.data;
  },

  // Get user analytics
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const response = await api.get('/admin/dashboard/user-analytics');
    return response.data;
  },

  // Get job analytics
  getJobAnalytics: async (): Promise<JobAnalytics> => {
    const response = await api.get('/admin/dashboard/job-analytics');
    return response.data;
  }
}; 