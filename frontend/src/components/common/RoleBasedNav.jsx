import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Upload, 
  Shield,
  User,
  Network,
  CreditCard,
  LogOut
} from 'lucide-react';

const RoleBasedNav = ({ onLogout }) => {
  const { isAdmin } = useRoleAccess();

  // Member navigation items
  const memberNavItems = [
    { to: '/dashboard', name: 'Dashboard', icon: BarChart3 },
    { to: '/profile', name: 'Profile', icon: User },
    { to: '/jobs', name: 'Jobs', icon: Briefcase },
    { to: '/network', name: 'Network', icon: Network },
    { to: '/membership', name: 'Subscription', icon: CreditCard },
  ];

  // Admin navigation items
  const adminNavItems = [
    { to: '/dashboard', name: 'Overview', icon: BarChart3 },
    { to: '/admin/users', name: 'User Management', icon: Users },
    { to: '/admin/jobs', name: 'Job Management', icon: Briefcase },
    { to: '/admin/bulk-upload', name: 'Bulk Upload', icon: Upload },
  ];

  const navItems = isAdmin ? adminNavItems : memberNavItems;

  return (
    <nav className="p-4 flex-1">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default RoleBasedNav; 