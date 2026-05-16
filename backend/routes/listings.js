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
  // Filter by purpose — default shows rentals (including old listings without the field)
  if (q.listing_purpose === 'sale') {
    query.listing_purpose = 'sale';
  } else {
    query.listing_purpose = { $ne: 'sale' };
  }
  if (q.city)          query.city = q.city;
  if (q.property_type) query.property_type = q.property_type;
  if (q.furnished)     query.furnished = q.furnished;
  if (q.ownership_type) query.ownership_type = q.ownership_type;
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

// GET all active listings by a specific creator (public)
router.get('/by-creator/:creatorId', async (req, res) => {
  try {
    const docs = await Listing.find({ creatorId: req.params.creatorId, status: 'active' })
      .sort({ createdAt: -1 }).lean();
    res.json(docs.map(doc => ({ ...doc, id: doc._id, created_at: doc.createdAt, creator_name: doc.creatorName })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings.' });
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
    const { title, description, property_type, city, neighborhood, price, price_period, bedrooms, bathrooms, area_sqm, furnished, contract_period, family_status, payment_method, listing_purpose, ownership_type, seller_type, contact_name, contact_phone, contact_email, show_email } = req.body;

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
        price: Number(price), price_period: price_period || 'month',
        bedrooms: Number(bedrooms), bathrooms: Number(bathrooms),
        area_sqm: area_sqm ? Number(area_sqm) : null,
        furnished: furnished || 'unfurnished',
        listing_purpose: listing_purpose || 'rent',
        ownership_type: ownership_type || '',
        seller_type: seller_type || '',
        contract_period: contract_period || 'no_contract',
        family_status: family_status || 'both',
        payment_method: payment_method || 'cash',
        contact_name: contact_name.trim(), contact_phone: contact_phone.trim(),
        contact_email: contact_email?.trim() || '',
        show_email: show_email === 'true',
        photos, photoPublicIds, videos, videoPublicIds,
      });

      res.status(201).json({ id: listing._id, message: 'Listing created successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create listing.' });
    }
  }
);

// PUT edit listing (owner only)
router.put('/:id', authenticateToken, requireCreator,
  upload.fields([{ name: 'photos', maxCount: 10 }, { name: 'videos', maxCount: 2 }]),
  async (req, res) => {
    try {
      const listing = await Listing.findOne({ _id: req.params.id, creatorId: req.user.id });
      if (!listing) return res.status(404).json({ error: 'Listing not found or access denied.' });

      const { title, description, property_type, city, neighborhood, price, price_period, bedrooms, bathrooms, area_sqm, furnished, contract_period, family_status, payment_method, listing_purpose, ownership_type, seller_type, contact_name, contact_phone, contact_email, show_email } = req.body;

      if (title)         listing.title         = title.trim();
      if (description != null) listing.description = description.trim();
      if (property_type) listing.property_type = property_type;
      if (city)          listing.city          = city;
      if (contract_period) listing.contract_period = contract_period;
      if (family_status)   listing.family_status   = family_status;
      if (payment_method)  listing.payment_method  = payment_method;
      if (ownership_type != null) listing.ownership_type = ownership_type;
      if (seller_type != null)    listing.seller_type    = seller_type;
      if (neighborhood != null) listing.neighborhood = neighborhood.trim();
      if (price)         listing.price         = Number(price);
      if (price_period)  listing.price_period  = price_period;
      if (bedrooms != null) listing.bedrooms   = Number(bedrooms);
      if (bathrooms != null) listing.bathrooms = Number(bathrooms);
      if (area_sqm != null) listing.area_sqm   = area_sqm ? Number(area_sqm) : null;
      if (furnished)     listing.furnished     = furnished;
      if (contact_name)  listing.contact_name  = contact_name.trim();
      if (contact_phone) listing.contact_phone = contact_phone.trim();
      if (contact_email != null) listing.contact_email = contact_email.trim();
      listing.show_email = show_email === 'true';

      // If new photos uploaded, replace old ones
      if (req.files?.photos?.length) {
        // Delete old photos from Cloudinary
        await Promise.allSettled((listing.photoPublicIds || []).map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'image' })));
        listing.photos        = req.files.photos.map(f => f.path);
        listing.photoPublicIds = req.files.photos.map(f => f.filename);
      }
      // If new videos uploaded, replace old ones
      if (req.files?.videos?.length) {
        await Promise.allSettled((listing.videoPublicIds || []).map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'video' })));
        listing.videos        = req.files.videos.map(f => f.path);
        listing.videoPublicIds = req.files.videos.map(f => f.filename);
      }

      await listing.save();
      res.json({ id: listing._id, message: 'Listing updated successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update listing.' });
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
