# GitHub Pages Setup Guide

## 🚀 How to Deploy Your Project to GitHub Pages

Your project is already on GitHub at: https://github.com/qacaursur-alt/Bugnation

### Step 1: Enable GitHub Pages

1. **Go to your repository**: https://github.com/qacaursur-alt/Bugnation
2. **Click on "Settings"** (in the repository menu)
3. **Scroll down to "Pages"** (in the left sidebar)
4. **Under "Source"**, select **"GitHub Actions"**
5. **Save the settings**

### Step 2: Set Up Secrets

1. **Go to "Settings" → "Secrets and variables" → "Actions"**
2. **Click "New repository secret"** and add these secrets:

```
DATABASE_URL = postgresql://postgres:Abhihere12@@db.yyuncxmoocpojlgkhfqf.supabase.co:5432/postgres
SUPABASE_URL = https://yyuncxmoocpojlgkhfqf.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dW5jeG1vb2Nwb2psZ2toZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDMxOTcsImV4cCI6MjA3MzA3OTE5N30._PvwUP4EfAnFo0JYXBewuCwudyGDnlnBxt5WKnTGXfY
SESSION_SECRET = your_production_session_secret_change_this
```

### Step 3: Deploy the API Separately

Since GitHub Pages only hosts static files, you need to deploy your API separately:

#### Option A: Railway (Recommended)
1. **Go to**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository**: `qacaursur-alt/Bugnation`
5. **Set environment variables** (same as above)
6. **Deploy**

#### Option B: Render
1. **Go to**: https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New"** → **"Web Service"**
4. **Connect your repository**
5. **Set build command**: `npm run build`
6. **Set start command**: `npm run start`
7. **Add environment variables**
8. **Deploy**

### Step 4: Update API URL

Once your API is deployed, update the API URL in the GitHub Actions workflow:

1. **Edit**: `.github/workflows/deploy.yml`
2. **Find**: `API_BASE_URL: ${{ secrets.API_BASE_URL }}`
3. **Replace** with your actual API URL
4. **Commit and push**

### Step 5: Trigger Deployment

1. **Make any small change** to your repository (like updating README)
2. **Commit and push** to the `main` branch
3. **GitHub Actions will automatically build and deploy**

### Step 6: Access Your Site

Your site will be available at:
**https://qacaursur-alt.github.io/Bugnation**

## 🔧 Configuration Files Created

- ✅ `.github/workflows/deploy.yml` - GitHub Pages deployment
- ✅ `.github/workflows/api-deploy.yml` - API deployment to Railway
- ✅ `gh-pages-config.js` - GitHub Pages configuration
- ✅ Updated `package.json` with GitHub Pages scripts

## 🐛 Troubleshooting

### If the site doesn't load:
1. **Check GitHub Actions** for build errors
2. **Verify secrets** are set correctly
3. **Check API URL** is correct

### If API calls fail:
1. **Verify API is deployed** and running
2. **Check CORS settings** in your API
3. **Update API URL** in the frontend

### If build fails:
1. **Check Node.js version** (should be 18+)
2. **Verify all dependencies** are installed
3. **Check for TypeScript errors**

## 📝 Next Steps

1. **Deploy your API** to Railway or Render
2. **Update the API URL** in the workflow
3. **Push changes** to trigger deployment
4. **Test your live site**
5. **Set up custom domain** (optional)

## 🌐 Your Live URLs

- **Frontend**: https://qacaursur-alt.github.io/Bugnation
- **API**: https://your-api-domain.railway.app (after deployment)
- **Repository**: https://github.com/qacaursur-alt/Bugnation
