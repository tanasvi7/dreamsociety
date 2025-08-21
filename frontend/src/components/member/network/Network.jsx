import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Briefcase, GraduationCap, Building, Eye, UserPlus, Filter, Users, TrendingUp, Lock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { networkService } from '../../../services/networkService';
import MemberProfileModal from './MemberProfileModal';
import { useSubscription } from '../../../hooks/useSubscription';
import useCustomAlert from '../../../hooks/useCustomAlert';
import SubscriptionPrompt from '../../common/SubscriptionPrompt';

const Network = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const { is_subscribed, loading: subscriptionLoading } = useSubscription();
  const { showAlert } = useCustomAlert();
  const [filters, setFilters] = useState({
    district: '',
    experience: '',
    education: '',
    company: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    educationDegrees: [],
    companies: []
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchMembers = async (page = 1, search = '', sort = 'recent', currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await networkService.getMembers(page, 20, search, sort, currentFilters);
      
      setMembers(response.members);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching members:', err);
      
      if (err.response?.status === 401) {
        setError('Please log in again to view members');
      } else if (err.response?.status === 403) {
        // Show subscription prompt instead of error for unsubscribed users
        setShowSubscriptionPrompt(true);
        setError(null);
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to load members. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      setFilterOptionsLoading(true);
      const response = await networkService.getFilterOptions();

      setFilterOptions(response);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    } finally {
      setFilterOptionsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '' && hasSearched) {
        fetchMembers(1, searchTerm, sortBy, filters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, sortBy, hasSearched, filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() || !searchTerm) {
      setHasSearched(true);
      fetchMembers(1, searchTerm, sortBy, filters);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setHasSearched(false);
    setMembers([]);
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    if (hasSearched) {
      fetchMembers(1, searchTerm, value, filters);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    // Always trigger search when filter changes (including when cleared)
    setHasSearched(true);
    // Clear existing members before fetching new ones
    setMembers([]);
    fetchMembers(1, searchTerm, sortBy, newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      district: '',
      experience: '',
      education: '',
      company: ''
    };
    setFilters(clearedFilters);
    // Trigger search when filters are cleared, even if no search term
    setHasSearched(true);
    fetchMembers(1, searchTerm, sortBy, clearedFilters);
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchMembers(pagination.page + 1, searchTerm, sortBy, filters);
    }
  };

  const handleViewProfile = async (member) => {
    if (!is_subscribed) {
      setShowSubscriptionPrompt(true);
      return;
    }

    try {
      setLoading(true);
      // Fetch detailed member information including family details
      const detailedMember = await networkService.getMemberProfile(member.id);
      setSelectedMember(detailedMember);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching member details:', err);
      // Fallback to basic member info if detailed fetch fails
      setSelectedMember(member);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (member) => {
    if (!is_subscribed) {
      setShowSubscriptionPrompt(true);
      return;
    }
    // TODO: Implement connect functionality
    showAlert('Connect feature coming soon!', 'info');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Professional Network
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect with talented professionals and expand your network within our community
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input 
                  placeholder="Search by name, profession, company, location..." 
                  className="pl-10 sm:pl-12 h-11 sm:h-12 text-base sm:text-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={loading}
                />
              </div>
              
              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-12 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recently Added</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline"
                    className="h-11 sm:h-12 px-4 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600" 
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      Filters
                      {Object.values(filters).some(f => f) && (
                        <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          {Object.values(filters).filter(f => f).length}
                        </span>
                      )}
                    </span>
                    <span className="sm:hidden">
                      Filter
                      {Object.values(filters).some(f => f) && (
                        <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded-full">
                          {Object.values(filters).filter(f => f).length}
                        </span>
                      )}
                    </span>
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 sm:flex-none h-11 sm:h-12 px-4 sm:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md" 
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        <span className="hidden sm:inline">Searching...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Search</span>
                        <span className="sm:hidden">Go</span>
                      </>
                    )}
                  </Button>
                  {(searchTerm || Object.values(filters).some(f => f)) && (
                    <Button 
                      variant="outline"
                      className="h-11 sm:h-12 px-3 sm:px-4 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600" 
                      onClick={() => {
                        setSearchTerm('');
                        handleClearFilters();
                        setHasSearched(false);
                        setMembers([]);
                      }}
                      disabled={loading}
                    >
                      <span className="hidden sm:inline">Clear All</span>
                      <span className="sm:hidden">×</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">District</label>
                      <Select value={filters.district} onValueChange={(value) => handleFilterChange('district', value)}>
                        <SelectTrigger className="border-gray-300 bg-gray-50 dark:bg-slate-700">
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptionsLoading ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                            filterOptions.districts.map((district) => (
                              <SelectItem key={district} value={district}>{district}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (Years)</label>
                      <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                        <SelectTrigger className="border-gray-300 bg-gray-50 dark:bg-slate-700">
                          <SelectValue placeholder="Min Experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1+ years</SelectItem>
                          <SelectItem value="3">3+ years</SelectItem>
                          <SelectItem value="5">5+ years</SelectItem>
                          <SelectItem value="10">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Education</label>
                      <Select value={filters.education} onValueChange={(value) => handleFilterChange('education', value)}>
                        <SelectTrigger className="border-gray-300 bg-gray-50 dark:bg-slate-700">
                          <SelectValue placeholder="Select Education" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptionsLoading ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                            filterOptions.educationDegrees.map((degree) => (
                              <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                      <Select value={filters.company} onValueChange={(value) => handleFilterChange('company', value)}>
                        <SelectTrigger className="border-gray-300 bg-gray-50 dark:bg-slate-700">
                          <SelectValue placeholder="Select Company" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptionsLoading ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                            filterOptions.companies.map((company) => (
                              <SelectItem key={company} value={company}>{company}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-red-500 text-sm mt-1">Please try refreshing the page or contact support if the problem persists.</p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Prompt */}
        {showSubscriptionPrompt && (
          <div className="mb-8 relative">
            <button
              onClick={() => setShowSubscriptionPrompt(false)}
              className="absolute top-2 right-2 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SubscriptionPrompt 
              title="Subscribe to View Member Network"
              description="Connect with talented professionals and expand your network within our community. Subscribe to unlock full access to member profiles and networking features."
              features={[
                { icon: Users, text: "View all member profiles" },
                { icon: UserPlus, text: "Connect with professionals" },
                { icon: Eye, text: "Access detailed information" },
                { icon: Lock, text: "Premium networking features" }
              ]}
            />
          </div>
        )}

        {/* Members Grid - Only show if hasSearched is true */}
        {hasSearched && (
          <>
            {/* Subscription Prompt for non-subscribed users */}
            {!is_subscribed && !subscriptionLoading && (
              <div className="mb-8">
                <SubscriptionPrompt 
                  title="Unlock Network Features"
                  description="Subscribe to view member profiles and connect with professionals in our community"
                  features={[
                    { icon: Users, text: "View detailed profiles" },
                    { icon: UserPlus, text: "Connect with members" },
                    { icon: Eye, text: "Access contact information" },
                    { icon: Star, text: "Premium networking" }
                  ]}
                />
              </div>
            )}

            <div 
              key={`members-${JSON.stringify(filters)}-${searchTerm}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 mb-8"
            >
              {members.map((member) => (
                <Card 
                  key={member.id} 
                  className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-5">
                    {/* Profile Header */}
                    <div className="text-center mb-4">
                      <div className="relative inline-block mb-3">
                        <Avatar className="w-16 h-16 sm:w-18 sm:h-18 border-3 border-blue-200 dark:border-blue-800 shadow-md">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
                      </div>
                      
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 truncate">{member.name}</h3>
                      
                      {member.title && member.title !== 'Professional' && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium mb-1 truncate">{member.title}</p>
                      )}
                      
                      {member.company && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{member.company}</p>
                      )}
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-2 mb-4">
                      {member.education && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <GraduationCap className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{member.education}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">{member.location}</span>
                      </div>
                    </div>

                    {/* Experience */}
                    {member.yearsOfExperience && (
                      <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold text-center">{member.yearsOfExperience} years exp.</p>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {member.district && (
                        <Badge variant="outline" className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300 text-xs px-2 py-1">
                          {member.district}
                        </Badge>
                      )}
                    </div>

                    {/* Connections */}
                    <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span>{member.mutualConnections} connections</span>
                    </div>

                                         {/* Action Buttons */}
                     <div className="flex gap-2">
                       {is_subscribed ? (
                         <>
                           <Button 
                             className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleViewProfile(member);
                             }}
                           >
                             <Eye className="h-3 w-3 mr-1" />
                             <span>View</span>
                           </Button>
                           <Button 
                             className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white text-xs font-medium shadow-sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleConnect(member);
                             }}
                           >
                             <UserPlus className="h-3 w-3 mr-1" />
                             <span>Connect</span>
                           </Button>
                         </>
                       ) : (
                         <>
                           <Button 
                             className="flex-1 h-9 bg-gray-400 text-white text-xs font-medium cursor-not-allowed shadow-sm"
                             disabled
                           >
                             <Lock className="h-3 w-3 mr-1" />
                             <span>View</span>
                           </Button>
                           <Button 
                             className="flex-1 h-9 bg-gray-400 text-white text-xs font-medium cursor-not-allowed shadow-sm"
                             disabled
                           >
                             <Lock className="h-3 w-3 mr-1" />
                             <span>Connect</span>
                           </Button>
                         </>
                       )}
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.page < pagination.pages && (
              <div className="text-center">
                <Button 
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Members'
                  )}
                </Button>
              </div>
            )}

            {/* No Results */}
            {members.length === 0 && !loading && !error && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm || Object.values(filters).some(f => f) ? 'No members found for your criteria' : 'No members found'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || Object.values(filters).some(f => f) 
                    ? 'Try adjusting your search terms or filters to find more members.' 
                    : 'Try adjusting your search criteria'}
                </p>
                {(searchTerm || Object.values(filters).some(f => f)) && (
                  <Button 
                    variant="outline"
                    className="mt-4 px-6 py-2 border-gray-300 text-gray-600 hover:bg-gray-50" 
                    onClick={() => {
                      setSearchTerm('');
                      handleClearFilters();
                      setHasSearched(false);
                      setMembers([]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Profile Modal */}
        <MemberProfileModal 
          member={selectedMember}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default Network; 


