import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export const connectDB = async (): Promise<void> => {
  try {
    // Use MongoDB URI if provided, otherwise use in-memory database
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('🗄️  Starting in-memory MongoDB instance...');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('🗄️  In-memory MongoDB started successfully');
    }
    
    await mongoose.connect(mongoUri!);
    
    console.log('🗄️  MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      if (mongod) {
        await mongod.stop();
      }
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};