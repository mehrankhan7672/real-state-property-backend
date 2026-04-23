const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: false,  // Set to true if you want to make it required
    trim: true,
  },
  contactNumber: {
    type: String,
    required: false,  // Set to true if you want to make it required
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
inquirySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // next();  // Don't forget to call next()
});

module.exports = mongoose.model('Inquiry', inquirySchema);