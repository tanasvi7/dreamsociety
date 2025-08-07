# Dream Society - Professional Network Platform

## Project Overview

Dream Society is a comprehensive professional networking platform designed to connect professionals, facilitate career development, and provide job opportunities within a supportive community environment.

## Features

- **User Authentication & Profiles**: Secure login system with comprehensive user profiles
- **Professional Networking**: Connect with other professionals in your field
- **Job Portal**: Browse and apply for job opportunities
- **Member Dashboard**: Personalized dashboard with analytics and insights
- **Admin Panel**: Comprehensive admin interface for platform management
- **Payment Integration**: Membership plans and payment processing
- **Mobile Responsive**: Optimized for all device sizes

## Technology Stack

This project is built with:

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - Object-Relational Mapping (ORM)
- **MySQL** - Database management system
- **JWT** - Authentication and authorization
- **AWS S3** - File storage for profile photos

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MySQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dream
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database and AWS credentials
   
   # Frontend environment variables
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your API endpoints
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. **Start Development Servers**
   ```bash
   # Start backend server (from backend directory)
   npm run dev
   
   # Start frontend server (from frontend directory)
   npm run dev
   ```

## Project Structure

```
dream/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── backend/                # Node.js backend application
    ├── controllers/        # Route controllers
    ├── models/            # Database models
    ├── routes/            # API routes
    ├── middlewares/       # Custom middlewares
    └── services/          # Business logic services
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Run database seeders

## Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Backend Deployment
The backend can be deployed to:
- Heroku
- AWS EC2
- DigitalOcean
- Railway

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
