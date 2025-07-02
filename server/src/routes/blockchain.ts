import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import blockchainService from '../services/blockchainService';
import User from '../models/User';

const router = express.Router();

// Get user's blockchain balance and impact
router.get('/balance', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  try {
    // For demo purposes, we'll use a mock wallet address
    // In production, each user would have their own wallet
    const mockWalletAddress = `0x${(req.user!._id as any).toString().slice(-40).padStart(40, '0')}`;
    
    const balance = await blockchainService.getBalance(mockWalletAddress);
    const impact = await blockchainService.getUserImpact(mockWalletAddress);
    
    res.json({
      success: true,
      walletAddress: mockWalletAddress,
      balance,
      impact
    });
  } catch (error) {
    console.error('Error getting blockchain balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain data'
    });
  }
}));

// Reward event completion (called by system when user completes event)
router.post('/reward-event', authenticateToken, requireRole(['ngo']), [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('hoursVolunteered').isFloat({ min: 0 }).withMessage('Hours volunteered must be a positive number'),
  body('wasteCollected').isFloat({ min: 0 }).withMessage('Waste collected must be a positive number')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { userId, eventId, hoursVolunteered, wasteCollected } = req.body;
    
    // Get user wallet address (mock for demo)
    const userWalletAddress = `0x${userId.slice(-40).padStart(40, '0')}`;
    
    const txHash = await blockchainService.rewardEventCompletion(
      userWalletAddress,
      eventId,
      hoursVolunteered,
      wasteCollected
    );
    
    // Update user's local AquaCoins balance
    const impact = await blockchainService.getUserImpact(userWalletAddress);
    await User.findByIdAndUpdate(userId, {
      aquaCoins: Math.floor(parseFloat(impact.totalCoinsEarned) / 1e18), // Convert from wei
      totalHoursVolunteered: impact.totalHoursVolunteered,
      eventsJoined: impact.eventsCompleted
    });
    
    res.json({
      success: true,
      message: 'Event completion reward processed',
      transactionHash: txHash,
      impact
    });
  } catch (error) {
    console.error('Error rewarding event completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process event completion reward'
    });
  }
}));

// Reward achievement (called by system when user unlocks achievement)
router.post('/reward-achievement', authenticateToken, [
  body('achievementId').notEmpty().withMessage('Achievement ID is required')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { achievementId } = req.body;
    const userWalletAddress = `0x${(req.user!._id as any).toString().slice(-40).padStart(40, '0')}`;
    
    // Check if user already has this achievement on blockchain
    const hasAchievement = await blockchainService.hasAchievement(userWalletAddress, achievementId);
    if (hasAchievement) {
      return res.status(400).json({
        success: false,
        message: 'Achievement already unlocked'
      });
    }
    
    const txHash = await blockchainService.rewardAchievement(userWalletAddress, achievementId);
    
    // Update user's local AquaCoins balance
    const impact = await blockchainService.getUserImpact(userWalletAddress);
    await User.findByIdAndUpdate(req.user!._id, {
      aquaCoins: Math.floor(parseFloat(impact.totalCoinsEarned) / 1e18),
      $addToSet: { achievements: achievementId }
    });
    
    res.json({
      success: true,
      message: 'Achievement reward processed',
      transactionHash: txHash,
      impact
    });
  } catch (error) {
    console.error('Error rewarding achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process achievement reward'
    });
  }
}));

// Spend coins (called when user makes purchase in store)
router.post('/spend-coins', authenticateToken, requireRole(['volunteer']), [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('itemId').notEmpty().withMessage('Item ID is required'),
  body('reason').notEmpty().withMessage('Reason is required')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { amount, itemId, reason } = req.body;
    const user = req.user as { _id: string };
    const userWalletAddress = `0x${user._id.toString().slice(-40).padStart(40, '0')}`;
    
    // Check if user has sufficient balance
    const balance = await blockchainService.getBalance(userWalletAddress);
    const balanceInTokens = parseFloat(balance) / 1e18;
    
    if (balanceInTokens < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient AquaCoin balance'
      });
    }
    
    const txHash = await blockchainService.spendCoins(userWalletAddress, amount, itemId, reason);
    
    // Update user's local AquaCoins balance
    const impact = await blockchainService.getUserImpact(userWalletAddress);
    await User.findByIdAndUpdate(req.user!._id, {
      aquaCoins: Math.floor(parseFloat(impact.totalCoinsEarned) / 1e18) - Math.floor(parseFloat(impact.totalCoinsSpent) / 1e18)
    });
    
    res.json({
      success: true,
      message: 'Coins spent successfully',
      transactionHash: txHash,
      remainingBalance: Math.floor(balanceInTokens - amount)
    });
  } catch (error) {
    console.error('Error spending coins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to spend coins'
    });
  }
}));

// Reward image upload
router.post('/reward-image-upload', authenticateToken, requireRole(['volunteer']), [
  body('eventId').notEmpty().withMessage('Event ID is required')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { eventId } = req.body;
    const userWalletAddress = `0x${(req.user!._id as any).toString().slice(-40).padStart(40, '0')}`;
    
    const txHash = await blockchainService.rewardImageUpload(userWalletAddress, eventId);
    
    // Update user's local AquaCoins balance
    const impact = await blockchainService.getUserImpact(userWalletAddress);
    await User.findByIdAndUpdate(req.user!._id, {
      aquaCoins: Math.floor(parseFloat(impact.totalCoinsEarned) / 1e18)
    });
    
    res.json({
      success: true,
      message: 'Image upload reward processed',
      transactionHash: txHash,
      coinsAwarded: 25
    });
  } catch (error) {
    console.error('Error rewarding image upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process image upload reward'
    });
  }
}));

// Issue certificate NFT
router.post('/issue-certificate', authenticateToken, requireRole(['ngo']), [
  body('volunteerAddress').notEmpty().withMessage('Volunteer address is required'),
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('eventTitle').notEmpty().withMessage('Event title is required'),
  body('hoursWorked').isFloat({ min: 0 }).withMessage('Hours worked must be a positive number'),
  body('wasteCollected').isFloat({ min: 0 }).withMessage('Waste collected must be a positive number'),
  body('organizationName').notEmpty().withMessage('Organization name is required'),
  body('ipfsHash').notEmpty().withMessage('IPFS hash is required')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { volunteerAddress, eventId, eventTitle, hoursWorked, wasteCollected, organizationName, ipfsHash } = req.body;
    
    const txHash = await blockchainService.issueCertificate(
      volunteerAddress,
      eventId,
      eventTitle,
      hoursWorked,
      wasteCollected,
      organizationName,
      ipfsHash
    );
    
    res.json({
      success: true,
      message: 'Certificate issued successfully',
      transactionHash: txHash
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue certificate'
    });
  }
}));

// Get user's certificates
router.get('/certificates', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  try {
    const userWalletAddress = `0x${(req.user!._id as any).toString().slice(-40).padStart(40, '0')}`;
    
    const certificateIds = await blockchainService.getUserCertificates(userWalletAddress);
    
    const certificates = await Promise.all(
      certificateIds.map(async (id) => {
        return await blockchainService.getCertificate(id);
      })
    );
    
    res.json({
      success: true,
      certificates
    });
  } catch (error) {
    console.error('Error getting certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get certificates'
    });
  }
}));

// Get achievement status
router.get('/achievement/:achievementId', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  try {
    const { achievementId } = req.params;
    const userWalletAddress = `0x${(req.user!._id as any).toString().slice(-40).padStart(40, '0')}`;
    
    const hasAchievement = await blockchainService.hasAchievement(userWalletAddress, achievementId);
    
    res.json({
      success: true,
      hasAchievement
    });
  } catch (error) {
    console.error('Error checking achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check achievement status'
    });
  }
}));

export default router;