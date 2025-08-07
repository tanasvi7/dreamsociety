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
  Award
} from 'lucide-react';

const MemberProfileModal = ({ member, isOpen, onClose }) => {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-0 shadow-2xl">
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
                  src={member.avatar}
                  alt={member.name}
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
                {member.name}
              </h1>
              
              {member.title && member.title !== 'Professional' && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-medium">{member.title}</span>
                  {member.company && (
                    <>
                      <span className="text-gray-400">at</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{member.company}</span>
                    </>
                  )}
                </div>
              )}
              
              {member.district && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <span className="text-lg">{member.district}, {member.mandal}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 text-sm font-medium">
                  Professional Member
                </Badge>
                {member.caste && (
                  <Badge variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 px-4 py-2 text-sm">
                    {member.caste}
                  </Badge>
                )}
                {member.subcaste && (
                  <Badge variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 px-4 py-2 text-sm">
                    {member.subcaste}
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

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      {new Date(member.joinedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                </div>
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
                {member.village && (
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Village</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.village}</p>
                  </div>
                )}
                {member.mandal && (
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mandal</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.mandal}</p>
                  </div>
                )}
                {member.district && (
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">District</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.district}</p>
                  </div>
                )}
                {member.native_place && (
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Native Place</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.native_place}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="bg-gray-50/50 dark:bg-slate-800/50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Professional Info</h3>
              </div>
              <div className="space-y-4">
                {member.title && member.title !== 'Professional' && (
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Position</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.title}</p>
                  </div>
                )}
                {member.company && (
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Company</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.company}</p>
                  </div>
                )}
                {member.yearsOfExperience && (
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.yearsOfExperience} years</p>
                  </div>
                )}
                {member.currentlyWorking !== undefined && (
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.currentlyWorking ? (
                        <span className="text-green-600 dark:text-green-400">Currently Working</span>
                      ) : (
                        <span className="text-orange-600 dark:text-orange-400">Not Currently Working</span>
                      )}
                    </p>
                  </div>
                )}
                {member.education && (
                  <>
                    <Separator className="my-4" />
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Education</p>
                      <p className="font-medium text-gray-900 dark:text-white">{member.education}</p>
                      {member.institution && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{member.institution}</p>
                      )}
                      {member.yearOfPassing && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">Year: {member.yearOfPassing}</p>
                      )}
                      {member.grade && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">Grade: {member.grade}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Stats */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Network Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{member.mutualConnections}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Mutual Connections</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">15+</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Years in Network</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">98%</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Response Rate</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProfileModal; 