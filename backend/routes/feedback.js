const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/feedback — any signed-in user can submit a complaint or feedback.
router.post('/', authenticateToken, async (req, res) => {
  const { type, subject, message } = req.body;
  if (!['complaint', 'feedback'].includes(type))
    return res.status(400).json({ error: 'Type must be complaint or feedback.' });
  if (!subject?.trim() || !message?.trim())
    return res.status(400).json({ error: 'Subject and message are required.' });

  try {
    const doc = await Feedback.create({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email,
      type, subject: subject.trim(), message: message.trim(),
    });
    res.status(201).json({ id: doc._id, message: 'Thank you — your submission has been received.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit. Please try again.' });
  }
});

// GET /api/feedback/mine — the caller's own submissions and their status.
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const docs = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load submissions.' });
  }
});

// GET /api/feedback — admin only: everything, newest first.
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const docs = await Feedback.find({}).sort({ status: 1, createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load feedback.' });
  }
});

// PATCH /api/feedback/:id — admin only: mark open / resolved.
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!['open', 'resolved'].includes(status))
    return res.status(400).json({ error: 'Status must be open or resolved.' });
  try {
    const doc = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found.' });
    res.json({ status: doc.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update.' });
  }
});

module.exports = router;
