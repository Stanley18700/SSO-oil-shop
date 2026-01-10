// Authentication controller for admin login
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../services/prisma');

/**
 * POST /auth/login - Admin login
 * Authenticates admin user and returns JWT token
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h' // Token expires in 24 hours
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

/**
 * POST /api/auth/change-password - Change admin password
 * Requires a valid JWT (admin) and the current password.
 * Stateless JWT: this does NOT revoke existing tokens; client should re-login if desired.
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 64) {
      return res.status(400).json({
        success: false,
        error: 'New password must be between 8 and 64 characters'
      });
    }

    if (typeof confirmPassword === 'string' && confirmPassword !== newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash }
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error during change password:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to change password'
    });
  }
};

/**
 * POST /api/auth/logout - Logout (stateless JWT)
 * Server cannot revoke a stateless JWT without sessions/blacklists.
 * This endpoint exists for symmetry; clients must delete the token locally.
 */
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out'
  });
};

module.exports = {
  login,
  changePassword,
  logout
};

