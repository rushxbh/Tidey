// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Common fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Volunteer specific fields
  age: {
    type: Number,
    min: 13,
    max: 100
  },
  location: {
    type: String,
    enum: ['Andheri', 'Bandra', 'Colaba', 'Dadar', 'Juhu', 'Malad', 'Versova', 'Other']
  },
  interests: [{
    type: String,
    enum: ['beach-cleanup', 'marine-conservation', 'waste-management', 'environmental-education']
  }],
  // NGO specific fields
  orgName: String,
  regNumber: String,
  website: String,
  description: String,
  // Blockchain integration fields
  walletAddress: String,
  ethTransactions: [{
    txHash: String,
    type: String, // 'donation', 'reward', 'registration'
    amount: String,
    timestamp: Date,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ location: 1 });
userSchema.index({ interests: 1 });

const User = mongoose.model('User', userSchema);

// Activity/Event Schema
const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['beach-cleanup', 'marine-conservation', 'waste-management', 'environmental-education'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  maxVolunteers: {
    type: Number,
    required: true,
    min: 1
  },
  registeredVolunteers: [{
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  rewards: {
    enabled: {
      type: Boolean,
      default: false
    },
    tokenAmount: {
      type: Number,
      default: 0
    },
    contractAddress: String
  }
}, {
  timestamps: true
});

const Activity = mongoose.model('Activity', activitySchema);

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, userData } = req.body;

    // Validate required fields
    if (!email || !password || !userData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      ...userData
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Find user
    const user = await User.findOne({ email, role: userType });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates here
    delete updates.email;    // Don't allow email updates here

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get activities (with filtering)
app.get('/api/activities', async (req, res) => {
  try {
    const { category, location, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (status) filter.status = status;

    const activities = await Activity.find(filter)
      .populate('organizer', 'name orgName role')
      .populate('registeredVolunteers.volunteer', 'name email')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(filter);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create activity (NGO only)
app.post('/api/activities', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ error: 'Only NGOs can create activities' });
    }

    const activity = new Activity({
      ...req.body,
      organizer: req.user.userId
    });

    await activity.save();
    await activity.populate('organizer', 'name orgName role');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      activity
    });
  } catch (error) {
    console.error('Activity creation error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Register for activity (Volunteer only)
app.post('/api/activities/:id/register', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ error: 'Only volunteers can register for activities' });
    }

    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if already registered
    const alreadyRegistered = activity.registeredVolunteers.some(
      reg => reg.volunteer.toString() === req.user.userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Already registered for this activity' });
    }

    // Check if activity is full
    if (activity.registeredVolunteers.length >= activity.maxVolunteers) {
      return res.status(400).json({ error: 'Activity is full' });
    }

    activity.registeredVolunteers.push({
      volunteer: req.user.userId
    });

    await activity.save();

    res.json({
      success: true,
      message: 'Successfully registered for activity'
    });
  } catch (error) {
    console.error('Activity registration error:', error);
    res.status(500).json({ error: 'Failed to register for activity' });
  }
});

// Blockchain integration endpoints

// Update wallet address
app.post('/api/blockchain/wallet', authenticateToken, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { walletAddress },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Wallet address updated successfully',
      user
    });
  } catch (error) {
    console.error('Wallet update error:', error);
    res.status(500).json({ error: 'Failed to update wallet address' });
  }
});

// Record blockchain transaction
app.post('/api/blockchain/transaction', authenticateToken, async (req, res) => {
  try {
    const { txHash, type, amount } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.ethTransactions.push({
      txHash,
      type,
      amount,
      timestamp: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('Transaction record error:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// Get user's blockchain transactions
app.get('/api/blockchain/transactions', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('ethTransactions');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ transactions: user.ethTransactions });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;