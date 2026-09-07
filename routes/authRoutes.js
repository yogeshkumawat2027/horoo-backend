import express from 'express';
import jwt from 'jsonwebtoken';
import MasterAdmin from '../models/MasterAdmin.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';
const TOKEN_EXPIRY = '7d';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password are required' 
      });
    }

    const admin = await MasterAdmin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password' 
      });
    }

    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username,
        name: admin.name 
      }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ 
      success: true, 
      message: 'Authentication successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Login failed',
      error: error.message 
    });
  }
});

router.post('/verify-token', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ 
      success: true, 
      message: 'Token is valid',
      admin: decoded 
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
});

router.post('/logout', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Logout successful. Please remove the token from client.' 
  });
});

export default router;