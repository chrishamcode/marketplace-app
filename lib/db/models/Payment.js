const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  },
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
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe'],
    required: true
  },
  paymentIntentId: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundDate: {
    type: Date
  },
  metadata: {
    type: Object,
    default: {}
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
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
PaymentSchema.index({ offerId: 1 });
PaymentSchema.index({ listingId: 1 });
PaymentSchema.index({ buyerId: 1 });
PaymentSchema.index({ sellerId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentIntentId: 1 }, { unique: true });

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
