// src/models/Prediction.js
import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    disease: {
      type:     String,
      required: [true, 'Disease type is required'],
      enum:     {
        values:  ['stroke', 'diabetes', 'heart'],
        message: 'Disease must be one of: stroke, diabetes, heart',
      },
      lowercase: true,
      index:     true,
    },

    features: {
      type:     [mongoose.Schema.Types.Mixed],
      required: [true, 'Features array is required'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message:   'Features must be a non-empty array',
      },
    },

    // Raw field map — stored for audit/display (e.g. { age: 45, bmi: 28.7 })
    featureMap: {
      type:    Map,
      of:      mongoose.Schema.Types.Mixed,
      default: {},
    },

    prediction: {
      type:     Number,
      required: [true, 'Prediction value is required'],
      enum:     {
        values:  [0, 1],
        message: 'Prediction must be 0 (negative) or 1 (positive)',
      },
    },

    // Probability / risk percentage from Flask (0–1 float, stored as-is)
    risk: {
      type:     Number,
      required: [true, 'Risk score is required'],
      min:      [0, 'Risk cannot be negative'],
      max:      [1, 'Risk cannot exceed 1'],
    },

    // Optional: link to authenticated user
    userId: {
      type:  mongoose.Schema.Types.ObjectId,
      ref:   'User',
      index: true,
    },

    // Flask responded in this many ms
    flaskLatencyMs: {
      type: Number,
    },
  },
  {
    timestamps: true,        // adds createdAt + updatedAt automatically
    versionKey: false,
  },
);

// Compound index for history queries: per-user sorted by date
predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ disease: 1, createdAt: -1 });

// Virtual: risk as a percentage string (for serialisation convenience)
predictionSchema.virtual('riskPercent').get(function () {
  return `${(this.risk * 100).toFixed(1)}%`;
});

predictionSchema.set('toJSON', {
  virtuals: true,
  transform(_, ret) {
    delete ret.id; // remove duplicate virtual id
    return ret;
  },
});

const Prediction = mongoose.model('Prediction', predictionSchema);
export default Prediction;
