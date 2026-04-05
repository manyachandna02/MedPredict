// src/utils/catchAsync.js

/**
 * Wraps an async Express route handler so that any thrown error
 * is forwarded to Express's global error handler via next(err).
 * Eliminates repetitive try/catch blocks in every controller.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
