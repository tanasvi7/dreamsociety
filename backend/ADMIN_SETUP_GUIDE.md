# Admin User Setup Guide for Production

This guide explains how to set up the initial admin user for the Dream Society application in production.

## Option 1: Using Database Seeder (Recommended)

### Step 1: Run the Production Admin Seeder
```bash
cd backend
npx sequelize-cli db:seed --seed 002-production-admin.js
```

### Step 2: Verify Admin User Creation
The seeder will create an admin user with the following credentials:
- **Email**: `admin@dreamssociety.in`
- **Password**: `DreamSociety2024!`
- **Phone**: `+919876543210`
- **Role**: `admin`
- **Status**: `verified`

## Option 2: Using Manual Script

### Step 1: Run the Admin Creation Script
```bash
cd backend
node scripts/createAdminUser.js
```

### Step 2: Check Output
The script will show:
- ✅ Success message if admin is created
- ❌ Error if admin already exists
- 📧 Email and password credentials

## Option 3: Manual Database Insert

If you prefer to manually insert the admin user:

```sql
INSERT INTO users (
  full_name, 
  email, 
  phone, 
  password_hash, 
  role, 
  is_verified, 
  created_at, 
  updated_at
) VALUES (
  'Dream Society Admin',
  'admin@dreamssociety.in',
  '+919876543210',
  '$2a$12$YOUR_HASHED_PASSWORD_HERE',
  'admin',
  true,
  NOW(),
  NOW()
);
```

**Note**: You'll need to generate the password hash using bcrypt with salt rounds of 12.

## Security Recommendations

### 1. Change Default Password Immediately
After first login, change the password through the admin panel.

### 2. Use Strong Password
The default password `DreamSociety2024!` is secure but should be changed to something unique.

### 3. Enable Two-Factor Authentication
Consider implementing 2FA for admin accounts in future updates.

### 4. Monitor Admin Access
Set up logging to monitor admin login attempts and actions.

## Troubleshooting

### Admin User Already Exists
If you get an error that the admin user already exists:
1. Check the database: `SELECT * FROM users WHERE role = 'admin';`
2. Use existing credentials or reset the password

### Database Connection Issues
1. Verify database configuration in `config/config.js`
2. Check database server is running
3. Ensure proper permissions

### Seeder Not Working
1. Check if Sequelize CLI is installed: `npm install -g sequelize-cli`
2. Verify database migrations have been run
3. Check for syntax errors in seeder files

## Default Credentials Summary

| Field | Value |
|-------|-------|
| Email | `admin@dreamssociety.in` |
| Password | `DreamSociety2024!` |
| Phone | `+919876543210` |
| Role | `admin` |
| Verified | `true` |

## Next Steps After Setup

1. **Login to Admin Panel**: Use the credentials above
2. **Change Password**: Update to a secure, unique password
3. **Configure Settings**: Set up application-wide settings
4. **Create Additional Admins**: If needed for team management
5. **Set Up Monitoring**: Configure admin activity logging

## Emergency Access

If you lose admin access, you can:
1. Use the script: `node scripts/createAdminUser.js`
2. Manually insert a new admin user in the database
3. Reset the password hash for existing admin user

**Remember**: Always keep admin credentials secure and change default passwords immediately after setup.
