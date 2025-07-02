import mongoose, { Document, Schema } from 'mongoose';

export interface IReward extends Document {
  name: string;
  description: string;
  cost: number;
  category: 'merchandise' | 'experience' | 'donation';
  image: string;
  inStock: boolean;
  stockQuantity?: number;
  rating: number;
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  redemptions: {
    user: mongoose.Types.ObjectId;
    date: Date;
    status: 'pending' | 'fulfilled' | 'cancelled';
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  calculateRating(): number;
}

const rewardSchema = new Schema<IReward>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  cost: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['merchandise', 'experience', 'donation'],
    required: true
  },
  image: {
    type: String,
    required: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  redemptions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending'
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate average rating
rewardSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) return 0;
  
  const sum = this.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
  this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
  return this.rating;
};

// Indexes for better query performance
rewardSchema.index({ category: 1, inStock: 1 });
rewardSchema.index({ cost: 1 });

export default mongoose.model<IReward>('Reward', rewardSchema);