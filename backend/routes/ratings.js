const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Listing = require('../models/Listing');
const { authenticateToken } = require('../middleware/auth');

function buildSummary(ratings) {
  const count = ratings.length;
  const avg = count > 0 ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  return { avg, count };
}

// GET /api/ratings/:landlordId — public summary + recent comments
router.get('/:landlordId', async (req, res) => {
  try {
    const { landlordId } = req.params;
    const [ratings, listingCount, sample] = await Promise.all([
      Rating.find({ landlordId }).sort({ createdAt: -1 }).lean(),
      Listing.countDocuments({ creatorId: landlordId, status: 'active' }),
      Listing.findOne({ creatorId: landlordId }).select('creatorName').lean(),
    ]);

    const { avg, count } = buildSummary(ratings);
    const recent = ratings.filter(r => r.comment).slice(0, 5).map(r => ({
      rating: r.rating, comment: r.comment, createdAt: r.createdAt,
    }));

    res.json({ avg, count, listingCount, creatorName: sample?.creatorName || '', recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ratings.' });
  }
});

// GET /api/ratings/:landlordId/mine — my own rating (requires auth)
router.get('/:landlordId/mine', authenticateToken, async (req, res) => {
  try {
    const r = await Rating.findOne({ landlordId: req.params.landlordId, raterId: req.user.id }).lean();
    res.json(r ? { rating: r.rating, comment: r.comment } : null);
  } catch (err) {
    res.status(500).json({ error: 'Failed.' });
  }
});

// POST /api/ratings/:landlordId — submit or update rating (requires auth)
router.post('/:landlordId', authenticateToken, async (req, res) => {
  const { landlordId } = req.params;
  const raterId = req.user.id;

  if (raterId === landlordId)
    return res.status(403).json({ error: 'You cannot rate yourself.' });

  const rating = Number(req.body.rating);
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });

  try {
    await Rating.findOneAndUpdate(
      { landlordId, raterId },
      { rating, comment: req.body.comment?.trim() || '' },
      { upsert: true, new: true }
    );

    const ratings = await Rating.find({ landlordId }).lean();
    const { avg, count } = buildSummary(ratings);
    res.json({ avg, count, myRating: { rating, comment: req.body.comment?.trim() || '' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

module.exports = router;
