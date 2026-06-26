// src/routes/healthRoutes.js
import { Router }  from 'express';
import mongoose    from 'mongoose';
import flaskClient from '../config/axios.js';
import logger      from '../utils/logger.js';

const router = Router();

// GET /health — lightweight probe for load balancers / Docker
router.get('/', async (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const mongoStatus = mongoState === 1 ? 'connected' : 'disconnected';

  let flaskStatus = 'unknown';
    try {
      await flaskClient.get('/health', { timeout: 2000 });
      flaskStatus = 'reachable';
    } catch {
      flaskStatus = 'unreachable';
    }

    const healthy  = mongoState === 1 && flaskStatus === 'reachable';
    const httpCode = healthy ? 200 : 503;

    logger.debug(`Health check — mongo: ${mongoStatus}, flask: ${flaskStatus}`);

    res.status(httpCode).json({
      status:    healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        mongo: mongoStatus,
        flask: flaskStatus,
      },
      uptime: process.uptime(),
    });
  });

  export default router;
