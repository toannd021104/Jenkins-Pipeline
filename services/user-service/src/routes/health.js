const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Readiness check endpoint
router.get('/ready', (req, res) => {
  // Add any readiness checks here (database connections, etc.)
  res.json({
    status: 'ready',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// Liveness check endpoint
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;