import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || '';

const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI not set in environment');
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

export default connectDB;
