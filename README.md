# MedPredict — Backend API

Node.js + Express + MongoDB backend for the MedPredict health risk prediction system.
Bridges the React frontend with the Flask ML microservice.

---

## Architecture

```
React Frontend (Vite :5173)
        │
        │  POST /api/stroke  { features: {...} }
        ▼
Node/Express API (:8000)          ← this repo
   ├── validates input
   ├── builds ordered feature array
   ├── calls Flask via axios
   │         │
   │         ▼
   │   Flask ML Service (:5000)
   │   POST /predict/stroke  { features: [...] }
   │   ← { prediction: 0|1, probability: 0.74 }
   │
   ├── saves result to MongoDB
   └── returns clean JSON to frontend
```

---

## Folder Structure

```
medpredict-backend/
├── src/
│   ├── server.js                  # Process bootstrap + graceful shutdown
│   ├── app.js                     # Express app, middleware, routes
│   ├── config/
│   │   ├── db.js                  # Mongoose connection + retry logic
│   │   └── axios.js               # Pre-configured Flask HTTP client
│   ├── controllers/
│   │   └── predictionController.js  # Thin route handlers, input extraction
│   ├── routes/
│   │   ├── predictionRoutes.js    # /api/stroke, /api/diabetes, /api/heart, /api/history
│   │   └── healthRoutes.js        # /health — service status probe
│   ├── models/
│   │   ├── Prediction.js          # Mongoose prediction schema
│   │   └── User.js                # Mongoose user schema (auth-ready)
│   ├── services/
│   │   ├── mlService.js           # All Flask communication + error mapping
│   │   └── predictionService.js   # DB persistence + history queries
│   ├── middleware/
│   │   ├── errorHandler.js        # Centralised error handler
│   │   ├── validate.js            # Request validation middleware
│   │   └── notFound.js            # 404 handler
│   └── utils/
│       ├── AppError.js            # Custom operational error class
│       ├── catchAsync.js          # Async controller wrapper
│       └── logger.js              # Winston structured logger
├── flask_app/
│   └── app.py                     # Flask ML service (reference implementation)
├── frontend_integration/
│   ├── api.js                     # Drop into React src/services/api.js
│   └── DashboardPage.patch.jsx    # Patch to wire real API into dashboard
├── logs/                          # Auto-created by Winston
├── .env.example
├── .gitignore
└── package.json
```

---

## Setup

### 1. Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=8000
MONGO_URI=mongodb://localhost:27017/medpredict
FLASK_BASE_URL=http://127.0.0.1:5000
FLASK_TIMEOUT_MS=10000
ALLOWED_ORIGINS=http://localhost:5173
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu / WSL
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 4. Start the Flask ML service

```bash
cd flask_app
pip install flask numpy joblib scikit-learn
python app.py
# → Running on http://127.0.0.1:5000
```

Make sure your `.pkl` files are in `flask_app/models/`:
```
flask_app/models/
├── stroke_model.pkl
├── diabetes_model.pkl
└── heart_model.pkl
```

### 5. Start the Node backend

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

---

## API Reference

All endpoints return:
```json
{
  "status": "success",
  "data": { ... }
}
```

Errors return:
```json
{
  "status": "fail",
  "code": "FLASK_DOWN",
  "message": "ML prediction service is currently unavailable."
}
```

---

### POST /api/stroke

**Body (named object — preferred):**
```json
{
  "features": {
    "age": 67,
    "hypertension": 1,
    "heart_disease": 1,
    "glucose": 228.69,
    "bmi": 36.6
  }
}
```

**Body (ordered array — also accepted):**
```json
{
  "features": [67, 1, 1, 228.69, 36.6]
}
```

**Response 201:**
```json
{
  "status": "success",
  "data": {
    "id": "66a1b2c3d4e5f6789abcdef0",
    "disease": "stroke",
    "prediction": 1,
    "risk": 0.847,
    "riskPercent": "84.7%",
    "featureMap": {
      "age": 67,
      "hypertension": 1,
      "heart_disease": 1,
      "glucose": 228.69,
      "bmi": 36.6
    },
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### POST /api/diabetes

Features (in order): `age, hypertension, heart_disease, bmi, hba1c, glucose`

```json
{
  "features": {
    "age": 50,
    "hypertension": 1,
    "heart_disease": 0,
    "bmi": 33.6,
    "hba1c": 7.2,
    "glucose": 168
  }
}
```

---

### POST /api/heart

Features (in order): `age, sex, cp, trestbps, chol, thalach`

```json
{
  "features": {
    "age": 63,
    "sex": 1,
    "cp": 3,
    "trestbps": 145,
    "chol": 233,
    "thalach": 150
  }
}
```

---

### GET /api/history

**Query params:** `limit` (default 10, max 100), `page` (default 1), `disease` (optional filter)

```
GET /api/history?limit=10&page=1&disease=stroke
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "records": [
      {
        "_id": "66a1b2c3...",
        "disease": "stroke",
        "prediction": 1,
        "risk": 0.847,
        "riskPercent": "84.7%",
        "featureMap": { "age": 67, "bmi": 36.6, "..." : "..." },
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

---

### GET /health

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "services": {
    "mongo": "connected",
    "flask": "reachable"
  },
  "uptime": 3600.42
}
```

---

## Frontend Integration

1. Copy `frontend_integration/api.js` → `your-react-app/src/services/api.js`

2. Add to your React `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

3. In `DashboardPage.jsx`, replace `simulatePredict` with the real call:
```js
import { predict, getHistory } from '../services/api';

// In handlePredict:
const data = await predict(activeDisease, featureMap);
// data.prediction → 0 | 1
// data.risk       → 0.0 – 1.0
// data.riskPercent → "84.7%"
```

See `frontend_integration/DashboardPage.patch.jsx` for the complete diff.

---

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `FLASK_DOWN` | 503 | Flask ML service unreachable |
| `FLASK_TIMEOUT` | 504 | Flask took too long to respond |
| `FLASK_ERROR` | 502 | Flask returned 4xx/5xx |
| `FLASK_BAD_RESPONSE` | 502 | Flask response has wrong shape |
| `MISSING_FEATURES` | 400 | `features` key missing from body |
| `FEATURE_COUNT_MISMATCH` | 400 | Wrong number of features in array |
| `MISSING_FEATURE_FIELDS` | 400 | Named fields missing |
| `INVALID_FEATURE_VALUE` | 400 | Non-numeric feature value |
| `INVALID_DISEASE` | 400 | Unknown disease type |
| `NOT_FOUND` | 404 | Route or record doesn't exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 422 | Mongoose schema validation failed |

---

## How Node ↔ Flask Communication Works

```
1. Frontend sends:
   POST /api/stroke  { features: { age: 67, bmi: 36.6, ... } }

2. predictionController.js:
   - Validates named fields exist and are numeric
   - Extracts them in the exact order Flask's model expects:
     [age, hypertension, heart_disease, glucose, bmi]
   - Passes ordered array to predictionService

3. predictionService.js:
   - Calls mlService.callFlaskPredict('stroke', [67, 1, 1, 228.69, 36.6])

4. mlService.js (via axios):
   POST http://127.0.0.1:5000/predict/stroke
   Body: { "features": [67, 1, 1, 228.69, 36.6] }

5. Flask (app.py):
   - Loads stroke_model.pkl
   - Calls model.predict([[67, 1, 1, 228.69, 36.6]])
   - Calls model.predict_proba(...)
   - Returns: { "prediction": 1, "probability": 0.847 }

6. Node receives Flask response:
   - Validates shape
   - Saves to MongoDB: { disease, features, featureMap, prediction, risk: 0.847 }
   - Returns to frontend: { prediction: 1, risk: 0.847, riskPercent: "84.7%" }
```
