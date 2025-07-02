import mongoose, { Document, Schema } from 'mongoose';

export interface IBeachHealthScore extends Document {
  event?: mongoose.Types.ObjectId;
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  score: number;
  factors: {
    wasteAmount: number;
    waterQuality: number;
    biodiversity: number;
    humanImpact: number;
  };
  photos: string[];
  assessedBy: mongoose.Types.ObjectId;
  assessmentDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const beachHealthScoreSchema = new Schema<IBeachHealthScore>({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  location: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    }
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  factors: {
    wasteAmount: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    waterQuality: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    biodiversity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    humanImpact: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  photos: [{
    type: String
  }],
  assessedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Calculate overall score based on factors
beachHealthScoreSchema.pre('save', function(next) {
  const { wasteAmount, waterQuality, biodiversity, humanImpact } = this.factors;
  this.score = Math.round((wasteAmount + waterQuality + biodiversity + humanImpact) / 4);
  next();
});

// Indexes for better query performance
beachHealthScoreSchema.index({ 'location.coordinates': '2dsphere' });
beachHealthScoreSchema.index({ assessmentDate: -1 });

export default mongoose.model<IBeachHealthScore>('BeachHealthScore', beachHealthScoreSchema);