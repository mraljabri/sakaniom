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

// CORS — the web build is same-origin in production, but the Capacitor native
// apps load from localhost web views and call the API cross-origin, so those
// schemes have to be allowed in every environment.
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev
  'http://localhost:5174',
  'https://localhost',       // Capacitor Android (androidScheme: https)
  'capacitor://localhost',   // Capacitor iOS
  'ionic://localhost',       // legacy Capacitor/Ionic web view
];
if (process.env.BASE_URL) allowedOrigins.push(process.env.BASE_URL);

app.use(cors({
  origin: (origin, cb) => {
    // Native web views and server-to-server calls may omit Origin entirely.
    if (!origin) return cb(null, true);
    cb(null, allowedOrigins.includes(origin));
  },
  credentials: true,
}));

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
