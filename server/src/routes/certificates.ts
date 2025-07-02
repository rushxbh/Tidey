import express from 'express';
import { body, validationResult } from 'express-validator';
import Certificate, { ICertificate } from '../models/Certificate';
import Event from '../models/Event';
import Attendance from '../models/Attendance';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const router = express.Router();

// Issue certificate for completed event
router.post('/issue/:eventId', authenticateToken, requireRole(['volunteer']), asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const event = await Event.findById(req.params.eventId).populate('organizer', 'name organizationName');
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Certificate can only be issued for completed events'
    });
  }

  // Check if volunteer attended the event
  const attendance = await Attendance.findOne({
    event: event._id,
    volunteer: req.user!._id,
    status: 'checked-out'
  });

  if (!attendance) {
    return res.status(400).json({
      success: false,
      message: 'You must have attended this event to receive a certificate'
    });
  }

  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({
    volunteer: req.user!._id,
    event: event._id
  });

  if (existingCertificate) {
    return res.status(400).json({
      success: false,
      message: 'Certificate already issued for this event'
    });
  }

  const certificateId = uuidv4();
  
  const certificate = new Certificate({
    volunteer: req.user!._id,
    event: event._id,
    certificateId,
    metadata: {
      volunteerName: req.user!.name,
      eventTitle: event.title,
      eventDate: event.date,
      hoursWorked: attendance.hoursWorked || 0,
      wasteCollected: event.wasteCollected,
      organizationName: (event.organizer as any).organizationName || (event.organizer as any).name
    },
    status: 'pending'
  });

  await certificate.save();

  // Call Certifier API to mint certificate
  try {
    const certifierResponse = await axios.post('https://api.certifier.io/v1/credentials', {
      credentialId: certificateId,
      recipientName: req.user!.name,
      recipientEmail: req.user!.email,
      templateId: process.env.CERTIFIER_TEMPLATE_ID || 'default-template',
      data: {
        eventTitle: event.title,
        eventDate: event.date.toLocaleDateString(),
        hoursWorked: attendance.hoursWorked || 0,
        organizationName: (event.organizer as any).organizationName || (event.organizer as any).name,
        wasteCollected: event.wasteCollected || 0
      }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CERTIFIER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    certificate.blockchainHash = certifierResponse.data.blockchainHash;
    certificate.ipfsHash = certifierResponse.data.ipfsHash;
    certificate.status = 'issued';
    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      certificate: {
        certificateId,
        blockchainHash: certificate.blockchainHash,
        ipfsHash: certificate.ipfsHash,
        downloadUrl: certifierResponse.data.downloadUrl
      }
    });
  } catch (error) {
    console.error('Certifier API error:', error);
    certificate.status = 'failed';
    await certificate.save();

    res.status(500).json({
      success: false,
      message: 'Failed to mint certificate on blockchain'
    });
  }
}));

// Get user's certificates
router.get('/my-certificates', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const certificates = await Certificate.find({ volunteer: req.user!._id })
    .populate('event', 'title date location')
    .sort({ issuedAt: -1 });

  res.json({
    success: true,
    certificates
  });
}));

// Verify certificate
router.get('/verify/:certificateId', asyncHandler(async (req: express.Request, res: express.Response) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate('volunteer', 'name email')
    .populate('event', 'title date location organizer');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  res.json({
    success: true,
    certificate: {
      certificateId: certificate.certificateId,
      volunteerName: certificate.metadata.volunteerName,
      eventTitle: certificate.metadata.eventTitle,
      eventDate: certificate.metadata.eventDate,
      hoursWorked: certificate.metadata.hoursWorked,
      organizationName: certificate.metadata.organizationName,
      issuedAt: certificate.issuedAt,
      blockchainHash: certificate.blockchainHash,
      status: certificate.status
    }
  });
}));

export default router;