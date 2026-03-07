const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
