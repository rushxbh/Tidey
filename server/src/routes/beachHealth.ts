import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import sharp from 'sharp';
import BeachHealthScore, { IBeachHealthScore } from '../models/BeachHealthScore';
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

// Upload beach image for ML analysis
router.post('/scan', authenticateToken, requireRole(['ngo']), upload.single('image'), [
  body('location').trim().notEmpty().withMessage('Location is required'),
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

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'beach-health');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Process and save image
    const filename = `${Date.now()}-${req.user!._id}-beach-scan.jpg`;
    const filepath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    const imageUrl = `/uploads/beach-health/${filename}`;

    // Simulate ML analysis (in real implementation, this would call your ML model)
    const mockAnalysis = {
      wasteAmount: Math.floor(Math.random() * 40) + 60, // 60-100
      waterQuality: Math.floor(Math.random() * 30) + 70, // 70-100
      biodiversity: Math.floor(Math.random() * 35) + 65, // 65-100
      humanImpact: Math.floor(Math.random() * 25) + 75, // 75-100
    };

    // Create beach health score record
    const beachHealthScore = new BeachHealthScore({
      location: {
        name: req.body.location,
        coordinates: {
          latitude: req.body.latitude ? parseFloat(req.body.latitude) : 0,
          longitude: req.body.longitude ? parseFloat(req.body.longitude) : 0
        }
      },
      factors: mockAnalysis,
      photos: [imageUrl],
      assessedBy: req.user!._id,
      assessmentDate: new Date()
    });

    await beachHealthScore.save();

    res.json({
      success: true,
      message: 'Beach health analysis completed',
      result: {
        id: beachHealthScore._id,
        location: req.body.location,
        healthScore: beachHealthScore.score,
        factors: mockAnalysis,
        imageUrl,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Beach health scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process beach health scan'
    });
  }
}));

// Get scan history for NGO
router.get('/scans', authenticateToken, requireRole(['ngo']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const scans = await BeachHealthScore.find({ assessedBy: req.user!._id })
    .sort({ assessmentDate: -1 })
    .limit(20);

  const formattedScans = scans.map(scan => ({
    id: scan._id,
    location: scan.location.name,
    coordinates: scan.location.coordinates,
    imageUrl: scan.photos[0] || '',
    healthScore: scan.score,
    factors: scan.factors,
    scanDate: scan.assessmentDate,
    status: 'completed'
  }));

  res.json({
    success: true,
    scans: formattedScans
  });
}));

// Get latest beach health data (public endpoint)
router.get('/latest', asyncHandler(async (req: express.Request, res: express.Response) => {
  const latestScans = await BeachHealthScore.aggregate([
    {
      $sort: { assessmentDate: -1 }
    },
    {
      $group: {
        _id: '$location.name',
        latestScan: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: { newRoot: '$latestScan' }
    },
    {
      $limit: 10
    }
  ]);

  const beaches = latestScans.map(scan => ({
    location: scan.location.name,
    score: scan.score,
    lastUpdated: getTimeAgo(scan.assessmentDate)
  }));

  res.json({
    success: true,
    beaches
  });
}));

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default router;