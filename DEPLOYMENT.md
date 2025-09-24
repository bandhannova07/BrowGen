# BrowGen Production Deployment Guide

## 🚀 Render Deployment (Infrastructure as Code)

### Prerequisites
1. Push your code to GitHub repository
2. Have a Render account

### Deployment Steps

#### 1. Deploy via Render Blueprint
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Blueprint**
3. Connect your GitHub repository containing this project
4. Render will automatically detect `render.yaml` and provision:
   - PostgreSQL database (`browgen-database`)
   - Backend web service (`browgen-backend`)
   - Frontend web service (`browgen-frontend`)

#### 2. Environment Variables (Auto-configured)
The following are automatically set via `render.yaml`:
- ✅ `DATABASE_URL` - Auto-linked from PostgreSQL service
- ✅ `JWT_SECRET` - Auto-generated secure value
- ✅ `CORS_ORIGIN` - Auto-linked to frontend URL
- ✅ `NEXT_PUBLIC_API_URL` - Auto-linked to backend URL
- ✅ `NODE_ENV=production` - Set for both services
- ✅ `PORT` - Set to 10000 for both services

#### 3. Manual Environment Variables (Optional)
If you need to override any values, set these in Render Dashboard:

**Backend Service (`browgen-backend`):**
- `JWT_SECRET` - Override if you want a specific value
- `CORS_ORIGIN` - Add additional domains if needed

**Frontend Service (`browgen-frontend`):**
- No manual variables needed (all auto-configured)

### 🔄 Automatic Features

#### Database Migrations & Seeding
- ✅ Migrations run automatically on each backend deploy
- ✅ Sample data seeded on first deployment
- ✅ Health checks configured for backend (`/api/health`)

#### Auto-Deploy
- ✅ Both services redeploy on git push to main branch
- ✅ Frontend automatically gets updated backend URL
- ✅ CORS automatically configured between services

### 📋 Post-Deployment Checklist

1. **Verify Services Started**
   - Check backend health: `https://browgen-backend.onrender.com/api/health`
   - Check frontend loads: `https://browgen-frontend.onrender.com`

2. **Test API Endpoints**
   ```bash
   # Replace with your actual backend URL
   BACKEND_URL="https://browgen-backend.onrender.com"
   
   # Health check
   curl "$BACKEND_URL/api/health"
   
   # Test courses
   curl "$BACKEND_URL/api/courses"
   
   # Test signup
   curl -X POST "$BACKEND_URL/api/auth/signup" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"secret123"}'
   ```

3. **Test Frontend Features**
   - Home page loads with testimonials
   - Learning Hub shows courses
   - Login/Signup flow works
   - Dashboard shows after login

### 🛠 Troubleshooting

#### Backend Issues
- Check build logs for migration errors
- Verify DATABASE_URL is properly set
- Check CORS_ORIGIN includes frontend domain

#### Frontend Issues
- ✅ **Path Resolution Fixed**: TypeScript `@/*` imports now work in production
- Verify NEXT_PUBLIC_API_URL points to backend
- Check browser console for API connection errors
- Ensure backend is running and accessible

#### Database Issues
- Migrations run during backend build
- Check backend logs for database connection errors
- Verify PostgreSQL service is running

#### Common Build Errors
- **Module not found `@/lib/api`**: Fixed with updated `tsconfig.json` and `next.config.mjs`
- **Path mapping issues**: Resolved with proper webpack alias configuration
- **TypeScript packages missing**: Fixed by moving TypeScript dependencies to `dependencies` (not `devDependencies`)

### 🔧 Manual Commands (if needed)

If you need to run migrations manually:
1. Go to backend service shell in Render
2. Run: `npm run migrate`
3. Run: `npm run seed` (if needed)

### 📊 Service URLs
After deployment, you'll get:
- **Frontend**: `https://browgen-frontend.onrender.com`
- **Backend**: `https://browgen-backend.onrender.com`
- **Database**: Internal connection (not publicly accessible)

### 🔒 Security Notes
- JWT secrets are auto-generated and secure
- Database is only accessible from backend service
- CORS is configured to only allow frontend domain
- All connections use HTTPS in production
