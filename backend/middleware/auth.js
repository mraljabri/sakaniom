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

// Posting a listing requires an approved identity check. Looked up fresh from
// the database rather than the token, so an approval takes effect without the
// user having to log in again. Admins bypass.
async function requireVerified(req, res, next) {
  if (req.user?.isAdmin) return next();
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('identityStatus').lean();
    if (user?.identityStatus !== 'approved') {
      return res.status(403).json({
        error: 'Identity verification is required before posting.',
        code: 'NOT_VERIFIED',
        identityStatus: user?.identityStatus || 'none',
      });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not check verification status.' });
  }
}

module.exports = { authenticateToken, requireCreator, requireAdmin, requireVerified, JWT_SECRET };
