import dotenv from 'dotenv';

// Load environment variables first, before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import userRoutes from './routes/users';
import rewardRoutes from './routes/rewards';
import achievementRoutes from './routes/achievements';
import certificateRoutes from './routes/certificates';
import eventImageRoutes from './routes/eventImages';
import qrRoutes from './routes/qr';
import beachHealthRoutes from './routes/beachHealth';
import walletRegisterRoutes from "./routes/walletRegister";

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  skip: (req) => process.env.NODE_ENV === 'development'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/event-images', eventImageRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/beach-health', beachHealthRoutes);
app.use("/api/wallet-register", walletRegisterRoutes);
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;