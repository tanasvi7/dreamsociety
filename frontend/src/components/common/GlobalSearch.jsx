import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Briefcase, Building, Filter, Loader2, Lock, LogIn, User } from 'lucide-react';
import { searchService } from '@/services/searchService';
import { storeSearchContext } from '@/utils/redirectUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

const GlobalSearch = ({ 
  isOpen, 
  onClose, 
  className = "",
  showQuickActions = true,
  maxResults = 20 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { is_subscribed, loading: subscriptionLoading } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Load popular searches when component mounts
  useEffect(() => {
    if (isOpen && popularSearches.length === 0) {
      searchService.getPopularSearches().then(setPopularSearches);
    }
  }, [isOpen, popularSearches.length]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      // Test backend connection first
      const isConnected = await searchService.testBackendConnection();
      
      if (!isConnected) {
        console.error('🔍 GlobalSearch: Backend not accessible');
        setSearchResults([]);
        return;
      }
      
      // Call the appropriate backend API based on authentication status
      let results;
      if (user) {
        // Authenticated users use the regular global search
        results = await searchService.globalSearch({
          query: searchTerm,
          limit: maxResults
        });
      } else {
        // Unauthenticated users use the public global search
        results = await searchService.publicGlobalSearch({
          query: searchTerm,
          limit: maxResults
        });
      }

      // Show all results but mark subscription-required ones
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debug function to test backend endpoints
  const handleDebugBackend = async () => {
    console.log('🔍 Debug: Testing backend endpoints...');
    const endpoints = await searchService.getAvailableEndpoints();
    console.log('🔍 Debug: Available endpoints:', endpoints);
    
    // Test specific search for "react js developer"
    console.log('🔍 Debug: Testing search for "react js developer"...');
    const jobResults = await searchService.searchJobs('react js developer', 10);
    console.log('🔍 Debug: Job search results for "react js developer":', jobResults);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  const handleResultClick = (result) => {
    // Check if the result requires authentication and user is not logged in
    if ((result.type === 'job' || result.type === 'member') && !user) {
      setSelectedResult(result);
      setShowLoginPrompt(true);
      return;
    }

    // Check if user is subscribed for job and member results
    if ((result.type === 'job' || result.type === 'member') && !subscriptionLoading && !is_subscribed) {
      setSelectedResult(result);
      setShowLoginPrompt(true);
      return;
    }

    // Only allow navigation for authenticated and subscribed users or non-protected content
    if (result.type === 'job' || result.type === 'member') {
      // Double-check subscription status before allowing navigation
      if (!user || !is_subscribed) {
        setSelectedResult(result);
        setShowLoginPrompt(true);
        return;
      }
    }

    // Handle navigation for authenticated and subscribed users or non-protected content
    switch (result.type) {
      case 'job':
        navigate(`/jobs/${result.id}`);
        break;
      case 'member':
        navigate(`/network/${result.id}`);
        break;
      case 'company':
        navigate(`/company/${result.id}`);
        break;
      case 'resource':
        navigate(`/resources/${result.id}`);
        break;
      default:
        break;
    }
    handleClearSearch();
  };

  const handleQuickSearch = (term) => {
    setSearchTerm(term);
    // Don't automatically search - user must click search button
  };

  const handleLoginRedirect = () => {
    // Store search context for redirect after login
    storeSearchContext(searchTerm, selectedResult);
    
    setShowLoginPrompt(false);
    setSelectedResult(null);
    onClose();
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    // Store search context for redirect after registration
    storeSearchContext(searchTerm, selectedResult);
    
    setShowLoginPrompt(false);
    setSelectedResult(null);
    onClose();
    navigate('/register');
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
    setSelectedResult(null);
  };



  if (!isOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 ${className}`}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden">
          {/* Search Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Global Search</h3>
            <button
              onClick={handleClearSearch}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                           <input
                type="text"
                placeholder="Search by job title, member name, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSearching || !searchTerm.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </form>
            
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="p-4 space-y-2">
                                 {searchResults.map((result, index) => {
                   const isProtected = (result.type === 'job' || result.type === 'member') && (!user || (user && !subscriptionLoading && !is_subscribed));
                   const requiresSubscription = result.requiresSubscription || ((result.type === 'job' || result.type === 'member') && !subscriptionLoading && !is_subscribed);
                   
                   return (
                     <button
                       key={`${result.type}-${result.id}-${index}`}
                       onClick={() => handleResultClick(result)}
                       className={`w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left flex items-center gap-3 relative group`}
                     >
                       <div className="flex-shrink-0">
                         {result.type === 'job' && <Briefcase className="w-5 h-5 text-green-500" />}
                         {result.type === 'member' && <User className="w-5 h-5 text-blue-500" />}
                         {result.type === 'company' && <Building className="w-5 h-5 text-purple-500" />}
                         {result.type === 'resource' && <Filter className="w-5 h-5 text-orange-500" />}
                       </div>
                     
                       <div className={`flex-1 min-w-0 ${isProtected ? 'filter blur-[1px]' : ''}`}>
                         <div className="font-medium text-gray-900 truncate">
                           {result.name || result.title}
                         </div>
                         <div className="text-sm text-gray-500 truncate">
                           {result.type === 'member' && result.email && `${result.email}`}
                           {result.type === 'job' && result.company && `${result.company}`}
                           {result.location && ` • ${result.location}`}
                           {result.description && ` • ${result.description}`}
                           {result.category && ` • ${result.category}`}
                         </div>
                       </div>
                       
                       {/* Subscription indicator for restricted content */}
                       {requiresSubscription && (
                         <div className="flex-shrink-0 flex items-center gap-2">
                           <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
                             <Lock className="w-3 h-3 text-orange-600" />
                             <span className="text-xs text-orange-600 font-medium">
                               {!user ? 'Login' : 'Subscribe'}
                             </span>
                           </div>
                         </div>
                       )}
                     </button>
                   );
                 })}
              </div>
                                     ) : !searchTerm ? (
              <div className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Search for jobs, members, and companies</p>
                <p className="text-sm text-gray-400 mt-2">
                  Type a job title, member name, or company to get started
                </p>
                {!user && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Login to access detailed job and member information
                    </p>
                  </div>
                )}
                {user && !subscriptionLoading && !is_subscribed && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Subscribe to access detailed job and member information
                    </p>
                  </div>
                )}
              </div>

                                     ) : searchTerm && hasSearched && !isSearching && searchResults.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No results found for "{searchTerm}"</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try searching by job title, member name, or company
                </p>
                {!user && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Login to access detailed job and member information
                    </p>
                  </div>
                )}
                {user && !subscriptionLoading && !is_subscribed && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Subscribe to access detailed job and member information
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Quick Actions */}
          {showQuickActions && popularSearches.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Popular searches:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.slice(0, 4).map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleQuickSearch(search)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      index === 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                      index === 1 ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                      index === 2 ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                      'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {search}
                  </button>
                ))}
              </div>
              {!user && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    💡 Login to access detailed job and member information
                  </p>
                </div>
              )}
              {user && !subscriptionLoading && !is_subscribed && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    💡 Subscribe to access detailed job and member information
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

            {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center pt-24 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden mt-8">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogIn className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Login Required</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                {selectedResult ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      {selectedResult.type === 'job' && <Briefcase className="w-5 h-5 text-green-500" />}
                      {selectedResult.type === 'member' && <User className="w-5 h-5 text-blue-500" />}
                      <span className="font-medium text-gray-900">
                        {selectedResult.name || selectedResult.title}
                      </span>
                    </div>
                                         <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                       <p className="mb-2">
                         {selectedResult.type === 'job' 
                           ? 'This job posting contains detailed information about requirements, benefits, and application process.'
                           : 'This member profile contains detailed information about their background and experience.'
                         }
                       </p>
                       <p className="text-gray-500">
                         {!user 
                           ? 'Sign in to your account to view the complete details and take action.'
                           : 'Subscribe to your account to view the complete details and take action.'
                         }
                       </p>
                     </div>
                  </>
                                 ) : (
                   <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                     <p className="mb-2">
                       {!user 
                         ? 'You need to be logged in to access detailed job and member information.'
                         : 'You need to subscribe to access detailed job and member information.'
                       }
                     </p>
                     <p className="text-gray-500">
                       {!user
                         ? 'Sign in to your account to view full job descriptions and member profiles.'
                         : 'Subscribe to your account to view full job descriptions and member profiles.'
                       }
                     </p>
                   </div>
                 )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {!user ? (
                  <>
                    <button
                      onClick={handleLoginRedirect}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Sign In to Search
                    </button>
                    <button
                      onClick={handleRegisterRedirect}
                      className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
                    >
                      Create New Account
                    </button>
                  </>
                ) : !subscriptionLoading && !is_subscribed ? (
                  <>
                    <button
                      onClick={() => {
                        closeLoginPrompt();
                        navigate('/membership');
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Subscribe Now
                    </button>
                    <button
                      onClick={closeLoginPrompt}
                      className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
                    >
                      Continue with Limited Search
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLoginRedirect}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Sign In to Search
                    </button>
                    <button
                      onClick={handleRegisterRedirect}
                      className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
                    >
                      Create New Account
                    </button>
                  </>
                )}
                <button
                  onClick={closeLoginPrompt}
                  className="w-full text-gray-500 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch; 