import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import ProfileImage from './ProfileImage';
import GlobalSearch from './GlobalSearch';
import { 
  Search, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Briefcase,
  Users,
  CreditCard
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { photoUrl, loading } = useProfilePhoto();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: null },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Network', href: '/network', icon: Users },
    { name: 'Profile', href: '/profile', icon: User }
  ];

  // Helper function to get link classes
  const getLinkClasses = (isActive) => {
    return `relative px-4 py-2 rounded-md text-sm font-medium transition-colors group ${
      isActive 
        ? 'text-indigo-600 bg-indigo-50' 
        : 'text-gray-600 hover:text-indigo-600'
    }`;
  };

  // Helper function to get mobile link classes
  const getMobileLinkClasses = (isActive) => {
    return `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
    }`;
  };

  // Helper function to get dropdown link classes
  const getDropdownLinkClasses = (isActive) => {
    return `flex items-center px-4 py-2.5 text-sm transition-colors ${
      isActive 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
    }`;
  };

  return (
    <>
      <GlobalSearch 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center px-3 py-2 shadow-md group-hover:shadow-lg transition-all">
                <span className="text-white font-bold text-sm tracking-wider">DREAMS</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                UNITY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => getLinkClasses(isActive)}
                  end={item.href === '/dashboard'}
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 transition-all duration-300 ${
                        isActive ? 'w-3/4 bg-indigo-600' : 'w-0 bg-indigo-600 group-hover:w-3/4'
                      }`}></span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2">
              {/* Global Search */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Global Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <ProfileImage
                    photoUrl={photoUrl}
                    size="sm"
                    loading={loading}
                    alt={user?.full_name || user?.name || 'Profile'}
                    className="ring-2 ring-indigo-100"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.full_name || user?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <NavLink
                      to="/profile"
                      className={({ isActive }) => getDropdownLinkClasses(isActive)}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      View Profile
                    </NavLink>
                    <NavLink
                      to="/membership"
                      className={({ isActive }) => getDropdownLinkClasses(isActive)}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <CreditCard className="h-4 w-4 mr-3 text-gray-500" />
                      Subscription
                    </NavLink>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Search on Mobile */}
                <div className="px-2 py-1">
                  <button
                    onClick={() => {
                      setSearchOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full relative"
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-sm"
                      placeholder="Search..."
                      readOnly
                    />
                  </button>
                </div>
                
                {/* Navigation Items */}
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => getMobileLinkClasses(isActive)}
                    onClick={() => setIsMenuOpen(false)}
                    end={item.href === '/dashboard'}
                  >
                    {item.icon && <item.icon className="h-4 w-4 mr-3 text-gray-400" />}
                    {item.name}
                  </NavLink>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;