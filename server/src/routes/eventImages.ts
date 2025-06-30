import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import sharp from 'sharp';
import EventImage, { IEventImage } from '../models/EventImage';
import Event from '../models/Event';
import User from '../models/User';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload event image
router.post('/upload/:eventId', authenticateToken, requireRole(['volunteer']), upload.single('image'), [
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('beforeAfter').isIn(['before', 'after']).withMessage('beforeAfter must be either "before" or "after"'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Image file is required'
    });
  }

  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user participated in the event
  if (!event.participants.includes(req.user!._id as any)) {
    return res.status(403).json({
      success: false,
      message: 'You must be a participant of this event to upload images'
    });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'events');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Process and save image
    const filename = `${Date.now()}-${req.user!._id}-${req.params.eventId}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    const imageUrl = `/uploads/events/${filename}`;

    // Create event image record
    const eventImage = new EventImage({
      event: event._id,
      volunteer: req.user!._id,
      imageUrl,
      description: req.body.description,
      beforeAfter: req.body.beforeAfter,
      location: req.body.latitude && req.body.longitude ? {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude)
      } : undefined
    });

    await eventImage.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: eventImage
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
}));

// Submit images for approval and coin reward
router.post('/submit/:eventId', authenticateToken, requireRole(['volunteer']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Event must be completed to submit images'
    });
  }

  // Check if user has uploaded images for this event
  const userImages = await EventImage.find({
    event: event._id,
    volunteer: req.user!._id
  });

  if (userImages.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No images found for this event'
    });
  }

  // Check if already submitted
  const alreadyAwarded = userImages.some(img => img.coinsAwarded);
  if (alreadyAwarded) {
    return res.status(400).json({
      success: false,
      message: 'Coins already awarded for this event'
    });
  }

  // Auto-approve images and award coins (in a real app, this would require NGO approval)
  const coinReward = 25; // 25 coins for submitting event images
  
  await EventImage.updateMany(
    { event: event._id, volunteer: req.user!._id },
    { 
      approved: true, 
      approvedAt: new Date(),
      coinsAwarded: true 
    }
  );

  await User.findByIdAndUpdate(req.user!._id, {
    $inc: { aquaCoins: coinReward }
  });

  res.json({
    success: true,
    message: 'Images submitted successfully and coins awarded',
    coinsAwarded: coinReward
  });
}));

// Get event images (for NGOs to review)
router.get('/event/:eventId', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user is organizer or participant
  const isOrganizer = event.organizer.toString() === req.user!._id as any;
  const isParticipant = event.participants.includes(req.user!._id as any);

  if (!isOrganizer && !isParticipant) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const images = await EventImage.find({ event: event._id })
    .populate('volunteer', 'name profilePicture')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    images
  });
}));

// Approve image (NGO only)
router.post('/approve/:imageId', authenticateToken, requireRole(['ngo']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const image = await EventImage.findById(req.params.imageId).populate('event');
  
  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  const event = image.event as any;
  if (event.organizer.toString() !== req.user!._id as any) {
    return res.status(403).json({
      success: false,
      message: 'You can only approve images for your own events'
    });
  }

  image.approved = true;
  image.approvedBy = req.user!._id as any;
  image.approvedAt = new Date();
  await image.save();

  res.json({
    success: true,
    message: 'Image approved successfully'
  });
}));

export default router;