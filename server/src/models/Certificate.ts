import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  volunteer: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  certificateId: string;
  blockchainHash?: string;
  ipfsHash?: string;
  metadata: {
    volunteerName: string;
    eventTitle: string;
    eventDate: Date;
    hoursWorked: number;
    wasteCollected?: number;
    organizationName: string;
  };
  issuedAt: Date;
  status: 'pending' | 'issued' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>({
  volunteer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  blockchainHash: {
    type: String
  },
  ipfsHash: {
    type: String
  },
  metadata: {
    volunteerName: {
      type: String,
      required: true
    },
    eventTitle: {
      type: String,
      required: true
    },
    eventDate: {
      type: Date,
      required: true
    },
    hoursWorked: {
      type: Number,
      required: true,
      min: 0
    },
    wasteCollected: {
      type: Number,
      min: 0
    },
    organizationName: {
      type: String,
      required: true
    }
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'issued', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
certificateSchema.index({ volunteer: 1, event: 1 }, { unique: true });


export default mongoose.model<ICertificate>('Certificate', certificateSchema);