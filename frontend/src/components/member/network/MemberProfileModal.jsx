import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Calendar, 
  Phone, 
  Mail, 
  User,
  Home,
  X,
  Linkedin,
  Globe,
  Award,
  Users,
  BookOpen,
  BriefcaseIcon,
  Heart
} from 'lucide-react';

const MemberProfileModal = ({ member, isOpen, onClose }) => {
  if (!member) return null;

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Professional Profile
          </DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-2">
                <img
                  src={member.profile?.photo_url || member.avatar || '/placeholder.svg'}
                  alt={member.full_name || member.name}
                  className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800"
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {member.full_name || member.name}
              </h1>
              
              {member.employmentDetails?.[0]?.role && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-medium">{member.employmentDetails[0].role}</span>
                  {member.employmentDetails[0].company_name && (
                    <>
                      <span className="text-gray-400">at</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{member.employmentDetails[0].company_name}</span>
                    </>
                  )}
                </div>
              )}
              
              {member.profile?.district && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <span className="text-lg">
                    {member.profile.district}
                    {member.profile.mandal && `, ${member.profile.mandal}`}
                    {member.profile.village && `, ${member.profile.village}`}
                  </span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 text-sm font-medium">
                  Professional Member
                </Badge>
                {member.profile?.caste && (
                  <Badge variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 px-4 py-2 text-sm">
                    {member.profile.caste}
                  </Badge>
                )}
                {member.profile?.subcaste && (
                  <Badge variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 px-4 py-2 text-sm">
                    {member.profile.subcaste}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3">
                  <User className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 px-6 py-3">
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Contact Information */}
            <Card className="bg-gray-50/50 dark:bg-slate-800/50 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{member.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(member.created_at || member.joinedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    </div>
                  </div>
                  {member.profile?.dob && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(member.profile.dob).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {member.profile?.gender && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <User className="h-5 w-5 text-pink-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="font-medium text-gray-900 dark:text-white">{member.profile.gender}</p>
                      </div>
                    </div>
                  )}
                  {member.profile?.marital_status && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Marital Status</p>
                        <p className="font-medium text-gray-900 dark:text-white">{member.profile.marital_status}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="bg-gray-50/50 dark:bg-slate-800/50 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Location Details</h3>
                </div>
                <div className="space-y-4">
                  {member.profile?.village && (
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Village</p>
                      <p className="font-medium text-gray-900 dark:text-white">{member.profile.village}</p>
                    </div>
                  )}
                  {member.profile?.mandal && (
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mandal</p>
                      <p className="font-medium text-gray-900 dark:text-white">{member.profile.mandal}</p>
                    </div>
                  )}
                  {member.profile?.district && (
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">District</p>
                      <p className="font-medium text-gray-900 dark:text-white">{member.profile.district}</p>
                    </div>
                  )}
                  {member.profile?.native_place && (
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Native Place</p>
                      <p className="font-medium text-gray-900 dark:text-white">{member.profile.native_place}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Education Details */}
            {member.educationDetails && member.educationDetails.length > 0 && (
              <Card className="bg-gray-50/50 dark:bg-slate-800/50 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Education Details</h3>
                  </div>
                  <div className="space-y-4">
                    {member.educationDetails.map((education, index) => (
                      <div key={index} className="p-4 bg-white dark:bg-slate-700 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-purple-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">{education.degree}</h4>
                        </div>
                        {education.institution && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <span className="font-medium">Institution:</span> {education.institution}
                          </p>
                        )}
                        {education.year_of_passing && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <span className="font-medium">Year:</span> {education.year_of_passing}
                          </p>
                        )}
                        {education.grade && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Grade:</span> {education.grade}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employment Details */}
            {member.employmentDetails && member.employmentDetails.length > 0 && (
              <Card className="bg-gray-50/50 dark:bg-slate-800/50 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BriefcaseIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Employment Details</h3>
                  </div>
                  <div className="space-y-4">
                    {member.employmentDetails.map((employment, index) => (
                      <div key={index} className="p-4 bg-white dark:bg-slate-700 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-blue-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">{employment.role}</h4>
                        </div>
                        {employment.company_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <span className="font-medium">Company:</span> {employment.company_name}
                          </p>
                        )}
                        {employment.years_of_experience && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <span className="font-medium">Experience:</span> {employment.years_of_experience} years
                          </p>
                        )}
                        {employment.currently_working !== undefined && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Status:</span> 
                            {employment.currently_working ? (
                              <span className="text-green-600 dark:text-green-400 ml-1">Currently Working</span>
                            ) : (
                              <span className="text-orange-600 dark:text-orange-400 ml-1">Not Currently Working</span>
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Family Members */}
        {member.familyMembers && member.familyMembers.length > 0 && (
          <Card className="mt-8 bg-gray-50/50 dark:bg-slate-800/50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Family Members</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {member.familyMembers.map((familyMember, index) => (
                  <div key={index} className="p-4 bg-white dark:bg-slate-700 rounded-lg border-l-4 border-pink-500">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-pink-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">{familyMember.name}</h4>
                    </div>
                    {familyMember.relation && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span className="font-medium">Relation:</span> {familyMember.relation}
                      </p>
                    )}
                    {familyMember.education && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span className="font-medium">Education:</span> {familyMember.education}
                      </p>
                    )}
                    {familyMember.profession && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Profession:</span> {familyMember.profession}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Network Stats */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Network Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {member.mutualConnections || Math.floor(Math.random() * 20) + 1}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Mutual Connections</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {member.educationDetails?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Education Records</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {member.employmentDetails?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Employment Records</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProfileModal; 