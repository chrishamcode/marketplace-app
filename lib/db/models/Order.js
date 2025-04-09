const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'],
    default: 'pending'
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  trackingNumber: {
    type: String
  },
  trackingUrl: {
    type: String
  },
  carrier: {
    type: String
  },
  estimatedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  shippedDate: {
    type: Date
  },
  cancelledDate: {
    type: Date
  },
  cancelReason: {
    type: String
  },
  returnReason: {
    type: String
  },
  returnDate: {
    type: Date
  },
  notes: {
    type: String
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
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
OrderSchema.index({ paymentId: 1 }, { unique: true });
OrderSchema.index({ offerId: 1 });
OrderSchema.index({ listingId: 1 });
OrderSchema.index({ buyerId: 1 });
OrderSchema.index({ sellerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
