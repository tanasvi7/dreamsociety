import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  User
} from 'lucide-react';
import { apiGet, apiPut, apiDelete } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';
import CustomAlert from '../../common/CustomAlert';
import useCustomAlert from '../../../hooks/useCustomAlert';

const MyJobPosts = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplications, setShowApplications] = useState(false);
  const { user } = useAuth();
  const { alertState, showSuccess, showError, closeAlert } = useCustomAlert();

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/jobs/my/posts');
      setMyJobs(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your job posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const res = await apiGet(`/jobs/${jobId}/applications`);
      setApplications(res.data);
    } catch (err) {
      showError('Failed to fetch applications');
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    await fetchApplications(job.id);
    setShowApplications(true);
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await apiPut(`/jobs/applications/${applicationId}/status`, { status: newStatus });
      showSuccess('Application status updated successfully');
      // Refresh applications
      if (selectedJob) {
        await fetchApplications(selectedJob.id);
      }
    } catch (err) {
      showError('Failed to update application status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await apiDelete(`/jobs/${jobId}`);
      showSuccess('Job deleted successfully');
      fetchMyJobs();
    } catch (err) {
      showError('Failed to delete job');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getApplicationStatusBadge = (status) => {
    const statusConfig = {
      applied: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      shortlisted: { color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig.applied;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your job posts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Job Posts</h1>
              <p className="text-blue-100 text-lg">Manage your job postings and view applications</p>
            </div>
            <Link 
              to="/post-job"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Briefcase className="w-5 h-5" />
              <span>Post New Job</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Job Posts */}
        <div className="space-y-6">
          {myJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No job posts yet</h3>
              <p className="text-gray-600 mb-4">Start posting jobs to find the perfect candidates</p>
              <Link
                to="/post-job"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post Your First Job
              </Link>
            </div>
          ) : (
            myJobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                        {job.company && (
                          <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(job.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{job.location || 'Location not specified'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="capitalize">{job.job_type?.replace('-', ' ')}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>
                          {job.salary_min && job.salary_max 
                            ? `${job.salary_min}-${job.salary_max} ${job.salary_currency || 'INR'}`
                            : job.salary_range || 'Salary not specified'
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Posted {formatDate(job.created_at)}</span>
                      </div>
                    </div>

                    {job.experience_required && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <User className="w-4 h-4 mr-2" />
                        <span>Experience: {job.experience_required}</span>
                      </div>
                    )}

                    {job.work_model && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span className="capitalize">Work Model: {job.work_model}</span>
                      </div>
                    )}

                    {job.contact_email && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{job.contact_email}</span>
                      </div>
                    )}

                    {job.company_website && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <Globe className="w-4 h-4 mr-2" />
                        <a 
                          href={job.company_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {job.company_website}
                        </a>
                      </div>
                    )}

                    {job.application_deadline && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Deadline: {formatDate(job.application_deadline)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => handleViewApplications(job)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Applications
                    </button>
                    
                    <Link
                      to={`/edit-job/${job.id}`}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Applications Modal */}
      {showApplications && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Applications for "{selectedJob.title}"
                </h2>
                <button
                  onClick={() => setShowApplications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here when candidates apply for your job.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map(application => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {application.applicant?.full_name || 'Unknown Applicant'}
                          </h4>
                          <p className="text-gray-600">{application.applicant?.email}</p>
                          {application.applicant?.phone && (
                            <p className="text-gray-600">{application.applicant.phone}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getApplicationStatusBadge(application.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Applied on {formatDate(application.application_date)}
                        </div>
                        
                        <div className="flex space-x-2">
                          <select
                            value={application.status}
                            onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1 text-sm"
                          >
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="accepted">Accepted</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
      />
    </>
  );
};

export default MyJobPosts;
