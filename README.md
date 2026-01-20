# AgriMetrix – Team Snack Overflow

## Project Description
**AgriMetrix** is an AI/ML-powered agricultural intelligence platform that empowers farmers with **machine learning-driven crop recommendations**, **market demand forecasting**, and **smart crop rotation planning**.  
Our mission is to modernize Indian farming through **data-driven decisions** and **sustainable practices**, benefiting all stakeholders in the agricultural ecosystem.

---

## Live Deployments
- **Application:** [https://anndata.netlify.app/](https://anndata.netlify.app/)
- **Backend API:** [https://ann-data-api.onrender.com](https://ann-data-api.onrender.com)
- **ML API:** [https://ann-data-ml.onrender.com](https://ann-data-ml.onrender.com)
- **Swagger Documentation:** [https://ann-data-api.onrender.com/api-docs](https://ann-data-api.onrender.com/api-docs)
- **Local Swagger:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---
## Tech Stack
- **Frontend:** React.js, Axios, CSS Grid/Flexbox, Responsive Design
- **Backend:** Node.js, Express.js, JWT Authentication, Swagger Documentation
- **Database:** MongoDB with Mongoose ODM
- **AI/ML:** Python, Flask, scikit-learn, pandas, numpy
- **ML Models:** RandomForestClassifier, RandomForestRegressor, Custom Rotation Algorithm
- **Hosting:** Render (Backend + ML API), Netlify (Frontend)

---

## Key Features

### AI-Powered ML Insights
**Smart Crop Recommendation** - AI analyzes soil nutrients (N, P, K), weather conditions (temperature, humidity, rainfall), and pH levels to recommend optimal crops  
**Market Demand Forecasting** - Predict crop demand by region and season using historical market data  
**Intelligent Crop Rotation** - AI-driven crop rotation planning to optimize soil health and maximize yields  

### Core Platform Features
**Crop Disease Detection** - Upload crop images for AI-powered disease identification  
**JWT-based Authentication** - Secure user registration and login system  
**Interactive Dashboard** - User-friendly interface with tabbed ML insights  
**Real-time Predictions** - Live ML model inference with confidence scores  
**Responsive Design** - Mobile-first UI optimized for farmers in the field  

### Technical Features
**RESTful API Architecture** - Well-documented endpoints with Swagger UI  
**Microservices Design** - Separate ML API service for scalability  
**Error Handling & Validation** - Robust input validation and fallback mechanisms  
**Debug Mode** - Development tools for troubleshooting ML responses  

---

## Project Structure
```
AnnData-SnackOverflow/
├── frontend/                 # React.js Frontend Application
│   ├── src/
│   │   ├── App.js           # Main app with ML Insights integration
│   │   ├── App.css          # Responsive styling with ML components
│   │   └── ...
│   ├── public/
│   └── package.json         # Frontend dependencies (React, Axios)
│
├── backend/                  # Node.js Express API Server
│   ├── server.js            # Main server with ML proxy endpoints
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Prediction.js
│   │   └── Feedback.js
│   └── package.json         # Backend dependencies
│
├── ml/                      # Python ML API Service
│   ├── api.py              # Flask ML API server
│   ├── pipeline.py         # ML model classes and training
│   ├── models/             # Trained model files (.pkl)
│   │   ├── crop_recommendation_model.pkl
│   │   └── demand_forecasting_model.pkl
│   ├── datasets/           # Training datasets
│   │   ├── crop_recommendation.csv
│   │   ├── crop_demand_data.csv
│   │   └── crop_soil.csv
│   ├── notebooks/          # Jupyter notebooks for model development
│   └── requirements.txt    # Python ML dependencies
│
├── API_CONTRACT.md         # API endpoint documentation
├── ML_INTEGRATION_GUIDE.md # ML integration guide
└── README.md              # This file
```

---

## API Testing & Documentation

### **Health Check Endpoints**
```http
GET /health                    # Backend health
GET /api/ml/health            # ML service health via backend
GET http://localhost:5000/health  # Direct ML API health
```

### **ML API Endpoints**
```http
POST /api/ml/crop-recommendation   # AI crop recommendations
POST /api/ml/demand-forecast       # Market demand forecasting  
POST /api/ml/crop-rotation         # Smart crop rotation planning
```

### **Interactive Documentation**
- **Local Swagger:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Live Swagger:** [https://ann-data-api.onrender.com/api-docs](https://ann-data-api.onrender.com/api-docs)

---

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- MongoDB (local or Atlas)
- Git

### Backend Setup
```bash
cd backend
npm install

# Configure environment variables
echo "MONGODB_URI=your_mongodb_connection_string" > .env
echo "JWT_SECRET=your_secret_key" >> .env
echo "ML_API_URL=http://localhost:5000" >> .env

# Start backend server
node server.js
```
Server runs at `http://localhost:3000`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
App runs at `http://localhost:3001`

### ML API Setup
```bash
cd ml
pip install -r requirements.txt

# Train models (first time only)
python pipeline.py

# Start ML API
python api.py
```
ML API runs at `http://localhost:5000`

---

## ML Features Usage

### Crop Recommendation
Input soil nutrients and environmental data to get AI-powered crop suggestions:
```json
{
  "N": 90, "P": 42, "K": 43,
  "temperature": 20.8, "humidity": 82,
  "ph": 6.5, "rainfall": 202
}
```
**Response:** Recommended crops with confidence scores

### Market Demand Forecast
Predict crop demand by region and time:
```json
{
  "year": 2024, "month": 3,
  "region": "Maharashtra", "crop": "Rice"
}
```
**Response:** Predicted demand with market insights

### Crop Rotation Planning
Get intelligent crop rotation recommendations:
```json
{
  "current_crop": "wheat", "soil_type": "loamy",
  "temperature": 25, "humidity": 70, "moisture": 60,
  "nitrogen": 80, "phosphorous": 40, "potassium": 50
}
```
**Response:** AI-optimized crop rotation sequence

---

## Testing

### Backend API Tests
```bash
cd backend
node test-endpoints.js
```

### ML Integration Tests
```bash
cd ml
python test_integration.py
```

### Manual Testing
- Import `backend/AnnData_API.postman_collection.json` into Postman
- Test all endpoints with sample data

---

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Connect Render to your repository
3. Configure environment variables
4. Deploy from `backend/` directory

### Frontend (Netlify)
1. Build: `npm run build`
2. Deploy `build/` folder to Netlify
3. Configure environment variables

### ML API (Render)
1. Configure Python runtime
2. Deploy from `ml/` directory
3. Set start command: `python api.py`

---

## Documentation
- **API Contract:** See [API_CONTRACT.md](API_CONTRACT.md)
- **ML Integration Guide:** See [ML_INTEGRATION_GUIDE.md](ML_INTEGRATION_GUIDE.md)
- **Model Evaluation:** See [ml/MODEL_EVALUATION_REPORT.md](ml/MODEL_EVALUATION_REPORT.md)

---

## Contributing
Developed by **Team Snack Overflow** for Smart India Hackathon 2024

### Team Members
- Full Stack Development
- ML/AI Engineering
- UI/UX Design
- Database Architecture

---

## License
MIT License - Built for farmers, by developers who care.

---

## Support
For issues or questions:
- Check the documentation files
- Review Swagger API docs
- Test endpoints using Postman collection

**Last Updated:** January 2026

