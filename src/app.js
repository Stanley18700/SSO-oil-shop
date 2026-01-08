// Main Express application setup
const express = require('express');
const cors = require('cors');
const oilRoutes = require('./routes/oilRoutes');
const authRoutes = require('./routes/authRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();

// Middleware
// Configure CORS to allow requests from your frontend domain
app.use(cors({
  origin: true, // Allow all origins temporarily for testing
  credentials: true
})); // Enable CORS for frontend integration
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/oils', oilRoutes);
app.use('/api/sales', saleRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

module.exports = app;

