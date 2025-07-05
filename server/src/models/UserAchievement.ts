import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAchievement extends Document {
  user: mongoose.Types.ObjectId;
  achievement: mongoose.Types.ObjectId;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  coinsAwarded: boolean;
  transaction_hash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userAchievementSchema = new Schema<IUserAchievement>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  coinsAwarded: {
    type: Boolean,
    default: false
  },
  transaction_hash: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure unique achievement per user
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export default mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema);