import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase,
  Bookmark,
  Send,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSubscription } from '../../../hooks/useSubscription';
import { apiPost } from '../../../services/apiService';
import useCustomAlert from '../../../hooks/useCustomAlert';

const JobCard = ({ job }) => {
  const { user } = useAuth();
  const { is_subscribed } = useSubscription();
  const { showAlert } = useCustomAlert();
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  if (!job) return null;
  // Ensure skills is always an array
  let skills = [];
  if (Array.isArray(job.skills)) {
    skills = job.skills;
  } else if (typeof job.skills_required === 'string') {
    skills = job.skills_required.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(skills)) skills = [];

  // Status message logic
  let statusMessage = '';
  if (user && job.posted_by === user.id && job.status !== 'accepted') {
    if (job.status === 'pending') statusMessage = 'Pending admin review';
    else if (job.status === 'rejected') statusMessage = 'Rejected by admin';
  } else if (user && job.posted_by === user.id && job.status === 'accepted') {
    statusMessage = 'Accepted by admin';
  }

  const handleApply = async () => {
    if (!user) {
      showAlert('Please login to apply for this job', 'error');
      return;
    }

    if (!is_subscribed) {
      showAlert('Please subscribe to apply for jobs', 'warning');
      return;
    }

    if (job.posted_by === user.id) {
      showAlert('You cannot apply to your own job posting', 'error');
      return;
    }

    setApplying(true);
    try {
      await apiPost(`/jobs/apply/${job.id}`);
      setHasApplied(true);
      showAlert('Application submitted successfully!', 'success');
    } catch (err) {
      if (err.response?.data?.error === 'Already applied') {
        setHasApplied(true);
        showAlert('You have already applied to this job', 'info');
      } else {
        showAlert('Failed to submit application. Please try again.', 'error');
      }
    } finally {
      setApplying(false);
    }
  };

  // Check if user has already applied when component mounts
  React.useEffect(() => {
    if (user && job && job.hasApplied) {
      setHasApplied(true);
    }
  }, [user, job]);
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-start space-x-3 mb-3">
        <img
          src={job.logo || '/placeholder.svg'}
          alt={`${job.company || 'Company'} logo`}
          className="w-12 h-12 rounded-md object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{job.company || 'Company not specified'}</p>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{job.location || 'Location not specified'}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">
            {job.salary_min && job.salary_max 
              ? `${job.salary_min}-${job.salary_max} ${job.salary_currency || 'INR'}`
              : job.salary_range || 'Salary not specified'
            }
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate capitalize">{job.job_type?.replace('-', ' ')}</span>
        </div>

        <div className="flex items-center">
          <Briefcase className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{job.experience_required || 'Experience not specified'}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs"
          >
            {skill}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
            +{skills.length - 3} more
          </span>
        )}
      </div>
      {/* Status message for poster */}
      {statusMessage && (
        <div className={`mb-2 text-xs font-semibold ${job.status === 'rejected' ? 'text-red-600' : job.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>{statusMessage}</div>
      )}
      
      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
            </p>
            <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Bookmark className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                </button>
                {/* Show Apply button for accepted jobs that user didn't post */}
                {job.status === 'accepted' && user && job.posted_by !== user.id && (
                  is_subscribed ? (
                    <button
                      onClick={handleApply}
                      disabled={applying || hasApplied}
                      className={`px-3 py-1.5 rounded-md text-center font-medium text-sm transition-colors ${
                        hasApplied 
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : applying
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {hasApplied ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : applying ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-md text-center font-medium text-sm bg-gray-400 text-white cursor-not-allowed flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3" />
                      Subscribe to Apply
                    </button>
                  )
                )}
                {is_subscribed ? (
                  <Link
                    to={`/jobs/${job.id}`}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-center font-medium text-sm"
                  >
                    View
                  </Link>
                ) : (
                  <button
                    disabled
                    className="bg-gray-400 text-white px-4 py-1.5 rounded-md cursor-not-allowed text-center font-medium text-sm flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Subscribe to View
                  </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard; 
