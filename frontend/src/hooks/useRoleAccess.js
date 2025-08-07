import { useAuth } from '../contexts/AuthContext';

export const useRoleAccess = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';
  const isAuthenticated = !!user;

  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);

  return {
    user,
    isAdmin,
    isMember,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    role: user?.role
  };
}; 