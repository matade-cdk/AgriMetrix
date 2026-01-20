# 📑 API Contract – AgriMetrix
## Kisan 2.0 Starts Here!!

This document outlines all backend API endpoints for the AgriMetrix platform.

## Base URLs
- **Production API:** `https://ann-data-api.onrender.com`
- **Local API:** `http://localhost:3000`
- **ML API (Production):** `https://ann-data-ml.onrender.com`
- **ML API (Local):** `http://localhost:5000`
- **Swagger Docs:** `https://ann-data-api.onrender.com/api-docs`

---

## Health Check

### Backend Health
- **Method:** GET
- **Endpoint:** /health
- **Description:** Check backend server status
- **Response (200):**
```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

### ML Service Health
- **Method:** GET
- **Endpoint:** /api/ml/health
- **Description:** Check ML service status via backend proxy
- **Response (200):**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "message": "ML API is ready"
}
```

---

## User Authentication

### Register User
- **Method:** POST
- **Endpoint:** /api/auth/register
- **Description:** Registers a new user
- **Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **Success Response (201):**
```json
{
  "message": "User registered successfully"
}
```
- **Error (400):** Email already exists

---

### Login User
- **Method:** POST
- **Endpoint:** /api/auth/login
- **Description:** Logs in user
- **Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Success Response (200):**
```json
{
  "token": "JWT Token",
  "user": {
    "id": "string",
    "username": "string"
  }
}
```
- **Error (401):** Invalid credentials

---

## Crop Prediction

### Upload Image & Predict Disease
- **Method:** POST
- **Endpoint:** /api/crops/predict
- **Description:** Uploads an image and returns predicted crop disease
- **Request Body (form-data):**
  - image: file (JPEG/PNG)
- **Success Response (200):**
```json
{
  "prediction": "Blight",
  "confidence": 0.92
}
```
- **Error (400):** Invalid image file

---

## Weather Forecast

### Get Weather for Location
- **Method:** GET
- **Endpoint:** /api/weather?location=cityname
- **Description:** Returns 7-day weather forecast
- **Success Response (200):**
```json
{
  "location": "Mumbai",
  "forecast": "Cloudy with light rain"
}
```

---

## Supplier Info

### Get Nearby Suppliers
- **Method:** GET
- **Endpoint:** /api/suppliers?location=cityname
- **Description:** Returns list of suppliers (mock data)
- **Success Response (200):**
```json
[
  {
    "name": "AgroMart",
    "location": "Pune",
    "type": "Fertilizers"
  }
]
```

---

## Machine Learning Endpoints

### AI Crop Recommendation
- **Method:** POST
- **Endpoint:** /api/ml/crop-recommendation
- **Description:** AI-powered crop recommendation using RandomForest ML model
- **Request Body:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.8,
  "humidity": 82,
  "ph": 6.5,
  "rainfall": 202
}
```
- **Success Response (200):**
```json
{
  "recommended_crop": "rice",
  "confidence": 0.95,
  "model_version": "1.0",
  "alternative_crops": ["wheat", "maize"],
  "recommendations": [
    "Optimal nitrogen levels for rice cultivation",
    "Consider irrigation based on rainfall prediction"
  ]
}
```
- **Parameters:**
  - `N`: Nitrogen content (0-140 kg/ha)
  - `P`: Phosphorous content (5-145 kg/ha)
  - `K`: Potassium content (5-205 kg/ha)
  - `temperature`: Temperature in Celsius (8-44°C)
  - `humidity`: Relative humidity (14-100%)
  - `ph`: Soil pH level (3.5-10)
  - `rainfall`: Annual rainfall in mm (20-300mm)

### Market Demand Forecasting
- **Method:** POST
- **Endpoint:** /api/ml/demand-forecast
- **Description:** Predict crop demand by region and season
- **Request Body:**
```json
{
  "year": 2024,
  "month": 3,
  "region": "Maharashtra",
  "crop": "Rice"
}
```
- **Success Response (200):**
```json
{
  "predicted_demand": 15000,
  "confidence_interval": [14500, 15500],
  "unit": "tonnes",
  "trend": "increasing",
  "market_insights": [
    "High demand expected in Q2 2024",
    "Consider advance booking with suppliers"
  ]
}
```

### Smart Crop Rotation Planning
- **Method:** POST
- **Endpoint:** /api/ml/crop-rotation
- **Description:** AI-driven crop rotation recommendations for soil health
- **Request Body:**
```json
{
  "current_crop": "wheat",
  "soil_type": "loamy",
  "temperature": 25,
  "humidity": 70,
  "moisture": 60,
  "nitrogen": 80,
  "phosphorous": 40,
  "potassium": 50
}
```
- **Success Response (200):**
```json
{
  "rotation_sequence": ["legumes", "rice", "wheat"],
  "next_recommended_crop": "legumes",
  "rotation_benefits": [
    "Nitrogen fixation from legumes",
    "Improved soil structure",
    "Pest cycle disruption"
  ],
  "estimated_yield_improvement": "15-20%",
  "soil_health_score": 8.5
}
```

---

## Feedback

### Submit Feedback
- **Method:** POST
- **Endpoint:** /api/feedback
- **Description:** Allows users to send feedback
- **Request Body:**
```json
{
  "user_id": "string",
  "message": "Great platform!"
}
```
- **Success Response (200):**
```json
{
  "message": "Feedback received"
}
```

---

## Get User Profile

### View Profile
- **Method:** GET
- **Endpoint:** /api/user/profile
- **Headers:** Authorization: Bearer Token
- **Description:** Returns logged-in user profile
- **Success Response (200):**
```json
{
  "username": "sohan",
  "email": "sohan@email.com"
}
```

---

## Update Profile

### Edit User Details
- **Method:** PUT
- **Endpoint:** /api/user/profile
- **Headers:** Authorization: Bearer Token
- **Request Body:**
```json
{
  "username": "newname",
  "email": "new@email.com"
}
```
- **Success Response (200):**
```json
{
  "message": "Profile updated"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input parameters",
  "details": "Temperature must be between 8 and 44°C"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide valid JWT token"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error",
  "message": "ML model service unavailable"
}
```

### 503 Service Unavailable
```json
{
  "error": "ML service temporarily unavailable",
  "retry_after": 30
}
```

---

## Rate Limiting
- **ML Endpoints:** 100 requests per minute per IP
- **Auth Endpoints:** 10 requests per minute per IP
- **Other Endpoints:** 200 requests per minute per IP

---

## Authentication

Protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Token expires after 24 hours. Refresh token by logging in again.

---

## Data Validation Rules

### Crop Recommendation Input
- All numeric fields are required
- Values must be within specified ranges
- Invalid ranges will return 400 error with details

### Demand Forecast Input
- `year`: 2020-2030
- `month`: 1-12
- `region`: Valid Indian state name
- `crop`: One of supported crops (rice, wheat, maize, etc.)

### Crop Rotation Input
- All environmental parameters required
- Soil type must match predefined categories
- Current crop must be from supported list

---

## Testing with Postman

Import the collection:
```bash
backend/AnnData_API.postman_collection.json
```

Collection includes:
- Pre-configured requests for all endpoints
- Sample request bodies
- Environment variables setup
- Automated tests

---

## Changelog

### Version 2.0 (January 2026)
- ✅ Added ML crop recommendation endpoint
- ✅ Added demand forecasting endpoint
- ✅ Added crop rotation planning endpoint
- ✅ Enhanced error handling with detailed responses
- ✅ Added health check endpoints
- ✅ Integrated Swagger documentation

### Version 1.0 (Initial Release)
- Basic authentication system
- User profile management
- Weather and supplier endpoints

---

## Support & Documentation

- **Interactive API Docs:** [Swagger UI](https://ann-data-api.onrender.com/api-docs)
- **ML Integration Guide:** [ML_INTEGRATION_GUIDE.md](ML_INTEGRATION_GUIDE.md)
- **Model Evaluation:** [MODEL_EVALUATION_REPORT.md](ml/MODEL_EVALUATION_REPORT.md)

---

**Last Updated:** January 20, 2026  
**API Version:** 2.0  
**Team:** Snack Overflow

> This document is maintained and updated as the platform evolves. Always refer to the latest version before API integration.