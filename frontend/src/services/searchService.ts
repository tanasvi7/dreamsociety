import api from './apiService';

export interface SearchResult {
  type: 'member' | 'job' | 'company' | 'resource';
  id: number;
  name?: string;
  email?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  category?: string;
  image?: string;
  url?: string;
  requiresSubscription?: boolean;
}

export interface SearchParams {
  query: string;
  type?: 'member' | 'job' | 'company' | 'resource' | 'all';
  limit?: number;
  offset?: number;
}

class SearchService {
  /**
   * Test backend connectivity and available endpoints
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await api.get('/health');
      console.log('🔍 Backend health check response:', response.data);
      return true;
    } catch (error) {
      console.log('🔍 Health endpoint not available, testing with jobs endpoint...');
      try {
        // Try a simple endpoint that should exist
        const response = await api.get('/jobs');
        console.log('🔍 Backend is accessible via jobs endpoint');
        return true;
      } catch (jobsError) {
        console.error('🔍 Backend connection test failed:', jobsError);
        return false;
      }
    }
  }

  /**
   * Get available search endpoints
   */
  async getAvailableEndpoints(): Promise<string[]> {
    const endpoints = [];
    
    try {
      // Test various search endpoints
      const testEndpoints = [
        '/search/global',
        '/search/members', 
        '/search/jobs',
        '/users/search',
        '/jobs/search',
        '/api/search',
        '/api/users/search'
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await api.get(endpoint, { params: { q: 'test', limit: 1 } });
          console.log(`🔍 Endpoint ${endpoint} is available:`, response.status);
          endpoints.push(endpoint);
        } catch (error) {
          console.log(`🔍 Endpoint ${endpoint} is not available:`, error.response?.status);
        }
      }
    } catch (error) {
      console.error('🔍 Error testing endpoints:', error);
    }
    
    return endpoints;
  }

  /**
   * Perform global search across all content types
   */
  async globalSearch(params: SearchParams): Promise<SearchResult[]> {
    try {
      console.log('🔍 GlobalSearch: Starting search with params:', params);
      
      // Use the new global search endpoint
      const response = await api.get('/search/global', {
        params: {
          query: params.query,
          type: params.type || 'all', // This will search jobs and members by default
          limit: params.limit || 20
        }
      });
      
      console.log('🔍 GlobalSearch: API Response:', response.data);
      
      let results = [];
      if (response.data && Array.isArray(response.data)) {
        results = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        results = response.data.results;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        results = response.data.data;
      }
      
      console.log('🔍 GlobalSearch: Results:', results);
      return results;
    } catch (error) {
      console.error('🔍 GlobalSearch: Error occurred:', error);
      
      // Fallback to job search only
      try {
        console.log('🔍 GlobalSearch: Falling back to job search only...');
        const jobResults = await this.searchJobs(params.query, params.limit || 20);
        return jobResults;
      } catch (fallbackError) {
        console.error('🔍 GlobalSearch: Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Perform public global search for unauthenticated users
   */
  async publicGlobalSearch(params: SearchParams): Promise<SearchResult[]> {
    try {
      console.log('🔍 PublicGlobalSearch: Starting search with params:', params);
      
      // Use the public global search endpoint
      const response = await api.get('/search/global/public', {
        params: {
          query: params.query,
          type: params.type || 'all',
          limit: params.limit || 20
        }
      });
      
      console.log('🔍 PublicGlobalSearch: API Response:', response.data);
      
      let results = [];
      if (response.data && Array.isArray(response.data)) {
        results = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        results = response.data.results;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        results = response.data.data;
      }
      
      console.log('🔍 PublicGlobalSearch: Results:', results);
      return results;
    } catch (error) {
      console.error('🔍 PublicGlobalSearch: Error occurred:', error);
      return [];
    }
  }





  /**
   * Search for jobs by title
   */
  async searchJobs(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      console.log('🔍 SearchJobs: Starting search for query:', query);
      
      // Use the new search endpoint
      const response = await api.get('/search/jobs', {
        params: { q: query, limit }
      });
      
      console.log('🔍 SearchJobs: API Response:', response.data);
      
      // Handle the response format
      let jobs = [];
      if (response.data && Array.isArray(response.data)) {
        jobs = response.data;
      } else if (response.data && response.data.jobs && Array.isArray(response.data.jobs)) {
        jobs = response.data.jobs;
      }
      
      console.log('🔍 SearchJobs: Jobs found:', jobs.length);
      
      const results = jobs.map((job: any) => ({
        type: 'job' as const,
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        url: job.url
      }));
      
      console.log('🔍 SearchJobs: Final results:', results);
      return results;
    } catch (error) {
      console.error('🔍 SearchJobs: Error occurred:', error);
      
      // Try alternative endpoint if the main one fails
      try {
        console.log('🔍 SearchJobs: Trying alternative endpoint...');
        const altResponse = await api.get('/search/jobs', {
          params: { 
            q: query, 
            limit
          }
        });
        
        console.log('🔍 SearchJobs: Alternative API Response:', altResponse.data);
        
        let altJobs = [];
        if (altResponse.data && Array.isArray(altResponse.data)) {
          altJobs = altResponse.data;
        } else if (altResponse.data && Array.isArray(altResponse.data.jobs)) {
          altJobs = altResponse.data.jobs;
        } else if (altResponse.data && altResponse.data.data && Array.isArray(altResponse.data.data)) {
          altJobs = altResponse.data.data;
        }
        
        const altResults = altJobs.map((job: any) => ({
          type: 'job' as const,
          id: job.id,
          title: job.title || job.job_title,
          company: job.company_name || job.company,
          location: job.location,
          description: job.description ? (job.description.length > 100 ? job.description.substring(0, 100) + '...' : job.description) : '',
          salary: job.salary_range || job.salary,
          jobType: job.job_type
        }));
        
        console.log('🔍 SearchJobs: Alternative results:', altResults);
        return altResults;
      } catch (altError) {
        console.error('🔍 SearchJobs: Alternative endpoint also failed:', altError);
        return [];
      }
    }
  }

  /**
   * Search for members
   */
  async searchMembers(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const response = await api.get('/search/members', {
        params: { q: query, limit }
      });
      
      // Handle different response formats
      let members = [];
      if (response.data && Array.isArray(response.data)) {
        members = response.data;
      } else if (response.data && Array.isArray(response.data.members)) {
        members = response.data.members;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        members = response.data.data;
      }
      
      return members.map((member: any) => ({
        type: 'member' as const,
        id: member.id,
        name: member.name,
        email: member.email,
        image: member.image,
        description: member.description
      }));
    } catch (error) {
      console.error('Member search error:', error);
      return [];
    }
  }

  /**
   * Search for companies
   */
  async searchCompanies(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const response = await api.get('/search/companies', {
        params: { q: query, limit }
      });
      
      // Handle different response formats
      let companies = [];
      if (response.data && Array.isArray(response.data)) {
        companies = response.data;
      } else if (response.data && Array.isArray(response.data.companies)) {
        companies = response.data.companies;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        companies = response.data.data;
      }
      
      return companies.map((company: any) => ({
        type: 'company' as const,
        id: company.id,
        name: company.name,
        description: company.description,
        image: company.logo_url || company.logo || company.image
      }));
    } catch (error) {
      console.error('Company search error:', error);
      return [];
    }
  }

  /**
   * Search for resources
   */
  async searchResources(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const response = await api.get('/search/resources', {
        params: { q: query, limit }
      });
      
      // Handle different response formats
      let resources = [];
      if (response.data && Array.isArray(response.data)) {
        resources = response.data;
      } else if (response.data && Array.isArray(response.data.resources)) {
        resources = response.data.resources;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        resources = response.data.data;
      }
      
      return resources.map((resource: any) => ({
        type: 'resource' as const,
        id: resource.id,
        title: resource.title,
        category: resource.category,
        description: resource.description
      }));
    } catch (error) {
      console.error('Resource search error:', error);
      return [];
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await api.get('/search/suggestions', {
        params: { q: query }
      });
      
      return response.data.suggestions || [];
    } catch (error) {
      console.log('🔍 Search suggestions endpoint not available');
      return [];
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(): Promise<string[]> {
    try {
      const response = await api.get('/search/popular');
      return response.data.popular_searches || [];
    } catch (error) {
      console.log('🔍 Popular searches endpoint not available, using defaults');
      // Return specific job titles and common names as fallback
      return ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer'];
    }
  }


}

export const searchService = new SearchService(); 