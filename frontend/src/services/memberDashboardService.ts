import api from './apiService';

export interface MemberDashboardStats {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface RecentActivity {
  type: string;
  text: string;
  time: string;
}

export interface RecommendedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
}

export interface MemberAnalytics {
  successRate: number;
  endorsementRate: number;
  totalApplications: number;
  acceptedApplications: number;
  applicationTrend: {
    months: string[];
    applicationCounts: number[];
  };
  topSkills: string[];
}

export interface CommunityStats {
  totalMembers: number;
  totalJobs: number;
  recentJobs: number;
  recentMembers: number;
  membersByProfession: Array<{
    profession: string;
    count: number;
  }>;
  membersByDistrict: Array<{
    district: string;
    count: number;
  }>;
  jobsByType: Array<{
    type: string;
    count: number;
  }>;
}

export interface NetworkStats {
  locationConnections: number;
  professionConnections: number;
  skillConnections: number;
  totalConnections: number;
}

export const memberDashboardService = {
  // Get member dashboard statistics
  getMemberDashboardStats: async (): Promise<{ stats: MemberDashboardStats[] }> => {
    const response = await api.get('/member/dashboard/stats');
    return response.data;
  },

  // Get profile completion percentage
  getProfileCompletion: async (): Promise<{ profileComplete: number }> => {
    const response = await api.get('/member/dashboard/profile-completion');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit: number = 5): Promise<{ activities: RecentActivity[] }> => {
    const response = await api.get(`/member/dashboard/recent-activities?limit=${limit}`);
    return response.data;
  },

  // Get recommended jobs
  getRecommendedJobs: async (limit: number = 5): Promise<{ jobs: RecommendedJob[] }> => {
    const response = await api.get(`/member/dashboard/recommended-jobs?limit=${limit}`);
    return response.data;
  },

  // Get member analytics
  getMemberAnalytics: async (): Promise<MemberAnalytics> => {
    const response = await api.get('/member/dashboard/analytics');
    return response.data;
  },

  // Get community statistics
  getCommunityStats: async (): Promise<CommunityStats> => {
    const response = await api.get('/member/dashboard/community-stats');
    return response.data;
  },

  // Get network statistics
  getNetworkStats: async (): Promise<NetworkStats> => {
    const response = await api.get('/member/dashboard/network-stats');
    return response.data;
  },
}; 