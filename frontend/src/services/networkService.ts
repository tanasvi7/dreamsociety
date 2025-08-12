import api from './apiService';

export interface NetworkFilters {
  district?: string;
  caste?: string;
  experience?: string;
  education?: string;
  company?: string;
}

export interface NetworkMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  title: string;
  company: string;
  education: string;
  institution: string;
  yearOfPassing: string;
  grade: string;
  yearsOfExperience: string;
  currentlyWorking: boolean;
  village: string;
  mandal: string;
  district: string;
  native_place: string;
  caste: string;
  subcaste: string;
  mutualConnections: number;
  joinedDate: string;
}

export interface NetworkResponse {
  members: NetworkMember[];
  pagination: {
    page: number;
    total: number;
    limit: number;
    pages: number;
  };
}

export interface FilterOptions {
  districts: string[];
  castes: string[];
  educationDegrees: string[];
  companies: string[];
}

export const networkService = {
  // Get all members with pagination and filters
  getMembers: async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    sortBy: string = 'recent',
    filters?: NetworkFilters
  ): Promise<NetworkResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() && value !== '') {
          params.append(key, value.trim());
        }
      });
    }

    const response = await api.get(`/users/members?${params}`);
    return response.data;
  },

  // Get filter options for network search
  getFilterOptions: async (): Promise<FilterOptions> => {
    const response = await api.get('/users/network/filter-options');
    return response.data;
  },

  // Get individual member profile for network view
  getMemberProfile: async (id: number): Promise<NetworkMember> => {
    const response = await api.get(`/users/network/${id}`);
    return response.data;
  }
};
