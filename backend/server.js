require('dotenv').config();
require('./db'); // connect to MongoDB

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const adminRoutes   = require('./routes/admin');
const ratingRoutes  = require('./routes/ratings');

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// CORS — allow local dev frontend; in production same origin so not needed
if (!isProd) {
  app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
}

app.use(express.json());

// API routes
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/ratings',  ratingRoutes);
app.get('/api/health',   (req, res) => res.json({ status: 'ok' }));

// Dynamic XML sitemap — must be before the React catch-all
const Listing = require('./models/Listing');
app.get('/sitemap.xml', async (req, res) => {
  try {
    const base = process.env.BASE_URL || 'https://sakaniom.onrender.com';
    const listings = await Listing.find({ status: 'active' }).select('_id updatedAt').lean();

    const staticPages = [
      { url: '',          changefreq: 'daily',   priority: '1.0' },
      { url: '/listings', changefreq: 'hourly',  priority: '0.9' },
      { url: '/terms',    changefreq: 'monthly', priority: '0.3' },
    ];

    const staticUrls = staticPages.map(p => `
  <url>
    <loc>${base}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

    const listingUrls = listings.map(l => `
  <url>
    <loc>${base}/listings/${l._id}</loc>
    <lastmod>${new Date(l.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${listingUrls}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Failed to generate sitemap.');
  }
});

// Serve built React frontend in production
if (isProd) {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n🏠 SakaniOM running on port ${PORT} [${isProd ? 'production' : 'development'}]\n`);
});
