
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Navbar from '../../common/Navbar';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Filter, 
  Briefcase,
  Building,
  Users,
  Star,
  Plus
} from 'lucide-react';
import JobCard from './JobCard';
import { apiGet } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';

const JobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await apiGet('/jobs');
        setJobs(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    // Only show accepted jobs to all, or jobs posted by the user (with any status)
    if (job.status === 'accepted') {
      // Show to everyone
      return true;
    } else if (user && job.posted_by === user.id) {
      // Show to poster even if pending or rejected
      return true;
    }
    return false;
  }).filter(job => {
    // Existing search/filter logic
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.skills_required && job.skills_required.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !locationFilter || 
                           (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));
    const matchesType = !jobTypeFilter || job.job_type === jobTypeFilter.toLowerCase();
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Find Your Dream Job</h1>
            <p className="text-blue-100 text-lg">Discover opportunities that match your skills and aspirations</p>
          </div>
          <Link 
            to="/post-job"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Post Job</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search jobs, companies, or skills..."
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Location"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <select
                  value={salaryFilter}
                  onChange={(e) => setSalaryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Salary</option>
                  <option value="0-5">0-5 LPA</option>
                  <option value="5-10">5-10 LPA</option>
                  <option value="10-15">10-15 LPA</option>
                  <option value="15+">15+ LPA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Any Experience</option>
                  <option value="fresher">Fresher</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {loading ? 'Loading jobs...' : error ? error : `Showing ${filteredJobs.length} of ${jobs.length} jobs`}
        </p>
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {!loading && !error && filteredJobs.map(job => <JobCard key={job.id} job={job} />)}
      </div>

      {/* No Results */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setLocationFilter('');
              setJobTypeFilter('');
              setSalaryFilter('');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default JobPortal;
