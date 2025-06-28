import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Event from '../models/Event';
import User, { IUser } from '../models/User';
import Attendance from '../models/Attendance';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all events with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('location').optional().trim(),
  query('date').optional().isISO8601().withMessage('Invalid date format')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.location) {
      filter['location.name'] = { $regex: req.query.location, $options: 'i' };
    }
    
    if (req.query.date) {
      const date = new Date(req.query.date as string);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      filter.date = { $gte: date, $lt: nextDay };
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name organizationName')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name organizationName email')
      .populate('participants', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (NGO only)
router.post('/', authenticateToken, requireRole(['ngo']), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('location.name').trim().notEmpty().withMessage('Location name is required'),
  body('location.address').trim().notEmpty().withMessage('Location address is required'),
  body('location.coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:MM)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:MM)'),
  body('maxParticipants').isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array'),
  body('providedEquipment').optional().isArray().withMessage('Provided equipment must be an array')
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer: (req.user as IUser)._id
    };

    const event = new Event(eventData);
    await event.save();

    await event.populate('organizer', 'name organizationName');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (NGO only, own events)
router.put('/:id', authenticateToken, requireRole(['ngo']), [
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('maxParticipants').optional().isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000'),
  body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findOne({ _id: req.params.id, organizer: (req.user as IUser)._id });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const allowedUpdates = ['title', 'description', 'maxParticipants', 'status', 'requirements', 'providedEquipment'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    
    updates.forEach(update => {
      (event as any)[update] = req.body[update];
    });

    await event.save();
    await event.populate('organizer', 'name organizationName');

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (NGO only, own events)
router.delete('/:id', authenticateToken, requireRole(['ngo']), async (req: AuthRequest, res: express.Response) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: (req.user as IUser)._id });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    // Don't allow deletion if event has participants
    if (event.participants.length > 0) {
      return res.status(400).json({ message: 'Cannot delete event with registered participants' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event (Volunteer only)
router.post('/:id/register', authenticateToken, requireRole(['volunteer']), async (req: AuthRequest, res: express.Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Cannot register for this event' });
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const existingAttendance = await Attendance.findOne({
      event: event._id,
      volunteer: (req.user as IUser)._id
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Create attendance record
    const attendance = new Attendance({
      event: event._id,
      volunteer: (req.user as IUser)._id,
      status: 'registered'
    });

    await attendance.save();

    // Update event participants
    event.participants.push((req.user as IUser)._id as any);
    event.currentParticipants += 1;
    await event.save();

    // Update user stats
    await User.findByIdAndUpdate((req.user as IUser)._id, {
      $inc: { eventsJoined: 1 }
    });

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister from event (Volunteer only)
router.delete('/:id/register', authenticateToken, requireRole(['volunteer']), async (req: AuthRequest, res: express.Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Cannot unregister from this event' });
    }

    // Find and remove attendance record
    const attendance = await Attendance.findOneAndDelete({
      event: event._id,
      volunteer: (req.user as IUser)._id
    });

    if (!attendance) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    // Update event participants
    event.participants = event.participants.filter(
      (participantId) => participantId.toString() !== (req.user as IUser)._id as any
    );
    event.currentParticipants -= 1;
    await event.save();

    // Update user stats
    await User.findByIdAndUpdate((req.user as IUser)._id, {
      $inc: { eventsJoined: -1 }
    });

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;