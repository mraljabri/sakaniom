require('dotenv').config();
require('./db'); // connect to MongoDB

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const adminRoutes   = require('./routes/admin');

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
app.get('/api/health',   (req, res) => res.json({ status: 'ok' }));

// Serve built React frontend in production
if (isProd) {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n🏠 SakaniOM running on port ${PORT} [${isProd ? 'production' : 'development'}]\n`);
});
