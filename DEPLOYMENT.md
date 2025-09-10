# Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Frontend + API)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings in Vercel
   - Add these environment variables:
     ```
     DATABASE_URL=postgresql://postgres:Abhihere12@@db.yyuncxmoocpojlgkhfqf.supabase.co:5432/postgres
     SUPABASE_URL=https://yyuncxmoocpojlgkhfqf.supabase.co
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dW5jeG1vb2Nwb2psZ2toZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDMxOTcsImV4cCI6MjA3MzA3OTE5N30._PvwUP4EfAnFo0JYXBewuCwudyGDnlnBxt5WKnTGXfY
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dW5jeG1vb2Nwb2psZ2toZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDMxOTcsImV4cCI6MjA3MzA3OTE5N30._PvwUP4EfAnFo0JYXBewuCwudyGDnlnBxt5WKnTGXfY
     SESSION_SECRET=your_production_session_secret_change_this
     NODE_ENV=production
     ```

### Option 2: Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy to Railway:**
   ```bash
   railway up
   ```

4. **Set Environment Variables in Railway Dashboard:**
   - Go to your project settings in Railway
   - Add the same environment variables as above

### Option 3: Render

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Set the build command:** `npm run build`
4. **Set the start command:** `npm run start`
5. **Add environment variables** (same as above)

## 🔧 Environment Variables

Make sure to set these environment variables in your deployment platform:

```env
DATABASE_URL=postgresql://postgres:Abhihere12@@db.yyuncxmoocpojlgkhfqf.supabase.co:5432/postgres
SUPABASE_URL=https://yyuncxmoocpojlgkhfqf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dW5jeG1vb2Nwb2psZ2toZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDMxOTcsImV4cCI6MjA3MzA3OTE5N30._PvwUP4EfAnFo0JYXBewuCwudyGDnlnBxt5WKnTGXfY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dW5jeG1vb2Nwb2psZ2toZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDMxOTcsImV4cCI6MjA3MzA3OTE5N30._PvwUP4EfAnFo0JYXBewuCwudyGDnlnBxt5WKnTGXfY
SESSION_SECRET=your_production_session_secret_change_this
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

## 📝 Post-Deployment Steps

1. **Test the deployed application**
2. **Verify database connection**
3. **Test user registration and login**
4. **Test course creation and enrollment**
5. **Update CORS_ORIGIN to your actual domain**

## 🐛 Troubleshooting

- **Database connection issues:** Check if the DATABASE_URL is correct
- **CORS errors:** Update CORS_ORIGIN to your actual domain
- **Session issues:** Make sure SESSION_SECRET is set
- **File upload issues:** Check if uploads directory exists and has proper permissions
