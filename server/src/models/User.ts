import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'volunteer' | 'ngo';
  phone?: string;
  profilePicture?: string;
  location?: string;
  bio?: string;
  
  // Volunteer specific fields
  aquaCoins?: number;
  totalHoursVolunteered?: number;
  eventsJoined?: number;
  achievements?: string[];
  
  // NGO specific fields
  organizationName?: string;
  organizationDescription?: string;
  website?: string;
  verified?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['volunteer', 'ngo'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  
  // Volunteer specific fields
  aquaCoins: {
    type: Number,
    default: 0,
    min: 0
  },
  totalHoursVolunteered: {
    type: Number,
    default: 0,
    min: 0
  },
  eventsJoined: {
    type: Number,
    default: 0,
    min: 0
  },
  achievements: [{
    type: String
  }],
  
  // NGO specific fields
  organizationName: {
    type: String,
    trim: true
  },
  organizationDescription: {
    type: String,
    maxlength: 1000
  },
  website: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance

userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser>('User', userSchema);