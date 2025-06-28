import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User';
import Event from '../models/Event';
import Attendance from '../models/Attendance';
import { authenticateToken as authenticate } from '../middleware/auth';
import { requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = await User.findById(req.user!._id).select('-password');
  res.json(user);
}));

// Get user statistics
router.get('/stats', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const userId = req.user!._id;
  
  if (req.user!.role === 'volunteer') {
    // Get volunteer statistics
    const attendanceRecords = await Attendance.find({ volunteer: userId });
    const completedEvents = attendanceRecords.filter(record => record.status === 'checked-out');
    
    const totalHours = completedEvents.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    const eventsJoined = attendanceRecords.length;
    
    const stats = {
      eventsJoined,
      totalHours,
      aquaCoins: req.user!.aquaCoins || 0,
      achievements: req.user!.achievements?.length || 0
    };
    
    res.json(stats);
  } else {
    // Get NGO statistics
    const events = await Event.find({ organizer: userId });
    const totalVolunteers = events.reduce((sum, event) => sum + event.currentParticipants, 0);
    const completedEvents = events.filter(event => event.status === 'completed');
    const totalWasteCollected = completedEvents.reduce((sum, event) => sum + (event.wasteCollected || 0), 0);
    
    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter(event => event.status === 'upcoming' || event.status === 'ongoing').length,
      totalVolunteers,
      totalWasteCollected
    };
    
    res.json(stats);
  }
}));

// Get volunteers list (NGO only)
router.get('/volunteers', authenticate, requireRole(['ngo']), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim()
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Build filter for volunteers who participated in this NGO's events
  const ngoEvents = await Event.find({ organizer: req.user!._id }).select('_id');
  const eventIds = ngoEvents.map(event => event._id);
  
  const attendanceRecords = await Attendance.find({ event: { $in: eventIds } }).distinct('volunteer');
  
  const filter: any = {
    _id: { $in: attendanceRecords },
    role: 'volunteer'
  };

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const volunteers = await User.find(filter)
    .select('-password')
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  // Get additional stats for each volunteer
  const volunteersWithStats = await Promise.all(
    volunteers.map(async (volunteer) => {
      const volunteerAttendance = await Attendance.find({
        volunteer: volunteer._id,
        event: { $in: eventIds }
      });
      
      const eventsWithNGO = volunteerAttendance.length;
      const hoursWithNGO = volunteerAttendance.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
      
      return {
        ...volunteer.toObject(),
        eventsWithNGO,
        hoursWithNGO
      };
    })
  );

  res.json({
    volunteers: volunteersWithStats,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get leaderboard
router.get('/leaderboard', [
  query('type').optional().isIn(['weekly', 'monthly', 'yearly', 'all-time']).withMessage('Invalid leaderboard type'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const type = req.query.type as string || 'all-time';
  const limit = parseInt(req.query.limit as string) || 10;

  // Calculate date range based on type
  let dateFilter: any = {};
  const now = new Date();
  
  switch (type) {
    case 'weekly':
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      dateFilter = { createdAt: { $gte: weekStart } };
      break;
    case 'monthly':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: monthStart } };
      break;
    case 'yearly':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: yearStart } };
      break;
    default:
      // all-time - no date filter
      break;
  }

  // Aggregate volunteer statistics
  const leaderboard = await User.aggregate([
    { $match: { role: 'volunteer', ...dateFilter } },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'volunteer',
        as: 'attendances'
      }
    },
    {
      $addFields: {
        totalHours: { $sum: '$attendances.hoursWorked' },
        eventsCompleted: {
          $size: {
            $filter: {
              input: '$attendances',
              cond: { $eq: ['$$this.status', 'checked-out'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            { $multiply: ['$totalHours', 10] },
            { $multiply: ['$eventsCompleted', 50] },
            { $ifNull: ['$aquaCoins', 0] }
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: limit },
    {
      $project: {
        name: 1,
        profilePicture: 1,
        location: 1,
        totalHours: 1,
        eventsCompleted: 1,
        aquaCoins: 1,
        score: 1
      }
    }
  ]);

  // Add rank to each user
  const rankedLeaderboard = leaderboard.map((user, index) => ({
    ...user,
    rank: index + 1
  }));

  res.json({
    type,
    leaderboard: rankedLeaderboard
  });
}));

export default router;