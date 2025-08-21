import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Calendar, 
  Phone, 
  Mail, 
  ArrowLeft,
  User,
  Home,
  Users,
  Eye,
  Lock,
  Star
} from 'lucide-react';
import api from '../../../services/apiService';
import SubscriptionPrompt from '../../common/SubscriptionPrompt';

const MemberProfile = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        setSubscriptionRequired(false);
        // Use the network route for member profiles
        const response = await api.get(`/users/network/${id}`);
        setMember(response.data);
      } catch (err) {
        console.error('Error fetching member profile:', err);
        
        // Check if it's a subscription required error
        if (err.response?.status === 403 && err.response?.data?.error === 'Subscription required') {
          setSubscriptionRequired(true);
        } else {
          setError('Failed to load member profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemberProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (subscriptionRequired) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link to="/network">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Network
              </Link>
            </Button>
          </div>
          
          <SubscriptionPrompt 
            title="Subscribe to View Member Profiles"
            description="Get access to view detailed member profiles and connect with our community"
            features={[
              { icon: Users, text: "View member profiles" },
              { icon: Briefcase, text: "Connect with professionals" },
              { icon: Star, text: "Access detailed information" },
              { icon: Lock, text: "Premium network access" }
            ]}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button asChild className="mt-4">
              <Link to="/network">Back to Network</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Member not found.</p>
            <Button asChild className="mt-4">
              <Link to="/network">Back to Network</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/network">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Network
            </Link>
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <img
                  src={member.profile?.photo_url || '/placeholder.svg'}
                  alt={member.full_name}
                  className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
                <span className="absolute bottom-2 right-2 block h-4 w-4 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {member.full_name}
                </h1>
                
                {member.employmentDetails?.[0] && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{member.employmentDetails[0].role}</span>
                    {member.employmentDetails[0].company_name && (
                      <>
                        <span>at</span>
                        <span className="font-medium">{member.employmentDetails[0].company_name}</span>
                      </>
                    )}
                  </div>
                )}
                
                {member.profile?.district && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{member.profile.district}, {member.profile.mandal}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary">Member</Badge>
                  {member.profile?.caste && (
                    <Badge variant="outline">{member.profile.caste}</Badge>
                  )}
                  {member.profile?.subcaste && (
                    <Badge variant="outline">{member.profile.subcaste}</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button>Connect</Button>
                <Button variant="outline">Message</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.profile?.village && (
                <div>
                  <span className="text-sm text-gray-500">Village</span>
                  <p className="font-medium">{member.profile.village}</p>
                </div>
              )}
              {member.profile?.mandal && (
                <div>
                  <span className="text-sm text-gray-500">Mandal</span>
                  <p className="font-medium">{member.profile.mandal}</p>
                </div>
              )}
              {member.profile?.district && (
                <div>
                  <span className="text-sm text-gray-500">District</span>
                  <p className="font-medium">{member.profile.district}</p>
                </div>
              )}
              {member.profile?.native_place && (
                <div>
                  <span className="text-sm text-gray-500">Native Place</span>
                  <p className="font-medium">{member.profile.native_place}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.employmentDetails?.[0] && (
                <>
                  <div>
                    <span className="text-sm text-gray-500">Current Position</span>
                    <p className="font-medium">{member.employmentDetails[0].role}</p>
                  </div>
                  {member.employmentDetails[0].company_name && (
                    <div>
                      <span className="text-sm text-gray-500">Company</span>
                      <p className="font-medium">{member.employmentDetails[0].company_name}</p>
                    </div>
                  )}
                  {member.employmentDetails[0].years_of_experience && (
                    <div>
                      <span className="text-sm text-gray-500">Experience</span>
                      <p className="font-medium">{member.employmentDetails[0].years_of_experience} years</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <p className="font-medium">
                      {member.employmentDetails[0].currently_working ? 'Currently Working' : 'Not Currently Working'}
                    </p>
                  </div>
                </>
              )}
              {member.educationDetails?.[0] && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-gray-500">Education</span>
                    <p className="font-medium">{member.educationDetails[0].degree}</p>
                    {member.educationDetails[0].institution && (
                      <p className="text-sm text-gray-600">{member.educationDetails[0].institution}</p>
                    )}
                    {member.educationDetails[0].year_of_passing && (
                      <p className="text-sm text-gray-600">Year: {member.educationDetails[0].year_of_passing}</p>
                    )}
                    {member.educationDetails[0].grade && (
                      <p className="text-sm text-gray-600">Grade: {member.educationDetails[0].grade}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile; 