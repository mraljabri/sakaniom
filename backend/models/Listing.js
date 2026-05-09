const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  creatorId:     { type: String, required: true, index: true },
  creatorName:   { type: String, required: true },
  title:         { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  property_type: { type: String, required: true },
  city:          { type: String, required: true, index: true },
  neighborhood:  { type: String, default: '' },
  price:         { type: Number, required: true, index: true },
  bedrooms:      { type: Number, required: true },
  bathrooms:     { type: Number, required: true },
  area_sqm:      { type: Number, default: null },
  furnished:     { type: String, default: 'unfurnished' },
  contact_name:  { type: String, required: true },
  contact_phone: { type: String, required: true },
  contact_email: { type: String, default: '' },
  photos:        [String],   // Cloudinary URLs
  videos:        [String],   // Cloudinary URLs
  photoPublicIds:[String],   // Cloudinary public_ids for deletion
  videoPublicIds:[String],
  status:        { type: String, default: 'active', index: true },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
