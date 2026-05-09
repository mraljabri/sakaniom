const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'oman-rentals-jwt-secret-2024';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function requireCreator(req, res, next) {
  if (req.user?.role !== 'creator') {
    return res.status(403).json({ error: 'This action requires a creator account.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

module.exports = { authenticateToken, requireCreator, requireAdmin, JWT_SECRET };
