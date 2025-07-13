import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the ML analysis results
export interface IMLAnalysis {
  wasteTypes: string[];
  pollutionLevel: 'low' | 'medium' | 'high' | 'pristine' | 'very clean' | 'clean' | 'moderately clean' | 'needs attention' | 'poor' | 'heavily polluted';
  recommendations: string[];
  overallConfidence: number;
  detailedAnalysis: any; // Store the detailed analysis from ML model
  detectedObjects: Array<{ // Store detected objects with bounding boxes
    category: string;
    confidence: number;
    severity: number;
    description: string;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

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
  photos: string[]; // This will now store Cloudinary URLs
  annotatedImageUrl?: string; // New field for the annotated image URL from ML
  mlAnalysis?: IMLAnalysis; // New field for ML analysis results
  assessedBy: mongoose.Types.ObjectId;
  assessmentDate: Date;
  notes?: string;
  transaction_hash?: string;
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
  annotatedImageUrl: { // Schema field for annotated image URL
    type: String
  },
  mlAnalysis: { // Schema field for ML analysis results
    wasteTypes: [{ type: String }],
    pollutionLevel: { type: String },
    recommendations: [{ type: String }],
    overallConfidence: { type: Number },
    detailedAnalysis: { type: Schema.Types.Mixed }, // Use Mixed for flexible object structure
    detectedObjects: [{
      category: { type: String },
      confidence: { type: Number },
      severity: { type: Number },
      description: { type: String },
      boundingBox: {
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number },
      }
    }]
  },
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
  },
  transaction_hash: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate overall score based on factors (this will be overridden by ML score)
beachHealthScoreSchema.pre('save', function(next) {
  // If ML analysis provides a score, use that. Otherwise, calculate from factors.
  if (this.mlAnalysis && typeof this.mlAnalysis.overallConfidence === 'number') {
    // The ML model's 'cleanliness_score' is a direct score.
    // We'll map it to the 'score' field.
    // For simplicity, let's assume the ML's cleanliness_score directly translates to our score.
    // The ML model returns 'cleanliness_score' directly, so we'll use that.
    // The `factors` field will still be populated with dummy data or derived from ML if possible.
    // For now, let's ensure the `score` is set by the ML result if available.
    // This pre-save hook might need adjustment if ML analysis populates `factors` directly.
    // For now, we'll assume `factors` are still relevant or will be set by the backend.
    // The ML model's `cleanliness_score` is what we want for `score`.
    // We will set this in the `beachHealth.ts` route after ML analysis.
    // So, this pre-save hook will primarily be for cases where ML analysis isn't used (e.g., manual entry).
    // For now, let's keep it as is, and ensure the route sets the score from ML.
  } else {
    const { wasteAmount, waterQuality, biodiversity, humanImpact } = this.factors;
    this.score = Math.round((wasteAmount + waterQuality + biodiversity + humanImpact) / 4);
  }
  next();
});

// Indexes for better query performance
beachHealthScoreSchema.index({ 'location.coordinates': '2dsphere' });
beachHealthScoreSchema.index({ assessmentDate: -1 });

export default mongoose.model<IBeachHealthScore>('BeachHealthScore', beachHealthScoreSchema);
