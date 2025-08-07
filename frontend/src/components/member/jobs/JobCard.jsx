import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const JobCard = ({ job }) => {
  const { user } = useAuth();
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
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-start space-x-3 mb-3">
        <img
          src={job.logo || '/placeholder.svg'}
          alt={`${job.company} logo`}
          className="w-12 h-12 rounded-md object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{job.company}</p>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{job.salary}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{job.type}</span>
        </div>

        <div className="flex items-center">
          <Briefcase className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{job.experience}</span>
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
                Posted {job.postedAt}
            </p>
            <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Bookmark className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                </button>
                <Link
                    to={`/jobs/${job.id}`}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-center font-medium text-sm"
                >
                    View
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard; 
