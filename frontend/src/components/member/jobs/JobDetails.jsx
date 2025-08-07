
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// import Navbar from '../../common/Navbar';
import { 
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Star,
  Building,
  Calendar,
  Briefcase,
  CheckCircle,
  Heart,
  Share2,
  Send
} from 'lucide-react';
import { apiGet } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/jobs/${id}`);
        setJob(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="max-w-6xl mx-auto px-4 py-8 text-red-600">{error}</div>;
  if (!job) return null;

  // Map backend fields to UI fields
  const skills = job.skills_required ? job.skills_required.split(',').map(s => s.trim()).filter(Boolean) : [];
  // Remove requirements and benefits mapping

  // Status message logic
  let statusMessage = '';
  let canApply = false;
  if (user && job) {
    if (job.status === 'accepted') {
      canApply = true;
      if (job.posted_by === user.id) statusMessage = 'Accepted by admin';
    } else if (job.posted_by === user.id) {
      if (job.status === 'pending') statusMessage = 'Pending admin review';
      else if (job.status === 'rejected') statusMessage = 'Rejected by admin';
      canApply = true; // Poster can see the job, but maybe not apply
    }
  }

  return (
    // <div className="min-h-screen bg-gray-50">
    //  <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/jobs"
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <p className="text-xl text-blue-600 font-semibold mb-4">{job.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.experience}
                    </div>
                    {job.remote && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Remote Friendly
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {job.applicants} applicants
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {job.rating} company rating
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted {job.postedAt}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Remove Requirements and Benefits sections from the details page */}

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {/* Status message for poster */}
                {statusMessage && (
                  <div className={`mb-2 text-xs font-semibold ${job.status === 'rejected' ? 'text-red-600' : job.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>{statusMessage}</div>
                )}
                {/* Only show Apply button if job is accepted or poster is viewing */}
                {canApply && job.status === 'accepted' && (
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center">
                    <Send className="w-5 h-5 mr-2" />
                    Apply Now
                  </button>
                )}
                {/* If poster is viewing their own job and it's not accepted, hide Apply button */}
                {/* Optionally, you can show a disabled button or nothing */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button className="border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Company Info */}
            {job.companyInfo ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                About Company
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{job.companyInfo.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{job.companyInfo.description}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry:</span>
                    <span className="text-gray-900">{job.companyInfo.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company Size:</span>
                    <span className="text-gray-900">{job.companyInfo.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="text-gray-900">{job.companyInfo.founded}</span>
                  </div>
                </div>
                <a
                  href={job.companyInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Visit Company Website →
                </a>
              </div>
            </div>
            ) : null}

            {/* Similar Jobs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-gray-900 mb-1">Frontend Developer</h4>
                    <p className="text-blue-600 text-sm mb-1">StartupABC</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Remote</span>
                      <span>₹8-12 LPA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    // </div>
  );
};

export default JobDetails;
