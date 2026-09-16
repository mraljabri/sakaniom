const mongoose = require('mongoose');

// Complaints and feedback submitted by signed-in users. Only admins can read.
const feedbackSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName:  { type: String, required: true },
  userEmail: { type: String, required: true },
  type:      { type: String, enum: ['complaint', 'feedback'], required: true },
  subject:   { type: String, required: true, trim: true, maxlength: 150 },
  message:   { type: String, required: true, trim: true, maxlength: 3000 },
  status:    { type: String, enum: ['open', 'resolved'], default: 'open', index: true },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
