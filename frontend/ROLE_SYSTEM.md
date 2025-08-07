# Dream Society - Two-Role System

## Overview

The Dream Society application uses a simplified two-role system:
- **Member**: Regular users with basic access
- **Admin**: Administrators with full system access

## Role Definitions

### Member Role
- **Access**: Basic user features
- **Navigation**: Dashboard, Profile, Jobs, Network, Membership
- **Permissions**: View and manage own profile, apply for jobs, network with others

### Admin Role
- **Access**: Full system administration
- **Navigation**: All member features + Admin panel (User Management, Job Management, Bulk Upload, Reports, Settings)
- **Permissions**: Manage all users, jobs, system settings, and data

## Implementation Details

### Authentication Context (`AuthContext.jsx`)
- Stores user role in localStorage for persistence
- Provides login/logout functionality
- Mock users for development:
  - `admin@example.com` / `admin123` → Admin role
  - `member@example.com` / `member123` → Member role

### Role-Based Access Control (`useRoleAccess.js`)
- Custom hook for easy role checking
- Provides `isAdmin`, `isMember`, `hasRole()`, `hasAnyRole()` utilities
- Used throughout components for conditional rendering

### Protected Routes (`ProtectedRoute.jsx`)
- Wraps routes requiring authentication
- `requireAdmin` prop for admin-only routes
- Redirects unauthorized users appropriately

### Unified Layout (`UnifiedLayout.jsx`)
- Single layout component for both roles
- Dynamic header based on user role
- Role-based navigation menu

### Role-Based Navigation (`RoleBasedNav.jsx`)
- Shows different menu items based on role
- Member: Dashboard, Profile, Jobs, Network, Membership
- Admin: Overview, User Management, Job Management, Bulk Upload, Reports, Settings

### Role-Based Dashboard (`RoleBasedDashboard.jsx`)
- Automatically shows appropriate dashboard based on role
- Admin users see admin dashboard
- Members see regular dashboard

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx          # Route protection
│   ├── common/
│   │   └── RoleBasedNav.jsx            # Role-based navigation
│   ├── dashboard/
│   │   └── RoleBasedDashboard.jsx      # Role-based dashboard
│   ├── layout/
│   │   └── UnifiedLayout.jsx           # Unified layout
│   └── admin/                          # Admin-only components
├── contexts/
│   └── AuthContext.jsx                 # Authentication & role management
├── hooks/
│   └── useRoleAccess.js                # Role access utilities
└── App.tsx                             # Route configuration
```

## Usage Examples

### Checking User Role
```jsx
import { useRoleAccess } from '../hooks/useRoleAccess';

const MyComponent = () => {
  const { isAdmin, isMember, hasRole } = useRoleAccess();
  
  if (isAdmin) {
    return <AdminContent />;
  }
  
  return <MemberContent />;
};
```

### Protected Admin Routes
```jsx
<Route 
  path="/admin/users" 
  element={
    <ProtectedRoute requireAdmin>
      <AdminUserManagement />
    </ProtectedRoute>
  } 
/>
```

### Conditional Rendering
```jsx
const { isAdmin } = useRoleAccess();

return (
  <div>
    {isAdmin && <AdminPanel />}
    <RegularContent />
  </div>
);
```

## Testing

### Login Credentials
- **Admin**: `admin@example.com` / `admin123`
- **Member**: `member@example.com` / `member123`

### Test Scenarios
1. **Member Login**: Should see member dashboard and navigation
2. **Admin Login**: Should see admin dashboard and full navigation
3. **Unauthorized Access**: Should redirect to login
4. **Admin-Only Routes**: Should redirect non-admin users
5. **Role Persistence**: Should maintain role after page refresh

## Security Notes

- All admin routes are protected with `requireAdmin` prop
- Role checks happen on both frontend and backend
- JWT tokens include role information
- localStorage persistence for user sessions
- Automatic logout on token expiration

## Future Enhancements

- Role-based permissions system
- Granular access control
- Audit logging for admin actions
- User role management interface
- Multi-tenant support 