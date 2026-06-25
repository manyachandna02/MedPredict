// src/config/axios.js
import axios from 'axios';
import logger from '../utils/logger.js';

const flaskClient = axios.create({
  baseURL: process.env.FLASK_URL || 'http://127.0.0.1:5000',
  timeout: Number(process.env.FLASK_TIMEOUT_MS) || 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
console.log("Flask Base URL:", process.env.FLASK_URL);

export default flaskClient;
// ── Request interceptor: log outgoing calls ───────────
flaskClient.interceptors.request.use(
  (config) => {
    logger.debug(`→ Flask ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: log & normalise errors ──────
flaskClient.interceptors.response.use(
  (response) => {
    logger.debug(`← Flask ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      logger.error('Flask ML service is unreachable (ECONNREFUSED)');
      error.isFlaskDown = true;
    } else if (error.code === 'ECONNABORTED') {
      logger.error('Flask ML service request timed out');
      error.isFlaskTimeout = true;
    } else {
      logger.error(`Flask error: ${error.response?.status} — ${error.message}`);
    }
    return Promise.reject(error);
  },
);

export default flaskClient;
