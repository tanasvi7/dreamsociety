# Production Deployment Checklist - Admin Setup

## Pre-Deployment
- [ ] Database server is running and accessible
- [ ] Environment variables are configured
- [ ] Database migrations have been run
- [ ] Application is deployed and running

## Admin User Setup (Choose One Method)

### Method 1: Direct Script (Recommended)
```bash
cd backend
npm run create-admin
```

### Method 2: Seeder Script (Alternative)
```bash
cd backend
npm run create-admin-seeder
```

### Method 3: Database Seeder
```bash
cd backend
npm run seed-admin
```

### Method 4: Manual Database Insert
```bash
# First generate the password hash
cd backend
npm run generate-hash

# Then use the generated hash in your SQL script
# See scripts/createAdminUser.sql for the SQL template
```

## Verification Steps
- [ ] Admin user exists in database
- [ ] Can login to admin panel with credentials
- [ ] Admin role permissions are working
- [ ] Can access all admin features

## Default Credentials
- **Email**: `admin@dreamssociety.in`
- **Password**: `DreamSociety2024!`
- **Phone**: `+919876543210`

## Post-Setup Security
- [ ] Change default password immediately
- [ ] Verify admin panel access
- [ ] Test admin functionality
- [ ] Document new credentials securely

## Troubleshooting Commands
```bash
# Check if admin exists
SELECT * FROM users WHERE role = 'admin';

# Check database connection
npm run migrate

# Recreate admin if needed
npm run create-admin
```

## Emergency Access
If admin access is lost:
1. Run: `npm run create-admin`
2. Use new credentials to login
3. Change password immediately
4. Delete old admin account if needed
