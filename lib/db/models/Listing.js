import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'deleted'],
    default: 'active'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add text index for search
ListingSchema.index({ 
  title: 'text', 
  description: 'text', 
  category: 'text', 
  subcategory: 'text' 
});

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
