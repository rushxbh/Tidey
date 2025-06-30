import express from 'express'
import { body, validationResult } from 'express-validator'

import User from '../models/User'
import { authenticateToken as authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

import jwt from 'jsonwebtoken'
import { sign, SignOptions } from 'jsonwebtoken';

//const token = (jwt as any).sign(...)


const router = express.Router()

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['volunteer', 'ngo']).withMessage('Role must be either volunteer or ngo')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password, role, ...otherFields } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create user
    const userData: any = {
      name,
      email,
      password,
      role
    }

    // Add role-specific fields
    if (role === 'volunteer') {
      if (otherFields.phone) userData.phone = otherFields.phone
      if (otherFields.location) userData.location = otherFields.location
      if (otherFields.bio) userData.bio = otherFields.bio
    } else if (role === 'ngo') {
      if (otherFields.organizationName) userData.organizationName = otherFields.organizationName
      if (otherFields.organizationDescription) userData.organizationDescription = otherFields.organizationDescription
      if (otherFields.website) userData.website = otherFields.website
      if (otherFields.phone) userData.phone = otherFields.phone
    }

    const user = new User(userData)
    await user.save()
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    // Generate token
    const token = sign(
      
  { userId: user._id },
  process.env.JWT_SECRET || 'fallback-secret-key',
  {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']
  }
);


    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
})

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: express.Request, res: express.Response) => {
  try {
    console.log('LOGIN ATTEMPT:', req.body); // Log incoming payload

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']
      }
    );

    console.log('Login successful:', user.email);
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});


// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
});


// Update profile
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim().isLength({ min: 10, max: 15 }),
  body('location').optional().trim().isLength({ max: 200 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('organizationName').optional().trim().isLength({ max: 200 }),
  body('website').optional().isURL(),
  body('organizationDescription').optional().trim().isLength({ max: 1000 })
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const allowedFields = ['name', 'phone', 'location', 'bio', 'organizationName', 'website', 'organizationDescription']
    const updates: any = {}

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      updates,
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    })
  }
})

export default router