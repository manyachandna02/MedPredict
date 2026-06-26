// src/config/axios.js
import axios from 'axios';
import logger from '../utils/logger.js';

const flaskClient = axios.create({
  baseURL: process.env.FLASK_URL || 'http://127.0.0.1:5000',
  timeout: Number(process.env.FLASK_TIMEOUT_MS) || 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
console.log("Flask Base URL:", process.env.FLASK_URL);

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
  console.error("========== FLASK ERROR ==========");
  console.error("Base URL:", flaskClient.defaults.baseURL);
  console.error("Request URL:", error.config?.url);
  console.error("Method:", error.config?.method);
  console.error("Status:", error.response?.status);
  console.error("Response Body:", error.response?.data);
  console.error("Message:", error.message);
  console.error("================================");

  if (error.code === 'ECONNREFUSED') {
    logger.error('Flask ML service is unreachable (ECONNREFUSED)');
    error.isFlaskDown = true;
  } else if (error.code === 'ECONNABORTED') {
    logger.error('Flask ML service request timed out');
    error.isFlaskTimeout = true;
  }

  return Promise.reject(error);
},