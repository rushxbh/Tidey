import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Event, { IEvent } from '../models/Event';
import User, { IUser } from '../models/User';
import Attendance from '../models/Attendance';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Get all events with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('location').optional().trim(),
  query('date').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
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
    .populate('organizer', 'name organizationName email')
    .sort({ date: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Event.countDocuments(filter);

  res.json({
    success: true,
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get single event
router.get('/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name organizationName email')
    .populate('participants', 'name email profilePicture');

  if (!event) {
    return res.status(404).json({ 
      success: false,
      message: 'Event not found' 
    });
  }

  res.json({
    success: true,
    event
  });
}));

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
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
  }

  // Validate that event date is not in the past (allow same day with future time)
  const eventDate = new Date(req.body.date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  
  if (eventDay < today) {
    return res.status(400).json({
      success: false,
      message: 'Event date cannot be in the past'
    });
  }

  // If it's today, check if start time is in the future
  if (eventDay.getTime() === today.getTime()) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = req.body.startTime.split(':').map(Number);
    const eventStartTime = startHour * 60 + startMinute;
    
    if (eventStartTime <= currentTime) {
      return res.status(400).json({
        success: false,
        message: 'Event start time must be in the future for same-day events'
      });
    }
  }

  // Validate that end time is after start time
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  if (startTime >= endTime) {
    return res.status(400).json({
      success: false,
      message: 'End time must be after start time'
    });
  }

  const eventData = {
    ...req.body,
    organizer: req.user!._id,
    currentParticipants: 0,
    participants: [],
    status: 'upcoming'
  };

  const event = new Event(eventData);
  await event.save();

  await event.populate('organizer', 'name organizationName email');

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    event
  });
}));

// Update event (NGO only, own events)
router.put('/:id', authenticateToken, requireRole(['ngo']), [
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('maxParticipants').optional().isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000'),
  body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('wasteCollected').optional().isFloat({ min: 0 }).withMessage('Waste collected must be a positive number')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
  }

  const event = await Event.findOne({ 
    _id: req.params.id, 
    organizer: req.user!._id 
  });
  
  if (!event) {
    return res.status(404).json({ 
      success: false,
      message: 'Event not found or unrequireRoled' 
    });
  }

  // Prevent reducing max participants below current participants
  if (req.body.maxParticipants && req.body.maxParticipants < event.currentParticipants) {
    return res.status(400).json({
      success: false,
      message: 'Cannot reduce max participants below current participant count'
    });
  }

  // Handle status transitions
  if (req.body.status && req.body.status !== event.status) {
    const validTransitions: { [key: string]: string[] } = {
      'upcoming': ['ongoing', 'cancelled'],
      'ongoing': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[event.status].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${event.status} to ${req.body.status}`
      });
    }

    // Award AquaCoins when event is completed
    if (req.body.status === 'completed' && event.status !== 'completed') {
      const attendances = await Attendance.find({ 
        event: event._id, 
        status: { $in: ['checked-in', 'checked-out'] }
      });

      // Award coins to participants (50 coins per event completion)
      const coinReward = 50;
      for (const attendance of attendances) {
        await User.findByIdAndUpdate(attendance.volunteer, {
          $inc: { aquaCoins: coinReward }
        });
      }
    }
  }

  const allowedUpdates = [
    'title', 
    'description', 
    'maxParticipants', 
    'status', 
    'requirements', 
    'providedEquipment',
    'wasteCollected',
    'beachHealthScoreBefore',
    'beachHealthScoreAfter'
  ];
  
  const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
  
  updates.forEach(update => {
    (event as any)[update] = req.body[update];
  });

  await event.save();
  await event.populate('organizer', 'name organizationName email');

  res.json({
    success: true,
    message: 'Event updated successfully',
    event
  });
}));

// Delete event (NGO only, own events)
router.delete('/:id', authenticateToken, requireRole(['ngo']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findOne({ 
    _id: req.params.id, 
    organizer: req.user!._id 
  });
  
  if (!event) {
    return res.status(404).json({ 
      success: false,
      message: 'Event not found or unrequireRoled' 
    });
  }

  // Don't allow deletion if event has participants and is not cancelled
  if (event.participants.length > 0 && event.status !== 'cancelled') {
    return res.status(400).json({ 
      success: false,
      message: 'Cannot delete event with registered participants. Cancel the event first.' 
    });
  }

  // Delete related attendance records
  await Attendance.deleteMany({ event: event._id });

  // Delete the event
  await Event.findByIdAndDelete(req.params.id);

  res.json({ 
    success: true,
    message: 'Event deleted successfully' 
  });
}));

// Register for event (Volunteer only)
router.post('/:id/register', authenticateToken, requireRole(['volunteer']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({ 
      success: false,
      message: 'Event not found' 
    });
  }

  if (event.status !== 'upcoming') {
    return res.status(400).json({ 
      success: false,
      message: 'Cannot register for this event. Event is not accepting registrations.' 
    });
  }

  if (event.currentParticipants >= event.maxParticipants) {
    return res.status(400).json({ 
      success: false,
      message: 'Event is full' 
    });
  }

  // Check if already registered
  const existingAttendance = await Attendance.findOne({
    event: event._id,
    volunteer: req.user!._id
  });

  if (existingAttendance) {
    return res.status(400).json({ 
      success: false,
      message: 'Already registered for this event' 
    });
  }

  // Create attendance record
  const attendance = new Attendance({
    event: event._id,
    volunteer: req.user!._id,
    status: 'registered'
  });

  await attendance.save();

  // Update event participants
  event.participants.push(req.user!._id as any);
  event.currentParticipants += 1;
  await event.save();

  // Update user stats
  await User.findByIdAndUpdate(req.user!._id, {
    $inc: { eventsJoined: 1 }
  });

  res.json({ 
    success: true,
    message: 'Successfully registered for event' 
  });
}));

// Unregister from event (Volunteer only)
router.delete('/:id/register', authenticateToken, requireRole(['volunteer']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({ 
      success: false,
      message: 'Event not found' 
    });
  }

  if (event.status !== 'upcoming') {
    return res.status(400).json({ 
      success: false,
      message: 'Cannot unregister from this event' 
    });
  }

  // Find and remove attendance record
  const attendance = await Attendance.findOneAndDelete({
    event: event._id,
    volunteer: req.user!._id
  });

  if (!attendance) {
    return res.status(400).json({ 
      success: false,
      message: 'Not registered for this event' 
    });
  }

  // Update event participants
  event.participants = event.participants.filter(
    (participantId) => participantId.toString() !== req.user!._id as any
  );
  event.currentParticipants -= 1;
  await event.save();

  // Update user stats
  await User.findByIdAndUpdate(req.user!._id, {
    $inc: { eventsJoined: -1 }
  });

  res.json({ 
    success: true,
    message: 'Successfully unregistered from event' 
  });
}));

// Get event participants (NGO only, own events)
router.get('/:id/participants', authenticateToken, requireRole(['ngo']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findOne({ 
    _id: req.params.id, 
    organizer: req.user!._id 
  }).populate('participants', 'name email phone profilePicture');
  
  if (!event) {
    return res.status(404).json({ 
      success: false,
      message: 'Event not found or unrequireRoled' 
    });
  }

  // Get attendance records for additional info
  const attendances = await Attendance.find({ event: event._id })
    .populate('volunteer', 'name email phone profilePicture');

  res.json({
    success: true,
    participants: event.participants,
    attendances
  });
}));

// Check-in volunteer (NGO only, own events)
router.post('/:id/checkin/:volunteerId', authenticateToken, requireRole(['ngo']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findOne({ 
    _id: req.params.id, 
    organizer: req.user!._id 
  });
  
  if (!event) {
    return res.status(404).json({ 
      success: false,
      message: 'Event not found or unrequireRoled' 
    });
  }

  if (event.status !== 'ongoing') {
    return res.status(400).json({
      success: false,
      message: 'Event must be ongoing to check in volunteers'
    });
  }

  const attendance = await Attendance.findOne({
    event: event._id,
    volunteer: req.params.volunteerId
  });

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Volunteer not registered for this event'
    });
  }

  if (attendance.status !== 'registered') {
    return res.status(400).json({
      success: false,
      message: 'Volunteer already checked in'
    });
  }

  attendance.status = 'checked-in';
  attendance.checkInTime = new Date();
  attendance.qrCodeScanned = true;
  await attendance.save();

  res.json({
    success: true,
    message: 'Volunteer checked in successfully'
  });
}));

// Check-out volunteer (NGO only, own events)
router.post('/:id/checkout/:volunteerId', authenticateToken, requireRole(['ngo']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findOne({ 
    _id: req.params.id, 
    organizer: req.user!._id 
  });
  
  if (!event) {
    return res.status(404).json({ 
      success: false,
      message: 'Event not found or unrequireRoled' 
    });
  }

  const attendance = await Attendance.findOne({
    event: event._id,
    volunteer: req.params.volunteerId
  });

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Volunteer not registered for this event'
    });
  }

  if (attendance.status !== 'checked-in') {
    return res.status(400).json({
      success: false,
      message: 'Volunteer must be checked in first'
    });
  }

  attendance.status = 'checked-out';
  attendance.checkOutTime = new Date();
  await attendance.save();

  // Update volunteer's total hours
  if (attendance.hoursWorked) {
    await User.findByIdAndUpdate(req.params.volunteerId, {
      $inc: { totalHoursVolunteered: attendance.hoursWorked }
    });
  }

  res.json({
    success: true,
    message: 'Volunteer checked out successfully',
    hoursWorked: attendance.hoursWorked
  });
}));

export default router;