const mongoose = require('mongoose');

// Identity verification request: ID card front/back and a live selfie.
// Images are stored in Cloudinary as `authenticated` assets, so only the
// Cloudinary public IDs are kept here and signed URLs are minted for admins.
const verificationSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName:      { type: String, required: true },
  userEmail:     { type: String, required: true },
  idFrontId:     { type: String, required: true },
  idBackId:      { type: String, required: true },
  selfieId:      { type: String, required: true },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  reviewNote:    { type: String, default: '' },
  reviewedAt:    { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);
