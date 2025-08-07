import React from 'react';
import { useRoleAccess } from '../../../hooks/useRoleAccess';
import Dashboard from './Dashboard';
import AdminDashboard from '../../admin/AdminDashboard';

const RoleBasedDashboard = () => {
  const { isAdmin } = useRoleAccess();

  // Show admin dashboard for admin users, regular dashboard for members
  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <Dashboard />;
};

export default RoleBasedDashboard; 