# DREAM SOCIETY API

A full-featured, production-ready Node.js REST API for the DREAM SOCIETY platform built with Express.js, MySQL, and Sequelize ORM.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (member, admin, moderator)
- **User Management**: Complete user CRUD operations with profile management
- **Family Members**: Manage family member information
- **Education & Employment**: Track education and employment details
- **Skills & Endorsements**: Skill management with endorsement system
- **Jobs & Applications**: Job posting and application system
- **Payments**: Payment processing and management
- **Admin Features**: 
  - User management and role changes
  - Data export (CSV/JSON)
  - Admin logs and audit trails
  - Bulk data upload with field mapping
  - User impersonation for support
- **Security**: Input validation, error handling, CORS, logging
- **Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Logging**: Morgan

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dreamsociety_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=dreamsociety
   DB_USER=your_username
   DB_PASS=your_password
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   ```

4. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE dreamsociety;"
   
   # Run migrations
   npx sequelize-cli db:migrate
   
   # Run seeders (optional - creates default users)
   npx sequelize-cli db:seed:all
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## Default Users

After running seeders, you'll have these default users:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| moderator@example.com | moderator123 | Moderator |
| member@example.com | member123 | Member |

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - Verify OTP
- `GET /auth/token-info` - Get token information

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Profiles
- `GET /profiles/:id` - Get profile by ID
- `PUT /profiles/:id` - Update profile

### Family Members
- `POST /family` - Add family member
- `GET /family` - List family members
- `GET /family/:id` - Get family member
- `PUT /family/:id` - Update family member
- `DELETE /family/:id` - Delete family member

### Education
- `POST /education` - Add education detail
- `GET /education` - List education details
- `GET /education/:id` - Get education detail
- `PUT /education/:id` - Update education detail
- `DELETE /education/:id` - Delete education detail

### Employment
- `POST /employment` - Add employment detail
- `GET /employment` - List employment details
- `GET /employment/:id` - Get employment detail
- `PUT /employment/:id` - Update employment detail
- `DELETE /employment/:id` - Delete employment detail

### Skills
- `POST /skills` - Add skill
- `GET /skills` - List skills
- `GET /skills/:id` - Get skill
- `PUT /skills/:id` - Update skill
- `DELETE /skills/:id` - Delete skill
- `POST /skills/:id/endorse` - Endorse skill

### Jobs
- `POST /jobs` - Create job posting
- `GET /jobs` - List jobs
- `GET /jobs/:id` - Get job details
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job
- `POST /jobs/:id/apply` - Apply for job

### Payments
- `POST /payments` - Create payment
- `GET /payments` - List payments
- `GET /payments/:id` - Get payment details

### Admin Features

#### User Management
- `GET /admin/users` - List all users
- `POST /admin/users` - Create user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `POST /admin/users/:id/reset-password` - Reset password
- `POST /admin/users/:id/change-role` - Change user role

#### Data Export
- `GET /admin/export/users` - Export users (CSV/JSON)
- `GET /admin/export/payments` - Export payments (CSV/JSON)
- `GET /admin/export/logs` - Export admin logs (CSV/JSON)

#### Bulk Upload
- `POST /admin/bulk-upload/users` - Bulk upload users
- `POST /admin/bulk-upload/family` - Bulk upload family members
- `POST /admin/bulk-upload/education` - Bulk upload education
- `POST /admin/bulk-upload/employment` - Bulk upload employment
- `POST /admin/bulk-upload/skills` - Bulk upload skills
- `POST /admin/bulk-upload/jobs` - Bulk upload jobs

#### Impersonation
- `POST /admin/impersonate` - Impersonate user (Admin only)

#### Logs
- `GET /admin/logs` - List admin logs

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access Control

- **Member**: Basic user operations
- **Moderator**: Member permissions + content moderation
- **Admin**: Full system access + user management + impersonation

## Error Handling

The API uses standard HTTP status codes and returns errors in JSON format:

```json
{
  "error": "Error message"
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Database Migrations
```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo
```

### Database Seeders
```bash
# Run all seeders
npx sequelize-cli db:seed:all

# Undo last seeder
npx sequelize-cli db:seed:undo
```

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a production database
3. Set strong JWT secret
4. Configure proper CORS settings
5. Set up SSL/TLS
6. Use PM2 or similar process manager
7. Set up monitoring and logging

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens have expiration
- Input validation on all endpoints
- Role-based access control
- Admin actions are logged
- CORS protection
- SQL injection protection via Sequelize

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
