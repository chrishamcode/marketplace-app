const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered', 'expired', 'withdrawn'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  counterOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
OfferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
OfferSchema.index({ listingId: 1, buyerId: 1, status: 1 });
OfferSchema.index({ sellerId: 1, status: 1 });
OfferSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
