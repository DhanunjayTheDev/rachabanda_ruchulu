const { verifyToken } = require('../config/jwt');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  });
};

module.exports = { auth, adminAuth };
