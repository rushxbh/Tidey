import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  description: string;
  icon: string;
  category: 'participation' | 'impact' | 'leadership' | 'special';
  criteria: {
    type: 'events_joined' | 'hours_volunteered' | 'waste_collected' | 'custom';
    value: number;
    operator: 'gte' | 'lte' | 'eq';
  };
  reward: {
    aquaCoins: number;
    nftMetadata?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['participation', 'impact', 'leadership', 'special'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['events_joined', 'hours_volunteered', 'waste_collected', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    operator: {
      type: String,
      enum: ['gte', 'lte', 'eq'],
      default: 'gte'
    }
  },
  reward: {
    aquaCoins: {
      type: Number,
      required: true,
      min: 0
    },
    nftMetadata: {
      type: String
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ rarity: 1 });

export default mongoose.model<IAchievement>('Achievement', achievementSchema);