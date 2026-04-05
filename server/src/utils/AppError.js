// src/utils/AppError.js

/**
 * Operational errors — errors we anticipate and can describe to the client.
 * Programmer errors (bugs) are NOT AppErrors; they bubble up as 500s.
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode  = statusCode;
    this.status      = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.code        = code;          // machine-readable error code e.g. 'FLASK_DOWN'
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
