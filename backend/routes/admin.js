const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const Listing = require('../models/Listing');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// All routes require auth + admin
router.use(authenticateToken, requireAdmin);

// GET all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// GET all listings (no status filter)
router.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find({}).sort({ createdAt: -1 }).lean();
    res.json(listings.map(doc => ({ ...doc, id: doc._id, created_at: doc.createdAt })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
});

// DELETE any listing (admin power)
router.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const deletePromises = [
      ...(listing.photoPublicIds || []).map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'image' })),
      ...(listing.videoPublicIds || []).map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'video' })),
    ];
    await Promise.allSettled(deletePromises);
    await listing.deleteOne();
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

// PATCH listing status (activate / deactivate)
router.patch('/listings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
      return res.status(400).json({ error: 'Status must be active or inactive.' });
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    res.json({ message: 'Status updated.', status: listing.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// DELETE a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isAdmin) return res.status(400).json({ error: 'Cannot delete an admin account.' });
    await user.deleteOne();
    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;
