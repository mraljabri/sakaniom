const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const Verification = require('../models/Verification');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ID documents are uploaded as `authenticated` assets: the plain URL does not
// work, only a signed URL minted server-side for an admin does.
const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: 'sakaniom-identity',
    type: 'authenticated',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  }),
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

const signedUrl = publicId => cloudinary.url(publicId, {
  type: 'authenticated', sign_url: true, secure: true,
  transformation: [{ width: 1200, crop: 'limit' }],
});
const destroyAll = ids => Promise.allSettled(
  ids.filter(Boolean).map(id => cloudinary.uploader.destroy(id, { type: 'authenticated', resource_type: 'image' }))
);

// GET /api/verification/me — current user's status and latest request.
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [user, latest] = await Promise.all([
      User.findById(req.user.id).select('identityStatus').lean(),
      Verification.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).select('status reviewNote createdAt reviewedAt').lean(),
    ]);
    res.json({ identityStatus: user?.identityStatus || 'none', latest: latest || null, isAdmin: !!req.user.isAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load verification status.' });
  }
});

// POST /api/verification — submit ID front, ID back and a live selfie.
router.post('/', authenticateToken,
  upload.fields([{ name: 'idFront', maxCount: 1 }, { name: 'idBack', maxCount: 1 }, { name: 'selfie', maxCount: 1 }]),
  async (req, res) => {
    const f = req.files || {};
    const idFront = f.idFront?.[0], idBack = f.idBack?.[0], selfie = f.selfie?.[0];
    const uploaded = [idFront?.filename, idBack?.filename, selfie?.filename];

    if (!idFront || !idBack || !selfie) {
      await destroyAll(uploaded);
      return res.status(400).json({ error: 'ID front, ID back and a live selfie are all required.' });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) { await destroyAll(uploaded); return res.status(404).json({ error: 'Account not found.' }); }
      if (user.identityStatus === 'approved') {
        await destroyAll(uploaded);
        return res.status(400).json({ error: 'Your identity is already verified.' });
      }
      if (user.identityStatus === 'pending') {
        await destroyAll(uploaded);
        return res.status(409).json({ error: 'A verification request is already under review.' });
      }

      // Replace any earlier (rejected) submission so stale documents are not kept.
      const old = await Verification.find({ userId: user._id });
      await destroyAll(old.flatMap(v => [v.idFrontId, v.idBackId, v.selfieId]));
      await Verification.deleteMany({ userId: user._id });

      await Verification.create({
        userId: user._id, userName: user.name, userEmail: user.email,
        idFrontId: idFront.filename, idBackId: idBack.filename, selfieId: selfie.filename,
      });
      user.identityStatus = 'pending';
      await user.save();

      res.status(201).json({ identityStatus: 'pending', message: 'Submitted. We will review your documents shortly.' });
    } catch (err) {
      console.error(err);
      await destroyAll(uploaded);
      res.status(500).json({ error: 'Failed to submit verification.' });
    }
  }
);

// GET /api/verification — admin: all requests, pending first, with signed image URLs.
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const docs = await Verification.find({}).sort({ status: 1, createdAt: -1 }).lean();
    res.json(docs.map(v => ({
      ...v,
      idFrontUrl: signedUrl(v.idFrontId),
      idBackUrl:  signedUrl(v.idBackId),
      selfieUrl:  signedUrl(v.selfieId),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load verification requests.' });
  }
});

// PATCH /api/verification/:id — admin: approve or reject.
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { status, note } = req.body;
  if (!['approved', 'rejected'].includes(status))
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  try {
    const v = await Verification.findById(req.params.id);
    if (!v) return res.status(404).json({ error: 'Not found.' });
    v.status = status; v.reviewNote = (note || '').trim(); v.reviewedAt = new Date();
    await v.save();
    await User.findByIdAndUpdate(v.userId, { identityStatus: status });
    // Once approved the documents have served their purpose; do not keep them.
    if (status === 'approved') await destroyAll([v.idFrontId, v.idBackId, v.selfieId]);
    res.json({ status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update.' });
  }
});

module.exports = router;
