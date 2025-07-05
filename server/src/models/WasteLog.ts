import mongoose, { Document, Schema } from 'mongoose';

export interface IWasteLog extends Document {
  event: mongoose.Types.ObjectId;
  volunteer: mongoose.Types.ObjectId;
  wasteType: 'plastic' | 'glass' | 'metal' | 'paper' | 'organic' | 'other';
  quantity: number;
  unit: 'kg' | 'pieces';
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  photos: string[];
  description?: string;
  timestamp: Date;
  transaction_hash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const wasteLogSchema = new Schema<IWasteLog>({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  volunteer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    enum: ['plastic', 'glass', 'metal', 'paper', 'organic', 'other'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'pieces'],
    required: true
  },
  location: {
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
  photos: [{
    type: String
  }],
  description: {
    type: String,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  transaction_hash: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
wasteLogSchema.index({ event: 1, volunteer: 1 });
wasteLogSchema.index({ wasteType: 1 });
wasteLogSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model<IWasteLog>('WasteLog', wasteLogSchema);