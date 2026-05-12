const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  landlordId: { type: String, required: true, index: true },
  raterId:    { type: String, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: '' },
}, { timestamps: true });

// One rating per rater per landlord
ratingSchema.index({ landlordId: 1, raterId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
