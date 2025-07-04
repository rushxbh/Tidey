import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
  date: Date;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  organizer: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  requirements: string[];
  providedEquipment: string[];
  images: string[];
  wasteCollected?: number;
  beachHealthScoreBefore?: number;
  beachHealthScoreAfter?: number;
  createdAt: Date;
  updatedAt: Date;
  volunteeringHours: number;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    location: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    volunteeringHours: {
      type: Number,
      required: true,
      min: 1,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    providedEquipment: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    wasteCollected: {
      type: Number,
      min: 0,
    },
    beachHealthScoreBefore: {
      type: Number,
      min: 0,
      max: 100,
    },
    beachHealthScoreAfter: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.model<IEvent>("Event", eventSchema);
