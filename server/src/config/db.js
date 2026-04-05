// src/config/db.js
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS:          45000,
  maxPoolSize:              10,
};

let retries = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS);
    retries = 0;
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    retries += 1;
    logger.error(`MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${err.message}`);

    if (retries < MAX_RETRIES) {
      const delay = Math.min(1000 * 2 ** retries, 30000); // exponential backoff, cap 30s
      logger.info(`Retrying in ${delay / 1000}s…`);
      setTimeout(connectDB, delay);
    } else {
      logger.error('Max MongoDB connection retries reached. Exiting.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected — attempting reconnect…');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB runtime error: ${err.message}`);
});

export default connectDB;
