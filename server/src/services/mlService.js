// src/services/mlService.js
import flaskClient from '../config/axios.js';
import AppError    from '../utils/AppError.js';
import logger      from '../utils/logger.js';

// Supported disease endpoints on the Flask service
const SUPPORTED_DISEASES = new Set(['stroke', 'diabetes', 'heart']);

/**
 * Calls the Flask ML microservice for a given disease prediction.
 *
 * Flask contract (POST /predict/<disease>):
 *   Request body:  { "features": [val1, val2, ...] }
 *   Response body: { "prediction": 0|1, "probability": 0.0–1.0 }
 *
 * @param {string}   disease  - 'stroke' | 'diabetes' | 'heart'
 * @param {number[]} features - ordered numeric feature array
 * @returns {{ prediction: number, risk: number, latencyMs: number }}
 */
const callFlaskPredict = async (disease, features) => {
  if (!SUPPORTED_DISEASES.has(disease)) {
    throw new AppError(`Unsupported disease type: "${disease}"`, 400, 'INVALID_DISEASE');
  }

  if (!Array.isArray(features) || features.length === 0) {
    throw new AppError('features must be a non-empty array', 400, 'INVALID_FEATURES');
  }

  const t0 = Date.now();

  try {
    const response = await flaskClient.post(`/predict/${disease}`, { features });
    const latencyMs = Date.now() - t0;

    const { prediction, probability } = response.data;

    // Validate Flask response shape
    if (prediction === undefined || probability === undefined) {
      logger.error('Flask returned unexpected payload', { data: response.data });
      throw new AppError('Malformed response from ML service', 502, 'FLASK_BAD_RESPONSE');
    }

    if (![0, 1].includes(Number(prediction))) {
      throw new AppError('Flask prediction must be 0 or 1', 502, 'FLASK_BAD_RESPONSE');
    }

    const risk = parseFloat(probability);
    if (isNaN(risk) || risk < 0 || risk > 1) {
      throw new AppError('Flask probability must be a float in [0, 1]', 502, 'FLASK_BAD_RESPONSE');
    }

    logger.info(`ML prediction complete — disease: ${disease}, prediction: ${prediction}, risk: ${risk.toFixed(4)}, latency: ${latencyMs}ms`);

    return {
      prediction: Number(prediction),
      risk,
      latencyMs,
    };
  } catch (err) {
  console.log("=========== FLASK ERROR ===========");
  console.log("Status:", err.response?.status);
  console.log("Data:", err.response?.data);
  console.log("Message:", err.message);
  console.log("===================================");

  // Re-throw AppErrors as-is
  if (err.isOperational) throw err;

  // Flask unreachable
  if (err.isFlaskDown) {
    throw new AppError(
      "ML prediction service is currently unavailable. Please try again shortly.",
      503,
      "FLASK_DOWN"
    );
  }

  throw err;
}

export default { callFlaskPredict };
