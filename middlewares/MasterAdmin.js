import jwt from 'jsonwebtoken';

const masterAdminMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided. Please login as master admin.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-env');
    
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token. Please login again.' 
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message 
    });
  }
};

export default masterAdminMiddleware;