import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Achievement, { IAchievement } from '../models/Achievement';
import UserAchievement, { IUserAchievement } from '../models/UserAchievement';
import User, { IUser } from '../models/User';
import Attendance from '../models/Attendance';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Seed achievements data
const seedAchievements = async () => {
  const achievementsData = [
    {
      name: 'First Steps',
      description: 'Complete your first beach cleanup event',
      icon: '🏆',
      category: 'participation',
      criteria: { type: 'events_joined', value: 1, operator: 'gte' },
      reward: { aquaCoins: 50 },
      rarity: 'common'
    },
    {
      name: 'Team Player',
      description: 'Participate in 5 beach cleanup events',
      icon: '👥',
      category: 'participation',
      criteria: { type: 'events_joined', value: 5, operator: 'gte' },
      reward: { aquaCoins: 150 },
      rarity: 'rare'
    },
    {
      name: 'Ocean Guardian',
      description: 'Volunteer for 20+ hours in beach cleanups',
      icon: '🌊',
      category: 'impact',
      criteria: { type: 'hours_volunteered', value: 20, operator: 'gte' },
      reward: { aquaCoins: 200 },
      rarity: 'rare'
    },
    {
      name: 'Eco Warrior',
      description: 'Complete 10 beach cleanup events',
      icon: '⚡',
      category: 'participation',
      criteria: { type: 'events_joined', value: 10, operator: 'gte' },
      reward: { aquaCoins: 300 },
      rarity: 'epic'
    },
    {
      name: 'Beach Champion',
      description: 'Volunteer for 50+ hours in beach cleanups',
      icon: '♻️',
      category: 'impact',
      criteria: { type: 'hours_volunteered', value: 50, operator: 'gte' },
      reward: { aquaCoins: 500 },
      rarity: 'epic'
    },
    {
      name: 'Cleanup Legend',
      description: 'Participate in 25 beach cleanup events',
      icon: '🏅',
      category: 'participation',
      criteria: { type: 'events_joined', value: 25, operator: 'gte' },
      reward: { aquaCoins: 750 },
      rarity: 'legendary'
    },
    {
      name: 'Ocean Protector',
      description: 'Volunteer for 100+ hours in beach cleanups',
      icon: '🛡️',
      category: 'impact',
      criteria: { type: 'hours_volunteered', value: 100, operator: 'gte' },
      reward: { aquaCoins: 1000 },
      rarity: 'legendary'
    },
    {
      name: 'Early Bird',
      description: 'Join 3 events before 8 AM',
      icon: '🌅',
      category: 'special',
      criteria: { type: 'custom', value: 3, operator: 'gte' },
      reward: { aquaCoins: 100 },
      rarity: 'rare'
    },
    {
      name: 'Weekend Warrior',
      description: 'Participate in 15 weekend cleanup events',
      icon: '⚔️',
      category: 'participation',
      criteria: { type: 'events_joined', value: 15, operator: 'gte' },
      reward: { aquaCoins: 400 },
      rarity: 'epic'
    },
    {
      name: 'Community Leader',
      description: 'Recruit 5 new volunteers to events',
      icon: '👑',
      category: 'leadership',
      criteria: { type: 'custom', value: 5, operator: 'gte' },
      reward: { aquaCoins: 300 },
      rarity: 'epic'
    },
    {
      name: 'Consistency King',
      description: 'Participate in events for 6 consecutive months',
      icon: '📅',
      category: 'participation',
      criteria: { type: 'custom', value: 6, operator: 'gte' },
      reward: { aquaCoins: 600 },
      rarity: 'legendary'
    }
  ];

  try {
    for (const achievementData of achievementsData) {
      const existingAchievement = await Achievement.findOne({ name: achievementData.name });
      if (!existingAchievement) {
        await Achievement.create(achievementData);
      }
    }
    console.log('✅ Achievements seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
  }
};

// Seed achievements on server start
seedAchievements();

// Get all achievements with user progress
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const achievements = await Achievement.find({ isActive: true }).sort({ category: 1, rarity: 1 });
  
  // Get user's progress for each achievement
  const userAchievements = await UserAchievement.find({ user: req.user!._id });
  const userAchievementMap = new Map();
  
  userAchievements.forEach(ua => {
    userAchievementMap.set(ua.achievement.toString(), ua);
  });

  const achievementsWithProgress = achievements.map(achievement => {
    const userProgress = userAchievementMap.get(achievement._id as any);
    return {
      ...achievement.toObject(),
      userProgress: userProgress ? {
        progress: userProgress.progress,
        completed: userProgress.completed,
        completedAt: userProgress.completedAt
      } : {
        progress: 0,
        completed: false,
        completedAt: null
      }
    };
  });

  res.json({
    success: true,
    achievements: achievementsWithProgress
  });
}));

// Get user's completed achievements
router.get('/completed', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const completedAchievements = await UserAchievement.find({
    user: req.user!._id,
    completed: true
  }).populate('achievement').sort({ completedAt: -1 });

  res.json({
    success: true,
    achievements: completedAchievements
  });
}));

// Check and update achievement progress
router.post('/check-progress', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = req.user!;
  const achievements = await Achievement.find({ isActive: true });
  const newlyCompleted = [];

  for (const achievement of achievements) {
    let currentValue = 0;

    // Calculate current value based on achievement type
    switch (achievement.criteria.type) {
      case 'events_joined':
        currentValue = user.eventsJoined || 0;
        break;
      case 'hours_volunteered':
        currentValue = user.totalHoursVolunteered || 0;
        break;
      case 'waste_collected':
        // Calculate from attendance records
        const attendances = await Attendance.find({ volunteer: user._id, status: 'checked-out' });
        // This would need to be calculated from waste logs in a real implementation
        currentValue = 0;
        break;
    }

    // Check if criteria is met
    let criteriaMetValue = false;
    switch (achievement.criteria.operator) {
      case 'gte':
        criteriaMetValue = currentValue >= achievement.criteria.value;
        break;
      case 'lte':
        criteriaMetValue = currentValue <= achievement.criteria.value;
        break;
      case 'eq':
        criteriaMetValue = currentValue === achievement.criteria.value;
        break;
    }

    // Update or create user achievement
    let userAchievement = await UserAchievement.findOne({
      user: user._id,
      achievement: achievement._id
    });

    if (!userAchievement) {
      userAchievement = new UserAchievement({
        user: user._id,
        achievement: achievement._id,
        progress: currentValue,
        completed: criteriaMetValue
      });
    } else {
      userAchievement.progress = currentValue;
      if (criteriaMetValue && !userAchievement.completed) {
        userAchievement.completed = true;
        userAchievement.completedAt = new Date();
      }
    }

    await userAchievement.save();

    // Award coins if newly completed
    if (criteriaMetValue && !userAchievement.coinsAwarded) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { aquaCoins: achievement.reward.aquaCoins }
      });
      
      userAchievement.coinsAwarded = true;
      await userAchievement.save();
      
      newlyCompleted.push({
        achievement: achievement.name,
        coinsAwarded: achievement.reward.aquaCoins
      });
    }
  }

  res.json({
    success: true,
    message: 'Achievement progress updated',
    newlyCompleted
  });
}));

// Create achievement (Admin only - for seeding)
router.post('/', authenticateToken, requireRole(['ngo']), [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').isIn(['participation', 'impact', 'leadership', 'special']).withMessage('Invalid category'),
  body('criteria.type').isIn(['events_joined', 'hours_volunteered', 'waste_collected', 'custom']).withMessage('Invalid criteria type'),
  body('criteria.value').isInt({ min: 1 }).withMessage('Criteria value must be positive'),
  body('reward.aquaCoins').isInt({ min: 1 }).withMessage('Reward coins must be positive'),
  body('rarity').isIn(['common', 'rare', 'epic', 'legendary']).withMessage('Invalid rarity')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const achievement = new Achievement(req.body);
  await achievement.save();

  res.status(201).json({
    success: true,
    message: 'Achievement created successfully',
    achievement
  });
}));

export default router;