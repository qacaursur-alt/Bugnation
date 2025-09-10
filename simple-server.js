// Simple server for Render testing
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT,
    environment: process.env.NODE_ENV
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Render deployment working!',
    timestamp: new Date().toISOString()
  });
});

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
});
