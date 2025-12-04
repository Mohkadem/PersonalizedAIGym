# AI Gym Trainer - Setup Guide

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (v6 or higher)
- **Git**

## Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd your-gym-ai
```

### 2. Install Dependencies

**IMPORTANT**: This project has a monorepo structure with separate frontend and backend dependencies.

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ..  # Go back to root directory (where src/ folder is located)
npm install
```

**Note**: 
- Frontend dependencies are installed at the **root** directory (where `src/` folder is)
- Backend dependencies are installed in the `backend/` directory
- Do NOT run `npm install` in the `src/` directory (it doesn't have a package.json)
- The `client/` directory is a build artifact and should be ignored

### 3. Environment Setup

#### Create Backend Environment File
```bash
cd backend
cp .env.example .env
```

#### Edit the `.env` file with your configuration:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gym-ai

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10000

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

### 4. Database Setup

#### Start MongoDB
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services or run mongod.exe
```

#### Seed Database with Sample Data (Optional)
```bash
cd backend
node scripts/seedDatabase.js
```

This will create sample accounts:
- **Admin**: admin@example.com / admin123
- **User**: demo@example.com / password123  
- **Coach**: coach@example.com / password123

### 5. Start the Application

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend Server
```bash
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:8080 (or 8081/8082 if 8080 is busy)
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/v1/health

## Common Issues & Solutions

### Port Already in Use
If you get "EADDRINUSE" errors:
```bash
# Kill processes using the ports
lsof -ti:3001 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

### MongoDB Connection Issues
- Ensure MongoDB is running: `brew services list | grep mongodb`
- Check MongoDB logs: `tail -f /usr/local/var/log/mongodb/mongo.log`
- Try connecting manually: `mongosh gym-ai`

### Environment Variables Not Loading
- Ensure `.env` file is in the `backend` directory
- Check file permissions
- Restart the backend server after creating `.env`

### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Making Changes
1. Backend changes auto-reload with nodemon
2. Frontend changes auto-reload with Vite
3. Both servers watch for file changes

### Testing the API
```bash
# Test registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test health endpoint
curl http://localhost:3001/api/v1/health
```

## Production Deployment

### Environment Variables for Production
- Change all JWT secrets to strong, random strings
- Set `NODE_ENV=production`
- Use a production MongoDB URI
- Set appropriate rate limits
- Configure proper CORS origins

### Build for Production
```bash
# Frontend
npm run build

# Backend (if using PM2 or similar)
npm start
```

## Project Structure

```
your-gym-ai/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── src/                   # React frontend
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── main.tsx           # App entry point
└── package.json           # Frontend dependencies
```

## Support

If you encounter issues:
1. Check the server logs in the terminal
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check that all dependencies are installed
5. Try restarting both servers
