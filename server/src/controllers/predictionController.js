// src/controllers/predictionController.js
import predictionService from '../services/predictionService.js';
import AppError          from '../utils/AppError.js';
import catchAsync        from '../utils/catchAsync.js';

// ─── Field-order definitions ────────────────────────────────────────────────
// These MUST match the exact order your scikit-learn pipelines were trained on.
// The frontend sends a named featureMap; we build the ordered array here,
// keeping controller logic as the single source of truth for field order.

const FEATURE_SCHEMAS = {
  stroke: {
    fields: ['age', 'hypertension', 'heart_disease', 'glucose', 'bmi'],
    labels: {
      age:           'Age',
      hypertension:  'Hypertension',
      heart_disease: 'Heart Disease',
      glucose:       'Avg. Glucose (mg/dL)',
      bmi:           'BMI',
    },
  },
  diabetes: {
    fields: ['age', 'hypertension', 'heart_disease', 'bmi', 'hba1c', 'glucose'],
    labels: {
      age:           'Age',
      hypertension:  'Hypertension',
      heart_disease: 'Heart Disease',
      bmi:           'BMI',
      hba1c:         'HbA1c Level (%)',
      glucose:       'Blood Glucose (mg/dL)',
    },
  },
  heart: {
    fields: ['age', 'sex', 'cp', 'trestbps', 'chol', 'thalach'],
    labels: {
      age:     'Age',
      sex:     'Sex',
      cp:      'Chest Pain Type',
      trestbps:'Resting Blood Pressure',
      chol:    'Serum Cholesterol',
      thalach: 'Max Heart Rate',
    },
  },
};

/**
 * Validates and extracts an ordered feature array from the request body.
 * Supports two input formats from the frontend:
 *   1. { features: [val, val, ...] }          — raw array (legacy / direct)
 *   2. { features: { age: 45, bmi: 28.7 } }   — named map (preferred)
 */
const extractFeatures = (body, disease) => {
  const schema = FEATURE_SCHEMAS[disease];
  const raw    = body.features;

  if (!raw) {
    throw new AppError('Request body must include a "features" key.', 400, 'MISSING_FEATURES');
  }

  // Format 1: plain array
  if (Array.isArray(raw)) {
    if (raw.length !== schema.fields.length) {
      throw new AppError(
        `Expected ${schema.fields.length} features for ${disease}, received ${raw.length}.`,
        400,
        'FEATURE_COUNT_MISMATCH',
      );
    }
    const parsed = raw.map((v, i) => {
      const num = Number(v);
      if (isNaN(num)) {
        throw new AppError(
          `Feature at index ${i} ("${schema.fields[i]}") is not a valid number.`,
          400,
          'INVALID_FEATURE_VALUE',
        );
      }
      return num;
    });
    // Build featureMap for storage
    const featureMap = {};
    schema.fields.forEach((f, i) => { featureMap[f] = parsed[i]; });
    return { features: parsed, featureMap };
  }

  // Format 2: named object / Map
  if (typeof raw === 'object' && raw !== null) {
    const features   = [];
    const featureMap = {};
    const missing    = [];

    for (const field of schema.fields) {
      const val = raw[field];
      if (val === undefined || val === null || val === '') {
        missing.push(field);
        continue;
      }
      const num = Number(val);
      if (isNaN(num)) {
        throw new AppError(
          `Feature "${field}" (${schema.labels[field]}) is not a valid number.`,
          400,
          'INVALID_FEATURE_VALUE',
        );
      }
      features.push(num);
      featureMap[field] = num;
    }

    if (missing.length > 0) {
      throw new AppError(
        `Missing required features: ${missing.join(', ')}.`,
        400,
        'MISSING_FEATURE_FIELDS',
      );
    }

    return { features, featureMap };
  }

  throw new AppError(
    '"features" must be an array or an object of named values.',
    400,
    'INVALID_FEATURES_FORMAT',
  );
};

// ─── Shared prediction handler ───────────────────────────────────────────────
const handlePredict = (disease) =>
  catchAsync(async (req, res) => {
    const { features, featureMap } = extractFeatures(req.body, disease);
    const userId = req.user?._id ?? null; // set by auth middleware when present

    const doc = await predictionService.runPrediction({
      disease,
      features,
      featureMap,
      userId,
    });

    res.status(201).json({
      status:  'success',
      data: {
        id:          doc._id,
        disease:     doc.disease,
        prediction:  doc.prediction,   // 0 | 1
        risk:        doc.risk,          // 0.0 – 1.0
        riskPercent: doc.riskPercent,   // "72.4%"
        featureMap:  Object.fromEntries(doc.featureMap),
        createdAt:   doc.createdAt,
      },
    });
  });

// ─── Prediction endpoints ────────────────────────────────────────────────────
export const predictStroke   = handlePredict('stroke');
export const predictDiabetes = handlePredict('diabetes');
export const predictHeart    = handlePredict('heart');

// ─── History ─────────────────────────────────────────────────────────────────
export const getHistory = catchAsync(async (req, res) => {
  const limit   = Math.min(parseInt(req.query.limit)  || 10, 100);
  const page    = Math.max(parseInt(req.query.page)   || 1,  1);
  const disease = req.query.disease || null;
  const userId  = req.user?._id ?? null;

  if (disease && !FEATURE_SCHEMAS[disease]) {
    throw new AppError(
      `Invalid disease filter. Must be one of: ${Object.keys(FEATURE_SCHEMAS).join(', ')}.`,
      400,
      'INVALID_DISEASE',
    );
  }

  const result = await predictionService.getHistory({ userId, disease, limit, page });

  res.status(200).json({
    status: 'success',
    data:   result,
  });
});

// ─── Delete a prediction ──────────────────────────────────────────────────────
export const deletePrediction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await predictionService.deleteById(id);

  if (!deleted) {
    throw new AppError('Prediction not found.', 404, 'NOT_FOUND');
  }

  res.status(204).send();
});
