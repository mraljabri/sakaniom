const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Listing = require('../models/Listing');
const { authenticateToken, requireCreator } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary multer storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'oman-rentals',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi', 'webm'],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

function buildQuery(q) {
  const query = { status: 'active' };
  if (q.city)          query.city = q.city;
  if (q.property_type) query.property_type = q.property_type;
  if (q.furnished)     query.furnished = q.furnished;
  if (q.min_price || q.max_price) {
    query.price = {};
    if (q.min_price) query.price.$gte = Number(q.min_price);
    if (q.max_price) query.price.$lte = Number(q.max_price);
  }
  if (q.bedrooms === '4+')             query.bedrooms = { $gte: 4 };
  else if (q.bedrooms != null && q.bedrooms !== '') query.bedrooms = Number(q.bedrooms);
  if (q.bathrooms)     query.bathrooms = { $gte: Number(q.bathrooms) };
  if (q.search) {
    const re = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ title: re }, { description: re }, { neighborhood: re }, { city: re }];
  }
  return query;
}

function formatListing(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id,
    created_at: obj.createdAt,
    updated_at: obj.updatedAt,
    creator_name: obj.creatorName,
  };
}

// GET all listings
router.get('/', async (req, res) => {
  try {
    const query = buildQuery(req.query);
    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc')  sort = { price: 1 };
    if (req.query.sort === 'price_desc') sort = { price: -1 };

    const docs = await Listing.find(query).sort(sort).lean();
    res.json(docs.map(doc => ({ ...doc, id: doc._id, created_at: doc.createdAt, updated_at: doc.updatedAt, creator_name: doc.creatorName })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
});

// GET creator's own listings
router.get('/my', authenticateToken, requireCreator, async (req, res) => {
  try {
    const docs = await Listing.find({ creatorId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(docs.map(doc => ({ ...doc, id: doc._id, created_at: doc.createdAt, updated_at: doc.updatedAt })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your listings.' });
  }
});

// GET single listing
router.get('/:id', async (req, res) => {
  try {
    const doc = await Listing.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Listing not found.' });
    res.json({ ...doc, id: doc._id, created_at: doc.createdAt, updated_at: doc.updatedAt, creator_name: doc.creatorName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing.' });
  }
});

// POST create listing
router.post('/', authenticateToken, requireCreator,
  upload.fields([{ name: 'photos', maxCount: 10 }, { name: 'videos', maxCount: 2 }]),
  async (req, res) => {
    const { title, description, property_type, city, neighborhood, price, bedrooms, bathrooms, area_sqm, furnished, contact_name, contact_phone, contact_email } = req.body;

    if (!title || !property_type || !city || !price || bedrooms == null || bathrooms == null || !contact_name || !contact_phone)
      return res.status(400).json({ error: 'Please fill in all required fields.' });

    try {
      const photos        = req.files?.photos?.map(f => f.path)      || [];
      const photoPublicIds = req.files?.photos?.map(f => f.filename) || [];
      const videos        = req.files?.videos?.map(f => f.path)      || [];
      const videoPublicIds = req.files?.videos?.map(f => f.filename) || [];

      const listing = await Listing.create({
        creatorId: req.user.id, creatorName: req.user.name,
        title: title.trim(), description: description?.trim() || '',
        property_type, city, neighborhood: neighborhood?.trim() || '',
        price: Number(price), bedrooms: Number(bedrooms), bathrooms: Number(bathrooms),
        area_sqm: area_sqm ? Number(area_sqm) : null,
        furnished: furnished || 'unfurnished',
        contact_name: contact_name.trim(), contact_phone: contact_phone.trim(),
        contact_email: contact_email?.trim() || '',
        photos, photoPublicIds, videos, videoPublicIds,
      });

      res.status(201).json({ id: listing._id, message: 'Listing created successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create listing.' });
    }
  }
);

// DELETE listing
router.delete('/:id', authenticateToken, requireCreator, async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, creatorId: req.user.id });
    if (!listing) return res.status(404).json({ error: 'Listing not found or access denied.' });

    // Delete media from Cloudinary
    const deletePromises = [
      ...(listing.photoPublicIds || []).map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'image' })),
      ...(listing.videoPublicIds || []).map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'video' })),
    ];
    await Promise.allSettled(deletePromises);

    await listing.deleteOne();
    res.json({ message: 'Listing deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

module.exports = router;
