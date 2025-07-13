import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import sharp from 'sharp';
import BeachHealthScore, { IBeachHealthScore } from '../models/BeachHealthScore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import axios from 'axios'; // Import axios for making HTTP requests to ML API
import cloudinary from 'cloudinary'; // Import cloudinary
import dotenv from 'dotenv'; // For loading environment variables

dotenv.config(); // Load environment variables from .env file

const router = express.Router();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for image uploads (still using memory storage for Cloudinary)
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
    // 1. Upload image to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    const cloudinaryUploadResult = await cloudinary.v2.uploader.upload(dataURI, {
      folder: 'beach-scans', // Optional: organize uploads in a specific folder
      resource_type: 'image',
    });

    const imageUrl = cloudinaryUploadResult.secure_url;

    // 2. Call ML API with the Cloudinary image URL
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000/analyze'; // Ensure this matches your ML API URL
    const mlResponse = await axios.post(mlApiUrl, {
      image_url: imageUrl,
      return_annotated_image: true // Request annotated image from ML model
    });

    const mlAnalysisResult = mlResponse.data;

    // Map ML analysis result to IMLAnalysis structure
    const mappedMLAnalysis = {
      wasteTypes: mlAnalysisResult.detected_objects.map((obj: any) => obj.description),
      pollutionLevel: mlAnalysisResult.category, // Use the category from ML as pollution level
      recommendations: mlAnalysisResult.recommendations.split('. '), // Split recommendations string into array
      overallConfidence: mlAnalysisResult.overall_confidence,
      detailedAnalysis: mlAnalysisResult.detailed_analysis,
      detectedObjects: mlAnalysisResult.detected_objects.map((obj: any) => ({
        category: obj.category,
        confidence: obj.confidence,
        severity: obj.severity,
        description: obj.description,
        boundingBox: obj.bounding_box ? {
          x: obj.bounding_box.x,
          y: obj.bounding_box.y,
          width: obj.bounding_box.width,
          height: obj.bounding_box.height,
        } : undefined,
      })),
    };

    // 3. Create beach health score record
    const beachHealthScore = new BeachHealthScore({
      location: {
        name: req.body.location,
        coordinates: {
          latitude: req.body.latitude ? parseFloat(req.body.latitude) : 0,
          longitude: req.body.longitude ? parseFloat(req.body.longitude) : 0
        }
      },
      score: mlAnalysisResult.cleanliness_score, // Use the score from ML analysis
      factors: { // Populate factors from ML if available, otherwise use dummy/derived
        wasteAmount: Math.round((1 - (mlAnalysisResult.detected_objects.filter((obj: any) => obj.category.includes('plastic') || obj.category.includes('debris')).length / (mlAnalysisResult.detected_objects.length || 1))) * 100),
        waterQuality: Math.round(mlAnalysisResult.overall_confidence * 100), // Example: use overall confidence for water quality
        biodiversity: Math.round(mlAnalysisResult.beach_characteristics.natural_elements.vegetation * 100), // Example: use vegetation score
        humanImpact: Math.round((1 - (mlAnalysisResult.detected_objects.length / 10)) * 100) // Example: inverse of object count
      },
      photos: [imageUrl],
      annotatedImageUrl: mlAnalysisResult.annotated_image_base64 ? `data:image/jpeg;base64,${mlAnalysisResult.annotated_image_base64}` : undefined,
      mlAnalysis: mappedMLAnalysis,
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
        factors: beachHealthScore.factors,
        imageUrl: imageUrl,
        annotatedImageUrl: beachHealthScore.annotatedImageUrl,
        mlAnalysis: beachHealthScore.mlAnalysis,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Beach health scan error:', error);
    // Handle specific errors from Cloudinary or ML API
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: `ML API Error: ${error.response.data.detail || error.message}`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to process beach health scan',
      error: error instanceof Error ? error.message : 'An unknown error occurred'
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
    annotatedImageUrl: scan.annotatedImageUrl || undefined, // Include annotated image
    healthScore: scan.score,
    factors: scan.factors,
    scanDate: scan.assessmentDate,
    mlAnalysis: scan.mlAnalysis, // Include ML analysis
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
