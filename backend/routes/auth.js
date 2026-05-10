const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/email');

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
      // If exists but not verified, resend code
      if (!existing.isVerified) {
        const code = generateCode();
        existing.verificationCode = code;
        existing.verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await existing.save();
        await sendVerificationEmail(existing.email, existing.name, code);
        return res.status(200).json({ message: 'Verification code resent.', email: existing.email });
      }
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const code = generateCode();
    const user = await User.create({
      name: name.trim(), email, password: hashed,
      phone: phone || null, role: 'creator',
      verificationCode: code,
      verificationExpiry: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendVerificationEmail(user.email, user.name, code);
    res.status(201).json({ message: 'Verification code sent to your email.', email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ error: 'Email and code are required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified.' });
    if (!user.verificationCode || user.verificationCode !== code)
      return res.status(400).json({ error: 'Invalid verification code.' });
    if (user.verificationExpiry < new Date())
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpiry = null;
    await user.save();

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified.' });

    const code = generateCode();
    user.verificationCode = code;
    user.verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.name, code);
    res.json({ message: 'New verification code sent.' });
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
      return res.status(403).json({ error: 'Please verify your email first.', needsVerification: true, email: user.email });

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
