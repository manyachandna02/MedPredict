# flask_app/app.py
# ─────────────────────────────────────────────────────────────────────────────
# Flask ML microservice — serves predictions from .pkl scikit-learn models.
# Node.js backend calls POST /predict/<disease> with { "features": [...] }
# ─────────────────────────────────────────────────────────────────────────────
import os
import time
import logging
import numpy as np
import joblib
from flask import Flask, request, jsonify

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# ── Load models and scalers ─────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

MODELS = {}
SCALERS = {}

try:
    # Load models
    MODELS["stroke"]   = joblib.load(os.path.join(MODEL_DIR, "stroke_model.pkl"))
    MODELS["diabetes"] = joblib.load(os.path.join(MODEL_DIR, "diabetes_model.pkl"))
    MODELS["heart"]    = joblib.load(os.path.join(MODEL_DIR, "heart_model.pkl"))

    # Load scalers (IMPORTANT)
    SCALERS["stroke"]   = joblib.load(os.path.join(MODEL_DIR, "stroke_scaler.pkl"))
    SCALERS["diabetes"] = joblib.load(os.path.join(MODEL_DIR, "diabetes_scaler.pkl"))
    SCALERS["heart"]    = joblib.load(os.path.join(MODEL_DIR, "heart_scaler.pkl"))

    logger.info("All ML models and scalers loaded successfully.")

except Exception as e:
    logger.error(f"Failed to load models/scalers: {e}")
    raise SystemExit(1)


# ── Health endpoint ─────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "models": list(MODELS.keys())
    }), 200


# ── Prediction endpoint ─────────────────────────────────────────────────
@app.route("/predict/<string:disease>", methods=["POST"])
def predict(disease):
    disease = disease.lower()

    if disease not in MODELS:
        return jsonify({
            "error": f"Unknown disease: '{disease}'. Must be one of: {list(MODELS.keys())}"
        }), 400

    body = request.get_json(silent=True)

    if not body or "features" not in body:
        return jsonify({"error": "Request must include 'features'"}), 400

    features = body["features"]

    if not isinstance(features, list) or len(features) == 0:
        return jsonify({"error": "'features' must be a non-empty list"}), 400

    try:
        # Convert to numpy
        X = np.array(features, dtype=float).reshape(1, -1)
    except Exception as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 422

    try:
        model  = MODELS[disease]
        scaler = SCALERS.get(disease)

        # 🔥 APPLY SCALING (FIXES YOUR ISSUE)
        if scaler:
            X = scaler.transform(X)

        t0 = time.perf_counter()

        probability = float(model.predict_proba(X)[0][1])

        # Optional: clamp probability (avoid 0 or 1 extremes)
        probability = max(0.01, min(0.99, probability))

        # Custom threshold (better than default)
        prediction = 1 if probability > 0.4 else 0

        latency_ms = round((time.perf_counter() - t0) * 1000, 2)

        logger.info(
            f"[{disease}] prob={probability:.4f}, pred={prediction}, latency={latency_ms}ms"
        )

        return jsonify({
            "prediction": prediction,
            "probability": probability,
            "latency_ms": latency_ms
        }), 200

    except Exception as e:
        logger.exception(f"Prediction error: {e}")
        return jsonify({"error": "Prediction failed"}), 500


# ── Run app ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)

