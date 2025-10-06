import express from 'express';
import MasterAdmin from '../models/MasterAdmin.js';

const router = express.Router();

// One-time endpoint to create master admin (remove this after use)
router.post('/create-master-admin', async (req, res) => {
  try {
    const { name, username, password } = req.body;
    
    // Check if master admin already exists
    const existingAdmin = await MasterAdmin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Master admin already exists' });
    }

    const masterAdmin = new MasterAdmin({
      name,
      username,
      password // Note: In production, this should be hashed
    });

    await masterAdmin.save();
    res.status(201).json({ message: 'Master admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple authentication endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await MasterAdmin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      success: true, 
      message: 'Authentication successful',
      admin: {
        name: admin.name,
        username: admin.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;