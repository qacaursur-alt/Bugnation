// Ultra-simple server for Render free tier
const express = require('express');
const app = express();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 10000,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bugnation API is running!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Start server
const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
