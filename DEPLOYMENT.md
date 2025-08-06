# 🚀 Yegna Bingo Deployment Guide

## Railway Deployment (Free 30 days)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Get free $5 credit (30 days)

### Step 2: Deploy Backend
1. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select this repository

2. **Configure Environment Variables**
   ```
   NODE_ENV=production
   BOT_TOKEN=8019641171:AAGs1hQJybtuEHpUjaE47Tp5DYYGksDF6Sg
   WEB_UI_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy**
   - Railway will automatically detect Node.js
   - Build and deploy the backend

### Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set build settings:
   - Framework: Vite
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install`

4. **Environment Variables**
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```

### Step 4: Update Bot Configuration
1. Get your Railway backend URL
2. Get your Vercel frontend URL
3. Update bot config with production URLs

### Step 5: Test Deployment
1. Test bot commands
2. Verify Web UI opens in Telegram
3. Test multiplayer functionality

## Alternative: Render Deployment
- Also free for 30 days
- Similar process to Railway
- Good for static sites and APIs

## Cost After 30 Days
- Railway: ~$5-10/month
- Vercel: Free tier available
- Total: ~$5-10/month for full deployment

## Local Testing
```bash
# Start all services
npm run dev

# Or individually
cd backend && npm start
cd frontend && npm run dev
cd bot && node bot.js
``` 