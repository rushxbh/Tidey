import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Reward from '../models/Reward';
import User from '../models/User';
import { authenticateToken as authenticate } from '../middleware/auth';
import { requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Get all rewards with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['merchandise', 'experience', 'donation']).withMessage('Invalid category'),
  query('maxCost').optional().isInt({ min: 0 }).withMessage('Max cost must be a positive number'),
  query('inStock').optional().isBoolean().withMessage('In stock must be a boolean')
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};
  
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  if (req.query.maxCost) {
    filter.cost = { $lte: parseInt(req.query.maxCost as string) };
  }
  
  if (req.query.inStock !== undefined) {
    filter.inStock = req.query.inStock === 'true';
  }

  const rewards = await Reward.find(filter)
    .populate('createdBy', 'name organizationName')
    .sort({ cost: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Reward.countDocuments(filter);

  res.json({
    rewards,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get single reward
router.get('/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const reward = await Reward.findById(req.params.id)
    .populate('createdBy', 'name organizationName')
    .populate('reviews.user', 'name profilePicture');

  if (!reward) {
    return res.status(404).json({ message: 'Reward not found' });
  }

  res.json(reward);
}));

// Create reward (NGO only)
router.post('/', authenticate, requireRole(['ngo']), [
  body('name').trim().isLength({ min: 3, max: 200 }).withMessage('Name must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('cost').isInt({ min: 1 }).withMessage('Cost must be a positive integer'),
  body('category').isIn(['merchandise', 'experience', 'donation']).withMessage('Invalid category'),
  body('image').isURL().withMessage('Image must be a valid URL'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const rewardData = {
    ...req.body,
    createdBy: req.user!._id
  };

  const reward = new Reward(rewardData);
  await reward.save();

  await reward.populate('createdBy', 'name organizationName');

  res.status(201).json({
    message: 'Reward created successfully',
    reward
  });
}));

// Update reward (NGO only, own rewards)
router.put('/:id', authenticate, requireRole(['ngo']), [
  body('name').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Name must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('cost').optional().isInt({ min: 1 }).withMessage('Cost must be a positive integer'),
  body('inStock').optional().isBoolean().withMessage('In stock must be a boolean'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const reward = await Reward.findOne({ _id: req.params.id, createdBy: req.user!._id });
  
  if (!reward) {
    return res.status(404).json({ message: 'Reward not found or unauthorized' });
  }

  const allowedUpdates = ['name', 'description', 'cost', 'inStock', 'stockQuantity'];
  const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
  
  updates.forEach(update => {
    (reward as any)[update] = req.body[update];
  });

  await reward.save();
  await reward.populate('createdBy', 'name organizationName');

  res.json({
    message: 'Reward updated successfully',
    reward
  });
}));

// Delete reward (NGO only, own rewards)
router.delete('/:id', authenticate, requireRole(['ngo']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const reward = await Reward.findOne({ _id: req.params.id, createdBy: req.user!._id });
  
  if (!reward) {
    return res.status(404).json({ message: 'Reward not found or unauthorized' });
  }

  // Don't allow deletion if reward has been redeemed
  if (reward.redemptions.length > 0) {
    return res.status(400).json({ message: 'Cannot delete reward that has been redeemed' });
  }

  await Reward.findByIdAndDelete(req.params.id);

  res.json({ message: 'Reward deleted successfully' });
}));

// Redeem reward (Volunteer only)
router.post('/:id/redeem', authenticate, requireRole(['volunteer']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const reward = await Reward.findById(req.params.id);
  
  if (!reward) {
    return res.status(404).json({ message: 'Reward not found' });
  }

  if (!reward.inStock) {
    return res.status(400).json({ message: 'Reward is out of stock' });
  }

  const user = req.user!;
  
  if ((user.aquaCoins || 0) < reward.cost) {
    return res.status(400).json({ message: 'Insufficient AquaCoins' });
  }

  // Check stock quantity
  if (reward.stockQuantity !== undefined && reward.stockQuantity <= 0) {
    return res.status(400).json({ message: 'Reward is out of stock' });
  }

  // Deduct AquaCoins from user
  await User.findByIdAndUpdate(user._id, {
    $inc: { aquaCoins: -reward.cost }
  });

  // Add redemption record
  reward.redemptions.push({
    user: user._id as import('mongoose').Types.ObjectId,
    date: new Date(),
    status: 'pending'
  });

  // Update stock if applicable
  if (reward.stockQuantity !== undefined) {
    reward.stockQuantity -= 1;
    if (reward.stockQuantity === 0) {
      reward.inStock = false;
    }
  }

  await reward.save();

  res.json({
    message: 'Reward redeemed successfully',
    redemption: {
      reward: reward.name,
      cost: reward.cost,
      status: 'pending'
    }
  });
}));

// Add review (Volunteer only, must have redeemed)
router.post('/:id/review', authenticate, requireRole(['volunteer']), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const reward = await Reward.findById(req.params.id);
  
  if (!reward) {
    return res.status(404).json({ message: 'Reward not found' });
  }

  // Check if user has redeemed this reward
  const hasRedeemed = reward.redemptions.some(
    redemption => redemption.user.toString() === req.user!._id as any
  );

  if (!hasRedeemed) {
    return res.status(400).json({ message: 'You must redeem this reward before reviewing' });
  }

  // Check if user has already reviewed
  const existingReview = reward.reviews.find(
    review => review.user.toString() === req.user!._id as any
  );

  if (existingReview) {
    return res.status(400).json({ message: 'You have already reviewed this reward' });
  }

  // Add review
  reward.reviews.push({
    user: req.user!._id as import('mongoose').Types.ObjectId,
    rating: req.body.rating,
    comment: req.body.comment || '',
    date: new Date()
  });

  // Recalculate rating
  reward.calculateRating();
  await reward.save();

  res.json({
    message: 'Review added successfully',
    rating: reward.rating
  });
}));

export default router;