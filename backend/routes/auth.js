const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const Listing = require('../models/Listing');
const Rating = require('../models/Rating');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Configured here as well as in the listings router so account deletion does
// not depend on which route module Express happens to load first.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(), email, password: hashed,
      phone: phone || null, role: 'creator', isVerified: true,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: userPayload(user) });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: 'An account with this email already exists.' });
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

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// DELETE /api/auth/me — permanent account deletion.
// Required by App Store Guideline 5.1.1(v) for any app offering account
// creation. Removes the user's listings, their uploaded media, and every
// rating they wrote or received.
router.delete('/me', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password)
    return res.status(400).json({ error: 'Password confirmation is required.' });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Password is incorrect.' });

    const listings = await Listing.find({ creatorId: user._id });
    const mediaIds = listings.flatMap(l => [
      ...(l.photoPublicIds || []).map(pid => ({ pid, type: 'image' })),
      ...(l.videoPublicIds || []).map(pid => ({ pid, type: 'video' })),
    ]);
    await Promise.allSettled(
      mediaIds.map(({ pid, type }) => cloudinary.uploader.destroy(pid, { resource_type: type }))
    );

    await Listing.deleteMany({ creatorId: user._id });
    await Rating.deleteMany({ $or: [{ landlordId: user._id }, { raterId: user._id }] });
    await user.deleteOne();

    res.json({ message: 'Your account and all associated data have been permanently deleted.' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
});

module.exports = router;
