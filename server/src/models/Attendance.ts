import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  event: mongoose.Types.ObjectId;
  volunteer: mongoose.Types.ObjectId;
  checkInTime?: Date;
  checkOutTime?: Date;
  hoursWorked?: number;
  qrCodeScanned: boolean;
  status: 'registered' | 'checked-in' | 'checked-out' | 'no-show';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
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
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  hoursWorked: {
    type: Number,
    min: 0,
    max: 24
  },
  qrCodeScanned: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['registered', 'checked-in', 'checked-out', 'no-show'],
    default: 'registered'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to ensure unique attendance per event per volunteer
attendanceSchema.index({ event: 1, volunteer: 1 }, { unique: true });

// Calculate hours worked before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime.getTime() - this.checkInTime.getTime();
    this.hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);