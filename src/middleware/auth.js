// Authentication middleware for admin routes
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token for protected routes
 * Attaches user information to req.user if valid
 */
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header (Bearer token)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request object
    req.user = user;
    next();
  });
};

/**
 * Middleware to check if user has admin role
 * Must be used after authenticateToken
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};

