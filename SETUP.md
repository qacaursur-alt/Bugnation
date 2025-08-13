# TestAcademy Pro - Setup Guide

## Setting up in Visual Studio Code

### Prerequisites
1. **Install Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Install Visual Studio Code**
   - Download from: https://code.visualstudio.com/

3. **Install Git**
   - Download from: https://git-scm.com/

### Recommended VS Code Extensions
Install these extensions for better development experience:
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Auto Rename Tag**
- **Prettier - Code formatter**
- **ESLint**
- **GitLens**

### Local Development Setup

1. **Clone or Download the Project**
   ```bash
   # If using Git
   git clone <your-repo-url>
   cd testacademy-pro
   
   # Or download ZIP and extract
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/testacademy
   
   # Session Secret (generate a random string)
   SESSION_SECRET=your-super-secret-key-here
   
   # Replit OAuth (for production deployment)
   REPL_ID=your-repl-id
   ISSUER_URL=https://replit.com/oidc
   REPLIT_DOMAINS=your-domain.com
   
   # Email Configuration (optional for local development)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Set up Local PostgreSQL Database**
   
   **Option A: Install PostgreSQL locally**
   - Download from: https://www.postgresql.org/download/
   - Create a database named `testacademy`
   - Update DATABASE_URL in `.env`

   **Option B: Use Docker**
   ```bash
   # Create docker-compose.yml
   version: '3.8'
   services:
     postgres:
       image: postgres:14
       environment:
         POSTGRES_DB: testacademy
         POSTGRES_USER: admin
         POSTGRES_PASSWORD: password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   
   # Run PostgreSQL
   docker-compose up -d
   ```

5. **Initialize Database**
   ```bash
   npm run db:push
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### VS Code Configuration

Create `.vscode/settings.json` for project-specific settings:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

Create `.vscode/launch.json` for debugging:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Dev Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "tsx/cjs"]
    }
  ]
}
```

## Deploying to GitHub and Hosting

### 1. Prepare for GitHub

Create `.gitignore` file:
```
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist/
build/

# Database
*.db
*.sqlite

# Logs
logs/
*.log

# Runtime
.replit
.env

# OS files
.DS_Store
Thumbs.db
```

### 2. Push to GitHub

```bash
# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: TestAcademy Pro platform"

# Add GitHub remote (create repo on GitHub first)
git remote add origin https://github.com/yourusername/testacademy-pro.git

# Push to GitHub
git push -u origin main
```

### 3. Hosting Options

#### Option A: Vercel (Recommended for Full-Stack)
1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:
   ```json
   {
     "builds": [
       {
         "src": "server/index.ts",
         "use": "@vercel/node"
       },
       {
         "src": "client/**/*",
         "use": "@vercel/static-build"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/client/$1"
       }
     ]
   }
   ```
3. Deploy: `vercel --prod`

#### Option B: Railway
1. Connect GitHub repo at railway.app
2. Add environment variables in Railway dashboard
3. Deploy automatically on Git push

#### Option C: Heroku
1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: npm run dev
   ```
3. Deploy:
   ```bash
   heroku create testacademy-pro
   heroku addons:create heroku-postgresql:hobby-dev
   git push heroku main
   ```

#### Option D: DigitalOcean App Platform
1. Connect GitHub repo
2. Configure build and run commands
3. Add database component

### 4. Environment Configuration for Production

For production, you'll need:
- **Database**: PostgreSQL (Neon, Railway, or cloud provider)
- **Email Service**: Gmail App Password or SendGrid
- **Domain**: Custom domain for OAuth
- **SSL Certificate**: Automatically provided by most hosts

### 5. Replit OAuth Setup for Production

1. Register your app at Replit OAuth
2. Set redirect URI to: `https://yourdomain.com/api/callback`
3. Update environment variables:
   ```env
   REPL_ID=your-production-repl-id
   REPLIT_DOMAINS=yourdomain.com
   ```

## Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **Testing Changes**
   ```bash
   npm run dev  # Test locally
   npm run build  # Test production build
   ```

3. **Deploy to Production**
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   # Auto-deploys on most platforms
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify credentials

2. **OAuth Not Working**
   - Check REPL_ID and domains
   - Verify redirect URIs
   - Ensure HTTPS in production

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npx tsc --noEmit`

4. **Port Already in Use**
   - Kill process: `lsof -ti:5000 | xargs kill -9`
   - Or change port in package.json

### Performance Optimization

1. **Database**
   - Add indexes for frequently queried fields
   - Use connection pooling
   - Enable query caching

2. **Frontend**
   - Implement code splitting
   - Optimize images
   - Use React.memo for components

3. **Backend**
   - Enable gzip compression
   - Add request rate limiting
   - Implement proper caching headers

## Monitoring and Maintenance

1. **Error Tracking**: Integrate Sentry or similar
2. **Analytics**: Add Google Analytics or privacy-focused alternatives
3. **Backup**: Regular database backups
4. **Updates**: Keep dependencies updated with `npm audit`

For more help, refer to the project documentation or create an issue on GitHub.