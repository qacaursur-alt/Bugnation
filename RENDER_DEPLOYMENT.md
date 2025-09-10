# Render.com Deployment Guide

## 🚀 Complete Step-by-Step Guide

### Step 1: Sign Up for Render

1. **Go to**: https://render.com
2. **Click "Get Started for Free"**
3. **Sign up with your GitHub account**
4. **Verify your email address**

### Step 2: Connect Your Repository

1. **In Render Dashboard**, click **"New +"**
2. **Select "Web Service"**
3. **Connect your GitHub account** (if not already connected)
4. **Select your repository**: `qacaursur-alt/Bugnation`
5. **Click "Connect"**

### Step 3: Configure Your Service

Fill in these settings:

#### **Basic Settings**
- **Name**: `bugnation-api` (or any name you prefer)
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (or closest to your users)
- **Branch**: `main`
- **Root Directory**: Leave empty (uses root)

#### **Build & Deploy**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

#### **Environment Variables**
Click **"Add Environment Variable"** and add these one by one:

```
NODE_ENV = production
DATABASE_URL = postgresql://postgres:Abhihere12@@db.yyuncxmoocpojlgkhfqf.supabase.co:5432/postgres
SUPABASE_URL = https://yyuncxmoocpojlgkhfqf.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dW5jeG1vb2Nwb2psZ2toZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDMxOTcsImV4cCI6MjA3MzA3OTE5N30._PvwUP4EfAnFo0JYXBewuCwudyGDnlnBxt5WKnTGXfY
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dW5jeG1vb2Nwb2psZ2toZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDMxOTcsImV4cCI6MjA3MzA3OTE5N30._PvwUP4EfAnFo0JYXBewuCwudyGDnlnBxt5WKnTGXfY
SESSION_SECRET = your_production_session_secret_change_this_to_something_random
CORS_ORIGIN = https://your-app-name.onrender.com
```

### Step 4: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Check the logs** for any errors
4. **Your API will be available at**: `https://your-app-name.onrender.com`

### Step 5: Test Your API

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-app-name.onrender.com/api/health

# Test user creation
curl -X POST https://your-app-name.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
```

### Step 6: Update Frontend for Production

After your API is deployed, update the frontend to use the production API:

1. **Note your API URL** from Render (e.g., `https://bugnation-api.onrender.com`)
2. **Update the API configuration** in your frontend
3. **Redeploy the frontend** to GitHub Pages

### Step 7: Deploy Frontend to GitHub Pages

1. **Go to**: https://github.com/qacaursur-alt/Bugnation/settings/pages
2. **Enable GitHub Pages** with source "GitHub Actions"
3. **Add secrets** in GitHub repository settings
4. **Update API URL** in the workflow file
5. **Push changes** to trigger deployment

## 🔧 Troubleshooting

### Common Issues:

#### **Build Fails**
- Check if all dependencies are in `package.json`
- Verify Node.js version (should be 18+)
- Check build logs in Render dashboard

#### **API Not Responding**
- Check environment variables are set correctly
- Verify database connection
- Check CORS settings

#### **Database Connection Issues**
- Verify `DATABASE_URL` is correct
- Check if Supabase database is accessible
- Test database connection locally first

### **Render Dashboard**
- **Logs**: Check build and runtime logs
- **Metrics**: Monitor CPU, memory usage
- **Environment**: Verify all environment variables

## 📋 What You'll Get

- **API URL**: `https://your-app-name.onrender.com`
- **Frontend URL**: `https://qacaursur-alt.github.io/Bugnation`
- **Database**: Connected to Supabase
- **Auto-deploy**: Updates automatically when you push to GitHub

## 🎉 Success!

Once everything is deployed:
1. **Test all functionality**
2. **Create a test user account**
3. **Test course creation and enrollment**
4. **Share your live application!**

Your application will be live and accessible to users worldwide! 🌍
