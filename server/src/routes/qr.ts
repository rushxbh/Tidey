import express from 'express';
import QRCode from 'qrcode';
import Event from '../models/Event';
import Attendance from '../models/Attendance';
import User from '../models/User';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Generate QR code for event check-in
router.get('/generate/:eventId', authenticateToken, requireRole(['ngo']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findOne({
    _id: req.params.eventId,
    organizer: req.user!._id
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found or unauthorized'
    });
  }

  if (event.status !== 'ongoing') {
    return res.status(400).json({
      success: false,
      message: 'QR code can only be generated for ongoing events'
    });
  }

  try {
    // Generate QR code data
    const qrData = {
      eventId: event._id,
      action: 'checkin',
      timestamp: Date.now()
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      eventTitle: event.title
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
}));

// Scan QR code for check-in
router.post('/scan', authenticateToken, requireRole(['volunteer']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { qrData } = req.body;

  if (!qrData) {
    return res.status(400).json({
      success: false,
      message: 'QR data is required'
    });
  }

  try {
    const parsedData = JSON.parse(qrData);
    const { eventId, action } = parsedData;

    if (action !== 'checkin') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code action'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: 'Event is not currently ongoing'
      });
    }

    // Find attendance record
    const attendance = await Attendance.findOne({
      event: eventId,
      volunteer: req.user!._id
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    if (attendance.status === 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Already checked in'
      });
    }

    if (attendance.status === 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Already checked out'
      });
    }

    // Update attendance
    attendance.status = 'checked-in';
    attendance.checkInTime = new Date();
    attendance.qrCodeScanned = true;
    await attendance.save();

    res.json({
      success: true,
      message: 'Successfully checked in to event',
      event: {
        title: event.title,
        checkInTime: attendance.checkInTime
      }
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid QR code format'
    });
  }
}));

// Check-out from event
router.post('/checkout/:eventId', authenticateToken, requireRole(['volunteer']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findById(req.params.eventId);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  const attendance = await Attendance.findOne({
    event: event._id,
    volunteer: req.user!._id
  });

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'You are not registered for this event'
    });
  }

  if (attendance.status !== 'checked-in') {
    return res.status(400).json({
      success: false,
      message: 'You must be checked in to check out'
    });
  }

  // Update attendance
  attendance.status = 'checked-out';
  attendance.checkOutTime = new Date();
  await attendance.save();

  // Update user's total hours
  if (attendance.hoursWorked) {
    await User.findByIdAndUpdate(req.user!._id, {
      $inc: { totalHoursVolunteered: attendance.hoursWorked }
    });
  }

  res.json({
    success: true,
    message: 'Successfully checked out from event',
    hoursWorked: attendance.hoursWorked
  });
}));

export default router;