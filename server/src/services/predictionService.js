// src/services/predictionService.js
import Prediction from '../models/Prediction.js';
import mlService  from './mlService.js';
import logger     from '../utils/logger.js';

/**
 * Orchestrates a full prediction cycle:
 *   1. Call Flask ML service
 *   2. Persist result to MongoDB
 *   3. Return structured response
 *
 * @param {object} opts
 * @param {string}   opts.disease    - 'stroke' | 'diabetes' | 'heart'
 * @param {number[]} opts.features   - ordered feature array sent to Flask
 * @param {object}   [opts.featureMap] - human-readable field map (for storage/display)
 * @param {string}   [opts.userId]   - optional authenticated user ObjectId
 * @returns {Promise<object>} saved prediction document
 */
const runPrediction = async ({ disease, features, featureMap = {}, userId = null }) => {
  // 1. Call Flask
  const { prediction, risk, latencyMs } = await mlService.callFlaskPredict(disease, features);

  // 2. Persist to MongoDB
  const doc = await Prediction.create({
    disease,
    features,
    featureMap,
    prediction,
    risk,
    userId:         userId || undefined,
    flaskLatencyMs: latencyMs,
  });

  logger.info(`Prediction saved — id: ${doc._id}, disease: ${disease}`);
  return doc;
};

/**
 * Returns the N most recent predictions, optionally filtered by userId.
 *
 * @param {object} opts
 * @param {string} [opts.userId]  - filter by user
 * @param {string} [opts.disease] - filter by disease type
 * @param {number} [opts.limit]   - default 10
 * @param {number} [opts.page]    - 1-indexed, default 1
 */
const getHistory = async ({ userId = null, disease = null, limit = 10, page = 1 } = {}) => {
  const filter = {};
  if (userId)  filter.userId  = userId;
  if (disease) filter.disease = disease;

  const skip  = (page - 1) * limit;
  const total = await Prediction.countDocuments(filter);

  const records = await Prediction
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    records,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete a single prediction by id.
 * Only the owner (or an admin) should be permitted — enforce in controller.
 */
const deleteById = async (id) => {
  return Prediction.findByIdAndDelete(id);
};

export default { runPrediction, getHistory, deleteById };
