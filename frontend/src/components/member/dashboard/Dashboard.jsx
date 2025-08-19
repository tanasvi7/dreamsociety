
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfilePhoto } from '../../../hooks/useProfilePhoto';
import ProfileImage from '../../common/ProfileImage';
import { getNavigationPath, getRedirectMessage } from '../../../utils/redirectUtils';
import { 
  User, 
  Briefcase, 
  TrendingUp, 
  Bell, 
  Calendar,
  Award,
  Users,
  DollarSign,
  ArrowRight,
  Target,
  BookOpen,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { memberDashboardService } from '../../../services/memberDashboardService';
import { notificationService } from '../../../services/notificationService';
import {
  ApplicationTrend,
  SuccessRate,
  EndorsementRate,
  TopSkills,
  ApplicationStatus
} from './MemberCharts';
import {
  CommunityOverview,
  MembersByProfession,
  MembersByLocation,
  JobsByType,
  NetworkConnections
} from './CommunityCharts';

const Dashboard = () => {
  const { user, loadProfilePhoto } = useAuth();
  const { photoUrl, loading: photoLoading } = useProfilePhoto();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [profileComplete, setProfileComplete] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [networkStats, setNetworkStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        statsResponse,
        profileResponse,
        activitiesResponse,
        jobsResponse,
        analyticsResponse,
        notificationsResponse,
        communityResponse,
        networkResponse
      ] = await Promise.all([
        memberDashboardService.getMemberDashboardStats(),
        memberDashboardService.getProfileCompletion(),
        memberDashboardService.getRecentActivities(5),
        memberDashboardService.getRecommendedJobs(4),
        memberDashboardService.getMemberAnalytics(),
        notificationService.getUserNotifications(1, 3),
        memberDashboardService.getCommunityStats(),
        memberDashboardService.getNetworkStats()
      ]);

      setStats(statsResponse.stats);
      setProfileComplete(profileResponse.profileComplete);
      setRecentActivities(activitiesResponse.activities);
      setRecommendedJobs(jobsResponse.jobs);
      setAnalytics(analyticsResponse);
      setRecentNotifications(notificationsResponse.notifications);
      setCommunityStats(communityResponse);
      setNetworkStats(networkResponse);
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

  // Load profile photo when dashboard mounts
  useEffect(() => {
    if (user) {
      loadProfilePhoto();
    }
  }, [user, loadProfilePhoto]);

  // Handle redirect context after login
  useEffect(() => {
    const handleRedirectContext = () => {
      const pendingSearchContext = localStorage.getItem('pendingSearchContext');
      const pendingPreviewContext = localStorage.getItem('pendingPreviewContext');
      
      if (pendingSearchContext) {
        try {
          const context = JSON.parse(pendingSearchContext);
          console.log('Dashboard: Found pending search context:', context);
          
          // Clear the pending context
          localStorage.removeItem('pendingSearchContext');
          
          // Use the utility function to get the correct navigation path
          const redirectPath = getNavigationPath({ type: 'search', context });
          const redirectMessage = getRedirectMessage({ type: 'search', context });
          
          console.log('Dashboard: Redirecting to:', redirectPath);
          if (redirectMessage) {
            console.log('Dashboard: Redirect message:', redirectMessage);
          }
          
          navigate(redirectPath);
        } catch (error) {
          console.error('Dashboard: Error parsing pending search context:', error);
          localStorage.removeItem('pendingSearchContext');
        }
      } else if (pendingPreviewContext) {
        try {
          const context = JSON.parse(pendingPreviewContext);
          console.log('Dashboard: Found pending preview context:', context);
          
          // Clear the pending context
          localStorage.removeItem('pendingPreviewContext');
          
          // Use the utility function to get the correct navigation path
          const redirectPath = getNavigationPath({ type: 'preview', context });
          const redirectMessage = getRedirectMessage({ type: 'preview', context });
          
          console.log('Dashboard: Redirecting to:', redirectPath);
          if (redirectMessage) {
            console.log('Dashboard: Redirect message:', redirectMessage);
          }
          
          navigate(redirectPath);
        } catch (error) {
          console.error('Dashboard: Error parsing pending preview context:', error);
          localStorage.removeItem('pendingPreviewContext');
        }
      }
    };

    // Only handle redirect context if we're not loading
    if (!loading) {
      handleRedirectContext();
    }
  }, [loading, navigate]);

  const getIconComponent = (iconName) => {
    const iconMap = {
      'User': User,
      'Briefcase': Briefcase,
      'Users': Users,
      'Award': Award,
      'Eye': Eye
    };
    return iconMap[iconName] || User;
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      'application': Briefcase,
      'skill': Award,
      'connection': Users,
      'profile': User
    };
    return iconMap[type] || Bell;
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'job_posting': Briefcase,
      'job_application': Briefcase,
      'skill_endorsement': Award,
      'profile_update': User,
      'system_announcement': Bell
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'job_posting': 'blue',
      'job_application': 'green',
      'skill_endorsement': 'yellow',
      'profile_update': 'purple',
      'system_announcement': 'gray'
    };
    return colorMap[type] || 'gray';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowImageModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading your dashboard...</span>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-8 text-white mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name || user?.full_name}!</h1>
            <p className="text-blue-100 mb-4 text-sm sm:text-base">Ready to take the next step in your career?</p>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm">Profile {profileComplete}% complete</span>
              </div>
              <div className="w-full sm:w-48 bg-blue-500 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileComplete}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex justify-center sm:block">
            <ProfileImage
              photoUrl={photoUrl}
              size="lg"
              loading={photoLoading}
              alt="Profile"
              border={true}
              borderColor="border-white"
              onClick={handleImageClick}
            />
          </div>
        </div>
      </div>

      {/* Community Overview */}
      {communityStats && (
        <div className="mb-6 sm:mb-8">
          <CommunityOverview stats={communityStats} />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const IconComponent = getIconComponent(stat.icon);
          return (
            <div key={index} className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                  <p className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 truncate">{stat.value}</p>
                </div>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Statistics */}
      {communityStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MembersByProfession data={communityStats.membersByProfession} />
          <JobsByType data={communityStats.jobsByType} />
        </div>
      )}

      {/* Members by Location */}
      {communityStats && (
        <div className="mb-6 sm:mb-8">
          <MembersByLocation 
            districtData={communityStats.membersByDistrict}
          />
        </div>
      )}

      {/* Network Connections */}
      {networkStats && (
        <div className="mb-6 sm:mb-8">
          <NetworkConnections networkStats={networkStats} />
        </div>
      )}

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ApplicationTrend data={analytics.applicationTrend} />
          <ApplicationStatus 
            totalApplications={analytics.totalApplications}
            acceptedApplications={analytics.acceptedApplications}
          />
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <SuccessRate 
            successRate={analytics.successRate}
            endorsementRate={analytics.endorsementRate}
          />
          <EndorsementRate endorsementRate={analytics.endorsementRate} />
        </div>
      )}

      {analytics?.topSkills && analytics.topSkills.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <TopSkills skills={analytics.topSkills} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
              <button
                onClick={() => fetchDashboardData()}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ActivityIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm truncate">{activity.text}</p>
                        <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm sm:text-base">No recent activities</p>
                  <p className="text-xs sm:text-sm text-gray-400">Start applying for jobs to see your activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Completion */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Your Profile</h3>
            <div className="space-y-3">
              <Link 
                to="/profile" 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Update Profile</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Add Skills</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Quick Stats Summary */}
          {analytics && (
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-semibold text-green-600">{analytics.successRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Endorsement Rate</span>
                  <span className="text-sm font-semibold text-yellow-600">{analytics.endorsementRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Applications</span>
                  <span className="text-sm font-semibold text-blue-600">{analytics.totalApplications}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Notifications */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
              <Link 
                to="/notifications" 
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentNotifications.length > 0 ? (
                recentNotifications.slice(0, 3).map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const color = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        !notification.is_read 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-${color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-2 h-2 sm:w-3 sm:h-3 text-${color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No recent notifications</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="mt-6 sm:mt-8 bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recommended Jobs</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchDashboardData()}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link 
              to="/jobs" 
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {recommendedJobs.length > 0 ? (
            recommendedJobs.map((job) => (
              <div 
                key={job.id} 
                className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{job.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{job.company}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2 flex-shrink-0">
                    {job.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3">
                  <span className="truncate">{job.location}</span>
                  <span className="font-semibold text-green-600 flex-shrink-0 ml-2">{job.salary}</span>
                </div>
                <Link 
                  to={`/jobs/${job.id}`}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-6 sm:py-8">
              <Briefcase className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm sm:text-base">No recommended jobs available</p>
              <p className="text-xs sm:text-sm text-gray-400">Complete your profile to get personalized job recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div className="relative max-w-2xl max-h-full w-full">
            <button
              onClick={handleCloseModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              {photoLoading ? (
                <div className="w-full h-64 sm:h-96 flex items-center justify-center bg-gray-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              ) : (
                <div className="w-full h-64 sm:h-96 flex items-center justify-center bg-gray-100">
                  <User className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
