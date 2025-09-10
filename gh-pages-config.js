// GitHub Pages Configuration
// This file helps configure the app for GitHub Pages deployment

const isGitHubPages = process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true';

export const config = {
  // API Base URL - Update this to your deployed API URL
  API_BASE_URL: isGitHubPages 
    ? 'https://your-api-domain.railway.app' // Replace with your actual API URL
    : 'http://localhost:5000',
    
  // App Base URL
  APP_BASE_URL: isGitHubPages
    ? 'https://qacaursur-alt.github.io/Bugnation' // Your GitHub Pages URL
    : 'http://localhost:5000',
    
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // GitHub Pages specific settings
  GITHUB_PAGES: isGitHubPages,
  
  // CORS settings for GitHub Pages
  CORS_ORIGIN: isGitHubPages
    ? 'https://qacaursur-alt.github.io'
    : 'http://localhost:5000'
};

export default config;
