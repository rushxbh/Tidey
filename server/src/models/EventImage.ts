import mongoose, { Document, Schema } from 'mongoose';

export interface IEventImage extends Document {
  event: mongoose.Types.ObjectId;
  volunteer: mongoose.Types.ObjectId;
  imageUrl: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  beforeAfter: 'before' | 'after';
  approved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  coinsAwarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventImageSchema = new Schema<IEventImage>({
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
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  beforeAfter: {
    type: String,
    enum: ['before', 'after'],
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  coinsAwarded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventImageSchema.index({ event: 1, volunteer: 1 });
eventImageSchema.index({ approved: 1 });

export default mongoose.model<IEventImage>('EventImage', eventImageSchema);