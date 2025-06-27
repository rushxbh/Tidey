import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { Request, Response } from 'express'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tidewy')
    console.log('MongoDB Connected Successfully')
  } catch (error) {
    console.error('MongoDB Connection Error:', error)
    process.exit(1)
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  type: {
    type: String,
    enum: ['volunteer', 'ngo'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  // Volunteer specific fields
  age: {
    type: Number,
    required: function(this: any) { return this.type === 'volunteer' }
  },
  location: {
    type: String,
    required: function(this: any) { return this.type === 'volunteer' }
  },
  interests: [{
    type: String,
    enum: ['beach-cleanup', 'marine-conservation', 'waste-management', 'environmental-education']
  }],
  // NGO specific fields
  orgName: {
    type: String,
    required: function(this: any) { return this.type === 'ngo' }
  },
  regNumber: {
    type: String,
    required: function(this: any) { return this.type === 'ngo' }
  },
  website: {
    type: String
  },
  description: {
    type: String,
    required: function(this: any) { return this.type === 'ngo' }
  },
  profileImage: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const User = mongoose.model('User', userSchema)

// JWT Helper Functions
const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
}

// Middleware to authenticate user
const authenticateUser = async (req: Request, res: Response, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' })
    }

    const decoded: any = verifyToken(token)
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token.' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token.' })
  }
}

// Routes

// Register Route
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, userData } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      })
    }

    // Validate user type specific data
    if (userData.role === 'volunteer') {
      if (!userData.age || !userData.location) {
        return res.status(400).json({
          success: false,
          error: 'Age and location are required for volunteers'
        })
      }
    } else if (userData.role === 'ngo') {
      if (!userData.orgName || !userData.regNumber || !userData.description) {
        return res.status(400).json({
          success: false,
          error: 'Organization name, registration number, and description are required for NGOs'
        })
      }
    }

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      type: userData.role || 'volunteer',
      name: userData.name,
      phone: userData.phone,
      ...(userData.role === 'volunteer' && {
        age: userData.age,
        location: userData.location,
        interests: userData.interests || []
      }),
      ...(userData.role === 'ngo' && {
        orgName: userData.orgName,
        regNumber: userData.regNumber,
        website: userData.website,
        description: userData.description
      })
    })

    await newUser.save()

    // Generate JWT token
    const token = generateToken(newUser._id.toString())

    // Return user data without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      type: newUser.type,
      phone: newUser.phone,
      ...(newUser.type === 'volunteer' && {
        age: newUser.age,
        location: newUser.location,
        interests: newUser.interests
      }),
      ...(newUser.type === 'ngo' && {
        orgName: newUser.orgName,
        regNumber: newUser.regNumber,
        website: newUser.website,
        description: newUser.description
      }),
      profileImage: newUser.profileImage,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
      token
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    })
  }
})

// Login Route
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, type } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Check user type if provided
    if (type && user.type !== type) {
      return res.status(401).json({
        success: false,
        error: `Invalid credentials for ${type} account`
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = generateToken(user._id.toString())

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      phone: user.phone,
      ...(user.type === 'volunteer' && {
        age: user.age,
        location: user.location,
        interests: user.interests
      }),
      ...(user.type === 'ngo' && {
        orgName: user.orgName,
        regNumber: user.regNumber,
        website: user.website,
        description: user.description
      }),
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: userResponse,
      token
    })

  } catch (error: any) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    })
  }
})

// Get Current User Route
app.get('/api/auth/me', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      phone: user.phone,
      ...(user.type === 'volunteer' && {
        age: user.age,
        location: user.location,
        interests: user.interests
      }),
      ...(user.type === 'ngo' && {
        orgName: user.orgName,
        regNumber: user.regNumber,
        website: user.website,
        description: user.description
      }),
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }

    res.json({
      success: true,
      data: userResponse
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching user data'
    })
  }
})

// Update Profile Route
app.put('/api/auth/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user._id
    const updateData = req.body

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password
    delete updateData.email
    delete updateData._id
    delete updateData.createdAt

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    const userResponse = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      type: updatedUser.type,
      phone: updatedUser.phone,
      ...(updatedUser.type === 'volunteer' && {
        age: updatedUser.age,
        location: updatedUser.location,
        interests: updatedUser.interests
      }),
      ...(updatedUser.type === 'ngo' && {
        orgName: updatedUser.orgName,
        regNumber: updatedUser.regNumber,
        website: updatedUser.website,
        description: updatedUser.description
      }),
      profileImage: updatedUser.profileImage,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    })

  } catch (error: any) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error updating profile'
    })
  }
})

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', err)
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  })
})

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  })
})

// Start server
const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Promise Rejection:', err)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

startServer()

// Export for testing
export default app