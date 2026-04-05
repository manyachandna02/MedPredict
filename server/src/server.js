// src/server.js
import 'dotenv/config';
import http    from 'http';
import app     from './app.js';
import connectDB from './config/db.js';
import logger  from './utils/logger.js';

const PORT = process.env.PORT || 8000;

// ── Connect to DB then start HTTP server ──────────────────────────────────────
await connectDB();

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`MedPredict API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  logger.info(`Health check → http://localhost:${PORT}/health`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully…`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      const mongoose = (await import('mongoose')).default;
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    } catch (err) {
      logger.error(`Error closing MongoDB: ${err.message}`);
    }

    process.exit(0);
  });

  // Force exit after 10s if server.close() stalls
  setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// ── Unhandled rejection safety net ───────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception — exiting immediately', { message: err.message, stack: err.stack });
  process.exit(1);
});
