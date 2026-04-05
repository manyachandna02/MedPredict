// src/middleware/errorHandler.js
import logger from '../utils/logger.js';

// ─── Transform known Mongoose errors into AppErrors ──────────────────────────
const handleMongooseCastError = (err) => ({
  statusCode: 400,
  status:     'fail',
  message:    `Invalid ${err.path}: "${err.value}" is not a valid ID.`,
  code:       'INVALID_ID',
});

const handleMongooseValidationError = (err) => ({
  statusCode: 422,
  status:     'fail',
  message:    Object.values(err.errors).map((e) => e.message).join(' | '),
  code:       'VALIDATION_ERROR',
});

const handleMongoDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return {
    statusCode: 409,
    status:     'fail',
    message:    `Duplicate value for "${field}". Please use a different value.`,
    code:       'DUPLICATE_KEY',
  };
};

// ─── Main error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, status = 'error', message, code } = err;

  // Mongoose-specific normalisation
  if (err.name === 'CastError')             ({ statusCode, status, message, code } = handleMongooseCastError(err));
  if (err.name === 'ValidationError')       ({ statusCode, status, message, code } = handleMongooseValidationError(err));
  if (err.code === 11000)                   ({ statusCode, status, message, code } = handleMongoDuplicateKey(err));

  const isProd = process.env.NODE_ENV === 'production';

  // Log the error
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.path} → ${statusCode}`, {
      message,
      stack: err.stack,
      body:  req.body,
    });
  } else {
    logger.warn(`${req.method} ${req.path} → ${statusCode}: ${message}`);
  }

  // Never leak stack traces in production
  res.status(statusCode).json({
    status,
    code:    code || null,
    message: isProd && statusCode >= 500 ? 'An unexpected error occurred. Please try again.' : message,
    ...(isProd ? {} : { stack: err.stack }),
  });
};

export default errorHandler;
