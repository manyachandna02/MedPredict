// src/routes/predictionRoutes.js
import { Router } from 'express';
import {
  predictStroke,
  predictDiabetes,
  predictHeart,
  getHistory,
  deletePrediction,
} from '../controllers/predictionController.js';
import { requireFeatures, validatePagination } from '../middleware/validate.js';

const router = Router();

// ── Prediction endpoints ──────────────────────────────
// POST /api/stroke
router.post('/stroke',   requireFeatures, predictStroke);

// POST /api/diabetes
router.post('/diabetes', requireFeatures, predictDiabetes);

// POST /api/heart
router.post('/heart',    requireFeatures, predictHeart);

// ── History ───────────────────────────────────────────
// GET /api/history?limit=10&page=1&disease=stroke
router.get('/history', validatePagination, getHistory);

// ── Delete ────────────────────────────────────────────
// DELETE /api/predictions/:id
router.delete('/predictions/:id', deletePrediction);

export default router;
