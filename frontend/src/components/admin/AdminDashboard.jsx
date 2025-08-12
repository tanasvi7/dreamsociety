import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  Shield,
  Building,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { adminDashboardService } from '../../services/adminDashboardService';
import {
  UserRegistrationTrend,
  UserRoleDistribution,
  UserVerificationStatus,
  JobStatusDistribution,
  JobTypeDistribution,
  TopJobsByApplications
} from './AdminCharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [jobAnalytics, setJobAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        statsResponse,
        usersResponse,
        jobsResponse,
        userAnalyticsResponse,
        jobAnalyticsResponse
      ] = await Promise.all([
        adminDashboardService.getDashboardStats(),
        adminDashboardService.getRecentUsers(5),
        adminDashboardService.getRecentJobs(5),
        adminDashboardService.getUserAnalytics(),
        adminDashboardService.getJobAnalytics()
      ]);

      setStats(statsResponse.stats);
      setRecentUsers(usersResponse.users);
      setRecentJobs(jobsResponse.jobs);
      setUserAnalytics(userAnalyticsResponse);
      setJobAnalytics(jobAnalyticsResponse);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getIconComponent = (iconName) => {
    const iconMap = {
      'Users': Users,
      'Briefcase': Briefcase,
      'BarChart3': BarChart3,
      'Building': Building
    };
    return iconMap[iconName] || Users;
  };

  const getChangeColor = (change) => {
    if (change.startsWith('+')) return 'text-green-600';
    if (change.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Overview</h1>
            <p className="text-blue-100">Welcome to the Dream Society control center.</p>
          </div>
          <Shield className="w-12 h-12 opacity-50" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const IconComponent = getIconComponent(stat.icon);
          return (
            <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-xs sm:text-sm font-medium ${getChangeColor(stat.change)}`}>
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <UserRegistrationTrend data={userAnalytics?.registrationTrend} />
        <UserRoleDistribution data={userAnalytics?.roleDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <UserVerificationStatus data={userAnalytics?.verificationStatus} />
        <JobStatusDistribution data={jobAnalytics?.statusDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <JobTypeDistribution data={jobAnalytics?.typeDistribution} />
        <TopJobsByApplications data={jobAnalytics?.topJobs} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Users</h2>
            <button
              onClick={fetchDashboardData}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{user.full_name}</p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{user.created_at}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm sm:text-base">No recent users</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Jobs</h2>
            <button
              onClick={fetchDashboardData}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentJobs.length > 0 ? (
              recentJobs.map((job, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{job.title}</p>
                    <p className="text-gray-500 text-xs truncate">{job.company}</p>
                  </div>
                  <span className="text-xs text-gray-400">{job.created_at}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm sm:text-base">No recent jobs</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">View and edit user accounts</p>
          </button>
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Briefcase className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Job Management</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review and approve jobs</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 