import mongoose from 'mongoose';
import { logger } from '@careerpilot/shared';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot';
    console.log("MONGO_URI =", process.env.MONGO_URI);
    await mongoose.connect(mongoURI);
    logger.info('MongoDB Connected successfully.');
  } catch (error: any) {
    logger.error('MongoDB connection error:', { error: error.message });
    process.exit(1);
  }
};
