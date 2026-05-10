const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/email');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role, isAdmin: user.isAdmin },
    JWT_SECRET, { expiresIn: '7d' }
  );
}

function userPayload(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, isAdmin: user.isAdmin };
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (!existing.isVerified) {
        const token = generateToken();
        existing.verificationCode = token;
        existing.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await existing.save();
        sendVerificationEmail(existing.email, existing.name, token)
          .catch(err => console.error('Email failed:', err.message));
        return res.status(200).json({ message: 'Confirmation email resent.', email: existing.email });
      }
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const token = generateToken();
    const user = await User.create({
      name: name.trim(), email, password: hashed,
      phone: phone || null, role: 'creator',
      verificationCode: token,
      verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    sendVerificationEmail(user.email, user.name, token)
      .catch(err => console.error('Email failed:', err.message));

    res.status(201).json({ message: 'Confirmation email sent.', email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token is required.' });

  try {
    const user = await User.findOne({ verificationCode: token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired confirmation link.' });
    if (user.verificationExpiry < new Date())
      return res.status(400).json({ error: 'This confirmation link has expired. Please sign up again.' });

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpiry = null;
    await user.save();

    const authToken = signToken(user);
    // Redirect to frontend with token in URL
    const baseUrl = process.env.BASE_URL || 'https://sakaniom.onrender.com';
    res.redirect(`${baseUrl}/verify-success?token=${authToken}&name=${encodeURIComponent(user.name)}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified.' });

    const token = generateToken();
    user.verificationCode = token;
    user.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    sendVerificationEmail(user.email, user.name, token)
      .catch(err => console.error('Email failed:', err.message));

    res.json({ message: 'Confirmation email sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.isVerified)
      return res.status(403).json({ error: 'Please confirm your email first.', needsVerification: true, email: user.email });

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
