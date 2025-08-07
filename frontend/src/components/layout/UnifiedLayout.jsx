import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import RoleBasedNav from '../common/RoleBasedNav';
import { 
  Shield,
  User,
  LogOut
} from 'lucide-react';

const UnifiedLayout = () => {
  const { logout } = useAuth();
  const { isAdmin } = useRoleAccess();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHeaderTitle = () => {
    if (isAdmin) {
      return 'Admin Panel';
    }
    return 'Dream Society';
  };

  const getHeaderIcon = () => {
    if (isAdmin) {
      return <Shield className="w-8 h-8 text-blue-600" />;
    }
    return <User className="w-8 h-8 text-green-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 flex flex-col">
        <div className="p-4 flex items-center space-x-3 border-b dark:border-gray-700">
          {getHeaderIcon()}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {getHeaderTitle()}
          </h1>
        </div>
        
        <RoleBasedNav onLogout={handleLogout} />
        
        {/* Logout Button */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UnifiedLayout; 