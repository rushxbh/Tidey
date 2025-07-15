import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import sharp from 'sharp';
import BeachHealthScore, { IBeachHealthScore } from '../models/BeachHealthScore';
// Removed authenticateToken and requireRole imports as they will not be used directly on routes
// import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
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

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'less than an hour ago';
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

// Upload beach image for ML analysis
// TEMPORARY: Removed authenticateToken and requireRole for debugging purposes.
// REVERT FOR PRODUCTION!
router.post('/scan', upload.single('image'), [
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], asyncHandler(async (req: express.Request, res: express.Response) => { // Changed AuthRequest to express.Request
  // Add logging for authentication status - these logs will now always show 'User not authenticated'
  console.log('[/scan] Request received.');
  console.log('[/scan] Authentication middleware bypassed for debugging.');

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

  // TEMPORARY: Assign a dummy userId since authentication is bypassed
  // REVERT FOR PRODUCTION! In production, userId must come from req.user.userId after authentication.
  const userId = 'dummyUserIdForDebugging'; 
  console.warn('WARNING: Using dummy userId for debugging. REVERT FOR PRODUCTION!');

  // Extract location, latitude, and longitude from request body
  const { location, latitude, longitude } = req.body;

  let imageUrl: string;

  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary API credentials are not set in environment variables.');
      throw new Error('Cloudinary configuration missing.');
    }

    // 1. Upload image to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    console.log('Attempting to upload image to Cloudinary...');
    const cloudinaryUploadResult = await cloudinary.v2.uploader.upload(dataURI, {
      folder: 'beach-scans', // Optional: organize uploads in a specific folder
      resource_type: 'image',
    });

    console.log('Cloudinary Upload Result:', cloudinaryUploadResult);

    if (!cloudinaryUploadResult.secure_url) {
      throw new Error('Cloudinary upload failed: secure_url not returned.');
    }
    imageUrl = cloudinaryUploadResult.secure_url;

    // 2. Call ML API with the Cloudinary image URL
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000/analyze'; // Ensure this matches your ML API URL
    console.log(`Calling ML API at: ${mlApiUrl} with image URL: ${imageUrl}`);
    
    const mlResponse = await axios.post(mlApiUrl, {
      image_url: imageUrl,
      return_annotated_image: true // Request annotated image from ML model
    });

    const mlAnalysisResult = mlResponse.data;
    console.log('ML Analysis Result:', mlAnalysisResult);

    // Map ML analysis result to IMLAnalysis structure
    const mappedMLAnalysis = {
      wasteTypes: mlAnalysisResult.detected_objects.map((obj: any) => obj.description),
      pollutionLevel: mlAnalysisResult.category, // Use the category from ML as pollution level
      // Ensure recommendations is always an array of strings. Split and filter empty strings.
      recommendations: mlAnalysisResult.recommendations ? mlAnalysisResult.recommendations.split('. ').filter((s: string) => s.trim() !== '') : [], 
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
        name: location,
        coordinates: {
          latitude: latitude ? parseFloat(latitude) : 0,
          longitude: longitude ? parseFloat(longitude) : 0
        }
      },
      score: mlAnalysisResult.cleanliness_score, // Use the score from ML analysis
      factors: { // Populate factors from ML if available, otherwise use dummy/derived
        // Ensure calculations result in values between 0 and 100
        wasteAmount: Math.min(100, Math.max(0, Math.round((1 - (mlAnalysisResult.detected_objects.filter((obj: any) => obj.category.includes('plastic') || obj.category.includes('debris')).length / (mlAnalysisResult.detected_objects.length || 1))) * 100))),
        waterQuality: Math.min(100, Math.max(0, Math.round(mlAnalysisResult.overall_confidence * 100))), // Example: use overall confidence for water quality
        biodiversity: Math.min(100, Math.max(0, Math.round(mlAnalysisResult.beach_characteristics.natural_elements.vegetation * 100))), // Example: use vegetation score
        humanImpact: Math.min(100, Math.max(0, 100 - mlAnalysisResult.cleanliness_score)) // Inverse of cleanliness score, clamped
      },
      photos: [imageUrl],
      annotatedImageUrl: mlAnalysisResult.annotated_image_base64 ? `data:image/jpeg;base64,${mlAnalysisResult.annotated_image_base64}` : undefined,
      mlAnalysis: mappedMLAnalysis,
      assessedBy: userId, // Use userId from authentication
      assessmentDate: new Date()
    });

    await beachHealthScore.save();

    res.json({
      success: true,
      message: 'Beach health analysis completed',
      result: {
        id: beachHealthScore._id,
        location: location,
        healthScore: beachHealthScore.score,
        factors: beachHealthScore.factors,
        imageUrl: imageUrl,
        annotatedImageUrl: beachHealthScore.annotatedImageUrl,
        mlAnalysis: beachHealthScore.mlAnalysis,
        status: 'completed'
      }
    });
  } catch (error: any) {
    console.error('Beach health scan error:', error);
    // Handle specific errors from Cloudinary or ML API
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: `ML API Error: ${error.response.data.detail || error.message}`
      });
    }
    // Catch Cloudinary errors or other generic errors
    return res.status(500).json({
      success: false,
      message: 'Failed to process beach health scan',
      error: error.message || 'An unknown error occurred'
    });
  }
}));

// Get scan history for NGO
// TEMPORARY: Removed authenticateToken and requireRole for debugging purposes.
// REVERT FOR PRODUCTION!
router.get('/scans', asyncHandler(async (req: express.Request, res: express.Response) => { // Changed AuthRequest to express.Request
  // Add logging for authentication status - these logs will now always show 'User not authenticated'
  console.log('[/scans] Request received.');
  console.log('[/scans] Authentication middleware bypassed for debugging.');

  // TEMPORARY: Assign a dummy userId since authentication is bypassed
  // REVERT FOR PRODUCTION! In production, userId must come from req.user.userId after authentication.
  const userId = 'dummyUserIdForDebugging'; 
  console.warn('WARNING: Using dummy userId for debugging. REVERT FOR PRODUCTION!');

  const scans = await BeachHealthScore.find({ assessedBy: userId })
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

export default router;
