// src/middleware/validate.js
import AppError from '../utils/AppError.js';

/**
 * Ensures req.body.features is present and is either an array or plain object.
 * Detailed validation (field names, value types, counts) happens in the controller
 * where disease-specific schemas are available.
 */
export const requireFeatures = (req, _res, next) => {
  const { features } = req.body;

  if (features === undefined || features === null) {
    return next(new AppError('Request body must include a "features" key.', 400, 'MISSING_FEATURES'));
  }

  const isArray  = Array.isArray(features);
  const isObject = typeof features === 'object' && !isArray;

  if (!isArray && !isObject) {
    return next(new AppError(
      '"features" must be an array or a named-field object.',
      400,
      'INVALID_FEATURES_FORMAT',
    ));
  }

  next();
};

/**
 * Validates pagination query params.
 */
export const validatePagination = (req, _res, next) => {
  const { limit, page } = req.query;

  if (limit && (isNaN(limit) || Number(limit) < 1)) {
    return next(new AppError('"limit" must be a positive integer.', 400, 'INVALID_QUERY'));
  }
  if (page && (isNaN(page) || Number(page) < 1)) {
    return next(new AppError('"page" must be a positive integer.', 400, 'INVALID_QUERY'));
  }

  next();
};
