const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  // Get token from cookies or Authorization header
  const tokenFromCookie = req.cookies.token;
  const tokenFromHeader = req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')
    ? req.header('Authorization').replace('Bearer ', '')
    : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug statement
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message); // Debug statement
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
