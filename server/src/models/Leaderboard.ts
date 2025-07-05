import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaderboard extends Document {
  type: 'weekly' | 'monthly' | 'yearly' | 'all-time';
  period: {
    start: Date;
    end: Date;
  };
  rankings: {
    user: mongoose.Types.ObjectId;
    rank: number;
    score: number;
    metrics: {
      eventsJoined: number;
      hoursVolunteered: number;
      wasteCollected: number;
      aquaCoinsEarned: number;
    };
  }[];
  lastUpdated: Date;
  transaction_hash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboard>({
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', 'all-time'],
    required: true
  },
  period: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  rankings: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rank: {
      type: Number,
      required: true,
      min: 1
    },
    score: {
      type: Number,
      required: true,
      min: 0
    },
    metrics: {
      eventsJoined: {
        type: Number,
        default: 0,
        min: 0
      },
      hoursVolunteered: {
        type: Number,
        default: 0,
        min: 0
      },
      wasteCollected: {
        type: Number,
        default: 0,
        min: 0
      },
      aquaCoinsEarned: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  transaction_hash: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for unique leaderboard periods
leaderboardSchema.index({ type: 1, 'period.start': 1, 'period.end': 1 }, { unique: true });

export default mongoose.model<ILeaderboard>('Leaderboard', leaderboardSchema);