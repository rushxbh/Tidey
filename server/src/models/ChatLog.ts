import mongoose, { Document, Schema } from 'mongoose';

export interface IChatLog extends Document {
  user: mongoose.Types.ObjectId;
  sessionId: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
  context: 'general' | 'event' | 'rewards' | 'support';
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatLogSchema = new Schema<IChatLog>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    type: String,
    enum: ['general', 'event', 'rewards', 'support'],
    default: 'general'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    location: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatLogSchema.index({ user: 1, createdAt: -1 });
chatLogSchema.index({ sessionId: 1 });

export default mongoose.model<IChatLog>('ChatLog', chatLogSchema);