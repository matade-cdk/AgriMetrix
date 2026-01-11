require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const axios = require('axios');

// Database connection
const connectDB = require('./config/database');

// Models
const User = require('./models/User');
const Feedback = require('./models/Feedback');
const Prediction = require('./models/Prediction');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// ML API Configuration
const ML_API_BASE = process.env.ML_API_BASE || 'http://localhost:5000';

console.log(`🤖 ML API Base URL: ${ML_API_BASE}`);

// Configure axios for ML API calls
const mlApiClient = axios.create({
  baseURL: ML_API_BASE,
  timeout: 60000, // 60 seconds timeout for ML operations (models can be slow)
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'AgriMetrix-Backend/1.0',
    'Accept': 'application/json'
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Don't throw on 4xx errors
  }
});

// CORS Configuration for Production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://ann-data-frontend.onrender.com',
      'https://anndata-snackoverflow.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow any onrender.com subdomain for flexibility
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      // In production, log rejected origins for debugging
      console.log(`⚠️ CORS: Rejecting origin: ${origin}`);
      callback(null, true); // Still allow for now to avoid breaking changes
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgriMetrix API - Kisan 2.0',
      version: '1.0.0',
      description: 'API for Agricultural Data Management Platform',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./server.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     CropRecommendationRequest:
 *       type: object
 *       required:
 *         - soil_type
 *         - season
 *       properties:
 *         soil_type:
 *           type: string
 *         season:
 *           type: string
 *     FeedbackRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *         category:
 *           type: string
 *           enum: [general, bug, feature, improvement, complaint]
 *           default: general
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Email already exists
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create new user (password hashing handled in model pre-save hook)
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: newUser._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password using model method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        username: user.username, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/crops/predict:
 *   post:
 *     summary: Upload image and predict crop disease
 *     tags: [Crop Prediction]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Disease prediction successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prediction:
 *                   type: string
 *                 confidence:
 *                   type: number
 *       400:
 *         description: Invalid image file
 */
app.post('/api/crops/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Invalid image file' });
    }

    // Mock disease prediction logic
    const diseases = ['Blight', 'Rust', 'Leaf Spot', 'Powdery Mildew', 'Healthy'];
    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
    const confidence = Math.random() * 0.3 + 0.7; // Random confidence between 0.7-1.0

    // Save prediction to database
    const predictionData = {
      imagePath: `uploads/${Date.now()}-${req.file.originalname}`, // In real app, save file first
      originalFileName: req.file.originalname,
      prediction: {
        disease: randomDisease,
        confidence: Math.round(confidence * 100) / 100
      }
    };

    // Add user ID if authenticated
    if (req.user) {
      predictionData.userId = req.user.id;
    }

    const prediction = new Prediction(predictionData);
    await prediction.save();

    res.json({
      prediction: randomDisease,
      confidence: Math.round(confidence * 100) / 100,
      predictionId: prediction._id
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Get exact weather forecast for location
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: City name for weather forecast
 *     responses:
 *       200:
 *         description: Weather forecast retrieved successfully
 */

app.get('/api/weather', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    console.log(`🌤️ Fetching weather for: ${location}`);

    // Use tomorrow.io API for EXACT weather data
    if (process.env.TOMORROW_API_KEY) {
      try {
        // Get current weather with precise location
        const weatherUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${encodeURIComponent(location)}&apikey=${process.env.TOMORROW_API_KEY}&units=metric`;
        console.log('🌐 Calling weather API...');
        
        const weatherResponse = await fetch(weatherUrl);
        console.log('📡 Weather API response status:', weatherResponse.status);
        
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          console.log('📊 Weather data received successfully');
          
          // Debug the actual structure
          console.log('🔍 Data structure debug:');
          console.log('weatherData keys:', Object.keys(weatherData));
          console.log('weatherData.data keys:', weatherData.data ? Object.keys(weatherData.data) : 'No data');
          if (weatherData.data && weatherData.data.location) {
            console.log('weatherData.data.location keys:', Object.keys(weatherData.data.location));
          }
          
          // Check if we have the required data structure
          if (weatherData.data && weatherData.data.values) {
            const values = weatherData.data.values;
            
            // Handle location data - it might be in a different structure
            let locationData = null;
            if (weatherData.data.location) {
              locationData = weatherData.data.location;
            } else if (weatherData.location) {
              locationData = weatherData.location;
            } else {
              // Create a fallback location object
              locationData = {
                name: location,
                lat: 0,
                lon: 0,
                type: 'unknown'
              };
            }
            
            console.log('✅ Valid weather data structure');
            console.log('📍 Location data found:', !!locationData);
            console.log('🌡️ Temperature:', values.temperature);
            
            // Get detailed forecast for next 7 days
            let forecastData = [];
            try {
              const forecastUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(location)}&apikey=${process.env.TOMORROW_API_KEY}&units=metric&timesteps=1d&fields=temperature,humidity,windSpeed,weatherCode,precipitationProbability,cloudCover`;
              console.log('🌐 Calling forecast API...');
              
              const forecastResponse = await fetch(forecastUrl);
              
              if (forecastResponse.ok) {
                const forecast = await forecastResponse.json();
                console.log('📅 Forecast data received');
                
                if (forecast.data && forecast.data.timelines && forecast.data.timelines[0]) {
                  forecastData = forecast.data.timelines[0].intervals.slice(0, 7).map(interval => ({
                    day: new Date(interval.startTime).toLocaleDateString('en', { weekday: 'short' }),
                    condition: getWeatherDescription(interval.values.weatherCode),
                    temp: Math.round(interval.values.temperature * 10) / 10,
                    humidity: Math.round(interval.values.humidity),
                    windSpeed: Math.round(interval.values.windSpeed * 3.6),
                    precipitation: Math.round(interval.values.precipitationProbability),
                    cloudCover: Math.round(interval.values.cloudCover),
                    icon: getWeatherIcon(interval.values.weatherCode)
                  }));
                  console.log(' Forecast processed:', forecastData.length, 'days');
                }
              } else {
                console.log('⚠️ Forecast API failed, continuing with current weather only');
              }
            } catch (forecastError) {
              console.log('⚠️ Forecast fetch failed:', forecastError.message);
            }
            
            // Return EXACT weather data
            const exactWeather = {
              location: locationData.name || location,
              coordinates: {
                lat: locationData.lat || 0,
                lon: locationData.lon || 0
              },
              current: {
                temperature: Math.round(values.temperature * 10) / 10,
                humidity: Math.round(values.humidity),
                windSpeed: Math.round(values.windSpeed * 3.6),
                weatherCode: values.weatherCode,
                condition: getWeatherDescription(values.weatherCode),
                icon: getWeatherIcon(values.weatherCode),
                feelsLike: Math.round(values.temperatureApparent * 10) / 10,
                pressure: Math.round(values.pressureSeaLevel),
                visibility: Math.round(values.visibility),
                uvIndex: Math.round(values.uvIndex),
                cloudCover: Math.round(values.cloudCover)
              },
              forecast: forecastData,
              lastUpdated: new Date().toISOString(),
              dataSource: 'tomorrow.io'
            };
            
            console.log(`✅ Exact weather for ${location}: ${exactWeather.current.temperature}°C`);
            return res.json(exactWeather);
          } else {
            console.log('❌ Missing required data structure');
            console.log('weatherData.data exists:', !!weatherData.data);
            console.log('weatherData.data.values exists:', !!(weatherData.data && weatherData.data.values));
            throw new Error('Missing required data structure');
          }
        } else {
          const errorData = await weatherResponse.json();
          console.error('❌ Weather API error:', errorData);
          throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
      } catch (apiError) {
        console.error('❌ Tomorrow.io API failed:', apiError.message);
        throw new Error(`Weather API failed: ${apiError.message}`);
      }
    } else {
      throw new Error('Tomorrow.io API key not configured');
    }

  } catch (error) {
    console.error('❌ Weather error:', error.message);
    
    // Return error with fallback data
    res.status(500).json({ 
      error: error.message,
      fallback: {
        location: req.query.location,
        message: 'Using fallback data due to API error',
        current: {
          temperature: 'N/A',
          condition: 'Service unavailable',
          icon: '⚠️'
        }
      }
    });
  }
});

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Get nearby suppliers
 *     tags: [Suppliers]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: City name to find suppliers
 *     responses:
 *       200:
 *         description: Suppliers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   location:
 *                     type: string
 *                   type:
 *                     type: string
 */
app.get('/api/suppliers', (req, res) => {
  try {
    const { location } = req.query;

    // Complete suppliers database with all details
    const allSuppliers = [
      {
        _id: '1',
        name: 'Green Valley Seeds',
        category: 'seeds',
        categories: ['seeds', 'organic'],
        location: 'Mumbai, Maharashtra',
        rating: 4.8,
        phone: '+91 9876543210',
        email: 'info@greenvalley.com',
        description: 'Premium quality seeds and organic farming solutions for sustainable agriculture',
        detailedDescription: 'We provide certified organic seeds with guaranteed germination rates above 95%. Our expertise spans across vegetable, fruit, and medicinal plants. We offer expert guidance on planting, soil preparation, and crop management.',
        products: ['Vegetable Seeds', 'Flower Seeds', 'Herb Seeds', 'Fruit Saplings'],
        delivery: true,
        verified: true,
        experience: '15+ years',
        image: '/farmer1.png'
      },
      {
        _id: '2',
        name: 'FarmTech Equipment',
        category: 'equipment',
        categories: ['equipment', 'irrigation'],
        location: 'Pune, Maharashtra',
        rating: 4.6,
        phone: '+91 9876543211',
        email: 'sales@farmtech.com',
        description: 'Modern farming equipment and advanced irrigation systems for precision agriculture',
        detailedDescription: 'We supply state-of-the-art farming equipment including tractors, harvesters, and precision irrigation systems. Our team provides installation, maintenance, and training services to ensure maximum efficiency.',
        products: ['Tractors', 'Harvesters', 'Irrigation Systems', 'Plowing Equipment'],
        delivery: true,
        verified: true,
        experience: '12+ years',
        image: '/farmer2.png'
      },
      {
        _id: '3',
        name: 'Organic Fertilizers Co',
        category: 'fertilizers',
        categories: ['fertilizers', 'organic'],
        location: 'Bangalore, Karnataka',
        rating: 4.7,
        phone: '+91 9876543212',
        email: 'contact@organicfert.com',
        description: 'Eco-friendly fertilizers and soil enhancers for healthy crop growth',
        detailedDescription: 'Our organic fertilizers are made from natural materials without any chemical additives. We focus on soil health and sustainable farming practices. Every product is tested for quality and nutrient content.',
        products: ['Organic Fertilizer', 'Compost', 'Soil Conditioner', 'Micronutrients'],
        delivery: true,
        verified: true,
        experience: '10+ years',
        image: '/farmer3.png'
      },
      {
        _id: '4',
        name: 'AgriCare Pesticides',
        category: 'pesticides',
        categories: ['pesticides', 'crop-protection'],
        location: 'Delhi, NCR',
        rating: 4.5,
        phone: '+91 9876543213',
        email: 'support@agricare.com',
        description: 'Safe and effective crop protection solutions for maximum yield',
        detailedDescription: 'We provide bio-based and chemical pesticides approved by agricultural authorities. Our products are tested for safety and effectiveness. We also offer free consultation on pest management strategies.',
        products: ['Insecticides', 'Fungicides', 'Herbicides', 'Bio-pesticides'],
        delivery: true,
        verified: true,
        experience: '8+ years',
        image: '/farmer4.png'
      },
      {
        _id: '5',
        name: 'Smart Irrigation Systems',
        category: 'irrigation',
        categories: ['irrigation', 'equipment'],
        location: 'Chennai, Tamil Nadu',
        rating: 4.9,
        phone: '+91 9876543214',
        email: 'info@smartirrigation.com',
        description: 'Automated drip irrigation and smart water management solutions',
        detailedDescription: 'Our advanced irrigation systems reduce water usage by up to 60% while increasing crop yield. We provide IoT-enabled sensors for real-time monitoring and automated controls.',
        products: ['Drip Systems', 'Sprinklers', 'Water Controllers', 'Sensors'],
        delivery: true,
        verified: true,
        experience: '6+ years',
        image: '/farmer5.png'
      },
      {
        _id: '6',
        name: 'Krishak Seeds & Nursery',
        category: 'seeds',
        categories: ['seeds', 'plants'],
        location: 'Jaipur, Rajasthan',
        rating: 4.4,
        phone: '+91 9876543215',
        email: 'orders@krishakseeds.com',
        description: 'Hybrid and heirloom seeds with expert planting guidance',
        detailedDescription: 'We specialize in both hybrid and traditional heirloom seed varieties. Our expert team provides personalized guidance on seed selection and cultivation techniques for optimal growth.',
        products: ['Hybrid Seeds', 'Heirloom Varieties', 'Medicinal Plants', 'Grafted Plants'],
        delivery: true,
        verified: false,
        experience: '5+ years',
        image: '/farmer6.png'
      },
      {
        _id: '7',
        name: 'BioFarm Organic Solutions',
        category: 'organic',
        categories: ['organic', 'fertilizers', 'seeds'],
        location: 'Nashik, Maharashtra',
        rating: 4.8,
        phone: '+91 9876543216',
        email: 'hello@biofarm.com',
        description: 'Complete organic farming solutions and certification assistance',
        detailedDescription: 'We provide end-to-end organic farming solutions including certified seeds, fertilizers, and guidance. We assist with organic certification and sustainable farming practices.',
        products: ['Certified Seeds', 'Bio-Fertilizers', 'Bio-Pesticides', 'Organic Amendments'],
        delivery: true,
        verified: true,
        experience: '9+ years',
        image: '/farmer7.png'
      },
      {
        _id: '8',
        name: 'Drip Irrigation Specialists',
        category: 'irrigation',
        categories: ['irrigation', 'equipment', 'technology'],
        location: 'Hyderabad, Telangana',
        rating: 4.5,
        phone: '+91 9876543217',
        email: 'install@dripspecialists.com',
        description: 'Expert drip irrigation installation and maintenance services',
        detailedDescription: 'Our team specializes in designing and installing customized drip irrigation systems for different crop types. We provide training, maintenance, and efficiency optimization services.',
        products: ['Drip Lines', 'Filters', 'Connectors', 'Installation Service'],
        delivery: false,
        verified: true,
        experience: '14+ years',
        image: '/farmer8.png'
      },
      {
        _id: '9',
        name: 'Golden Grain Seeds',
        category: 'seeds',
        categories: ['seeds', 'cereal', 'pulses'],
        location: 'Ludhiana, Punjab',
        rating: 4.7,
        phone: '+91 9876543218',
        email: 'info@goldengrain.com',
        description: 'High-yield cereal and pulse seed varieties for commercial farming',
        detailedDescription: 'We offer certified high-yield seed varieties for wheat, rice, pulses, and oilseeds. Our seeds are tested for purity and germination. We provide agronomic support throughout the season.',
        products: ['Wheat Seeds', 'Rice Seeds', 'Dal Seeds', 'Oilseed Varieties'],
        delivery: true,
        verified: true,
        experience: '18+ years',
        image: '/farmer9.png'
      },
      {
        _id: '10',
        name: 'Premium Farm Supplies',
        category: 'equipment',
        categories: ['equipment', 'tools', 'implements'],
        location: 'Coimbatore, Tamil Nadu',
        rating: 4.8,
        phone: '+91 9876543219',
        email: 'sales@premiumfarm.com',
        description: 'Complete range of farming equipment and implements',
        detailedDescription: 'We stock a wide variety of quality farming equipment from basic tools to advanced machinery. Our team provides expert advice on equipment selection and maintenance.',
        products: ['Tractors', 'Ploughs', 'Harvesters', 'Threshers'],
        delivery: true,
        verified: true,
        experience: '16+ years',
        image: '/farmer10.png'
      },
      {
        _id: '11',
        name: 'Golden Harvest Grains',
        category: 'seeds',
        categories: ['seeds', 'grains'],
        location: 'Amritsar, Punjab',
        rating: 4.5,
        phone: '+91 9876543220',
        email: 'orders@goldenharvest.com',
        description: 'High-yielding grain seeds and cereal crop varieties for commercial farming',
        detailedDescription: 'We specialize in high-yielding grain seeds including wheat, rice, barley and millet varieties. Our seeds are certified and tested for purity and germination. We provide agronomic support throughout the growing season.',
        products: ['Wheat Seeds', 'Rice Seeds', 'Barley Seeds', 'Millet Seeds'],
        delivery: true,
        verified: true,
        experience: '14+ years',
        image: '/farmer1.png'
      },
      {
        _id: '12',
        name: 'EcoGreen Pest Control',
        category: 'pesticides',
        categories: ['pesticides', 'organic', 'bio-control'],
        location: 'Kochi, Kerala',
        rating: 4.7,
        phone: '+91 9876543221',
        email: 'info@ecogreenpest.com',
        description: 'Biological pest control and eco-friendly crop protection solutions',
        detailedDescription: 'We provide biological pest control solutions using beneficial insects and natural compounds. Our approach is environmentally friendly and eliminates harmful chemical residues from crops.',
        products: ['Bio-pesticides', 'Neem Products', 'Beneficial Insects', 'Pheromone Traps'],
        delivery: true,
        verified: true,
        experience: '11+ years',
        image: '/farmer2.png'
      },
      {
        _id: '13',
        name: 'Precision Farm Tech',
        category: 'equipment',
        categories: ['equipment', 'technology', 'sensors'],
        location: 'Ahmedabad, Gujarat',
        rating: 4.8,
        phone: '+91 9876543222',
        email: 'tech@precisionfarm.com',
        description: 'Smart farming technology and IoT sensors for precision agriculture',
        detailedDescription: 'We offer cutting-edge IoT sensors, weather stations, GPS systems and agricultural drones for precision farming. Our technology helps optimize crop yields and reduce resource wastage.',
        products: ['Soil Sensors', 'Weather Stations', 'GPS Systems', 'Drones'],
        delivery: true,
        verified: true,
        experience: '6+ years',
        image: '/farmer3.png'
      },
      {
        _id: '14',
        name: 'Nutrient Plus Fertilizers',
        category: 'fertilizers',
        categories: ['fertilizers', 'micronutrients'],
        location: 'Indore, Madhya Pradesh',
        rating: 4.4,
        phone: '+91 9876543223',
        email: 'sales@nutrientplus.com',
        description: 'Specialized fertilizers and micronutrient supplements for crop nutrition',
        detailedDescription: 'We manufacture specialized fertilizers with balanced NPK ratios and essential micronutrients. Our products improve soil fertility and enhance crop productivity significantly.',
        products: ['NPK Fertilizers', 'Zinc Sulfate', 'Boron', 'Calcium Supplements'],
        delivery: true,
        verified: false,
        experience: '9+ years',
        image: '/farmer4.png'
      },
      {
        _id: '15',
        name: 'Aqua Farm Solutions',
        category: 'irrigation',
        categories: ['irrigation', 'water-management'],
        location: 'Rajkot, Gujarat',
        rating: 4.6,
        phone: '+91 9876543224',
        email: 'water@aquafarm.com',
        description: 'Complete water management and efficient irrigation systems',
        detailedDescription: 'We design and install customized water management and irrigation systems. Our solutions reduce water consumption while maintaining optimal crop health and productivity.',
        products: ['Micro Irrigation', 'Water Pumps', 'Filtration Systems', 'Storage Tanks'],
        delivery: true,
        verified: true,
        experience: '13+ years',
        image: '/farmer5.png'
      },
      {
        _id: '16',
        name: 'Organic Valley Seeds',
        category: 'organic',
        categories: ['organic', 'seeds', 'certification'],
        location: 'Shimla, Himachal Pradesh',
        rating: 4.9,
        phone: '+91 9876543225',
        email: 'certified@organicvalley.com',
        description: 'Certified organic seeds and sustainable farming inputs for hill agriculture',
        detailedDescription: 'We provide certified organic seeds specifically adapted for hill agriculture. All our products are certified by organic certification bodies and promote sustainable farming practices.',
        products: ['Organic Vegetable Seeds', 'Apple Saplings', 'Organic Fertilizers', 'Certification Services'],
        delivery: true,
        verified: true,
        experience: '16+ years',
        image: '/farmer6.png'
      },
      {
        _id: '17',
        name: 'Farm Fresh Tools',
        category: 'equipment',
        categories: ['equipment', 'tools', 'maintenance'],
        location: 'Kolkata, West Bengal',
        rating: 4.3,
        phone: '+91 9876543226',
        email: 'tools@farmfresh.com',
        description: 'Agricultural tools, implements and equipment maintenance services',
        detailedDescription: 'We supply quality agricultural hand tools and implements. Our equipment is durable and designed for efficient farming operations. We also provide maintenance and repair services.',
        products: ['Spades', 'Hoes', 'Sickles', 'Equipment Repair'],
        delivery: false,
        verified: true,
        experience: '8+ years',
        image: '/farmer7.png'
      },
      {
        _id: '18',
        name: 'Greenhouse Solutions Ltd',
        category: 'equipment',
        categories: ['equipment', 'greenhouse', 'controlled-environment'],
        location: 'Ooty, Tamil Nadu',
        rating: 4.7,
        phone: '+91 9876543227',
        email: 'greenhouse@solutions.com',
        description: 'Greenhouse construction and controlled environment agriculture systems',
        detailedDescription: 'We design and construct modern polyhouses and greenhouses with climate control systems. Our solutions enable year-round cultivation and protection against pests and diseases.',
        products: ['Polyhouses', 'Shade Nets', 'Climate Control', 'Hydroponic Systems'],
        delivery: true,
        verified: true,
        experience: '12+ years',
        image: '/farmer8.png'
      },
      {
        _id: '19',
        name: 'Agri Finance Consultancy',
        category: 'consultation',
        categories: ['consultation', 'finance', 'insurance'],
        location: 'Nagpur, Maharashtra',
        rating: 4.5,
        phone: '+91 9876543228',
        email: 'finance@agriconsult.com',
        description: 'Agricultural financing, crop insurance and subsidy consultation services',
        detailedDescription: 'We provide comprehensive financial services including agricultural loans, crop insurance plans, and guidance on government subsidies. Our experts help farmers maximize benefits and minimize risks.',
        products: ['Loan Assistance', 'Insurance Plans', 'Subsidy Guidance', 'Financial Planning'],
        delivery: false,
        verified: true,
        experience: '10+ years',
        image: '/farmer9.png'
      },
      {
        _id: '20',
        name: 'Tropical Crop Supplies',
        category: 'seeds',
        categories: ['seeds', 'tropical', 'fruits'],
        location: 'Mangalore, Karnataka',
        rating: 4.6,
        phone: '+91 9876543229',
        email: 'tropical@cropsupplies.com',
        description: 'Tropical and exotic fruit crop varieties for commercial cultivation',
        detailedDescription: 'We supply premium tropical and exotic fruit varieties including mango, coconut, and spice plants. All our plants are disease-free and certified with high survival rates.',
        products: ['Mango Grafts', 'Coconut Seedlings', 'Spice Plants', 'Tropical Vegetables'],
        delivery: true,
        verified: true,
        experience: '15+ years',
        image: '/farmer10.png'
      },
      {
        _id: '21',
        name: 'Soil Health Labs',
        category: 'consultation',
        categories: ['consultation', 'testing', 'soil-health'],
        location: 'Bhopal, Madhya Pradesh',
        rating: 4.8,
        phone: '+91 9876543230',
        email: 'lab@soilhealth.com',
        description: 'Comprehensive soil testing and health assessment services',
        detailedDescription: 'We offer comprehensive soil testing including nutrient analysis, pH testing, and fertility mapping. Our reports provide specific recommendations for soil improvement and crop selection.',
        products: ['Soil Testing', 'Water Analysis', 'Fertility Mapping', 'Remediation Plans'],
        delivery: false,
        verified: true,
        experience: '7+ years',
        image: '/farmer1.png'
      },
      {
        _id: '22',
        name: 'Livestock Feed Solutions',
        category: 'feed',
        categories: ['feed', 'livestock', 'nutrition'],
        location: 'Bareilly, Uttar Pradesh',
        rating: 4.4,
        phone: '+91 9876543231',
        email: 'feed@livestock.com',
        description: 'Quality animal feed and livestock nutrition supplements',
        detailedDescription: 'We produce quality animal feed including cattle feed, poultry feed, and fodder seeds. Our products are formulated with essential nutrients for optimal animal health and productivity.',
        products: ['Cattle Feed', 'Poultry Feed', 'Fodder Seeds', 'Mineral Mix'],
        delivery: true,
        verified: false,
        experience: '11+ years',
        image: '/farmer2.png'
      },
      {
        _id: '23',
        name: 'Cold Chain Logistics',
        category: 'services',
        categories: ['services', 'logistics', 'storage'],
        location: 'Gurgaon, Haryana',
        rating: 4.7,
        phone: '+91 9876543232',
        email: 'logistics@coldchain.com',
        description: 'Cold storage and transportation services for perishable agricultural products',
        detailedDescription: 'We provide state-of-the-art cold storage facilities and refrigerated transport services. Our logistics solutions maintain optimal temperature and humidity for product preservation.',
        products: ['Cold Storage', 'Refrigerated Transport', 'Packaging', 'Supply Chain'],
        delivery: true,
        verified: true,
        experience: '9+ years',
        image: '/farmer3.png'
      },
      {
        _id: '24',
        name: 'Dryland Farming Experts',
        category: 'consultation',
        categories: ['consultation', 'dryland', 'water-conservation'],
        location: 'Jodhpur, Rajasthan',
        rating: 4.5,
        phone: '+91 9876543233',
        email: 'dryland@experts.com',
        description: 'Specialized consultation for dryland farming and water conservation techniques',
        detailedDescription: 'We provide expert guidance on dryland farming techniques, water harvesting, and drought-resistant crop varieties. Our solutions help maximize productivity in water-scarce regions.',
        products: ['Dryland Techniques', 'Water Harvesting', 'Drought-resistant Varieties', 'Training Programs'],
        delivery: false,
        verified: true,
        experience: '18+ years',
        image: '/farmer4.png'
      },
      {
        _id: '25',
        name: 'Flower Power Nursery',
        category: 'seeds',
        categories: ['seeds', 'flowers', 'ornamental'],
        location: 'Pune, Maharashtra',
        rating: 4.6,
        phone: '+91 9876543234',
        email: 'flowers@nursery.com',
        description: 'Ornamental plants, flower seeds and landscaping solutions',
        detailedDescription: 'We specialize in ornamental plants, flower seeds, and landscaping services. Our nursery offers beautiful plants for gardens, parks, and commercial spaces.',
        products: ['Flower Seeds', 'Decorative Plants', 'Garden Design', 'Plant Care'],
        delivery: true,
        verified: true,
        experience: '12+ years',
        image: '/farmer5.png'
      },
      {
        _id: '26',
        name: 'Premium Spice Growers',
        category: 'seeds',
        categories: ['seeds', 'spices', 'organic'],
        location: 'Erode, Tamil Nadu',
        rating: 4.8,
        phone: '+91 9876543235',
        email: 'spices@premium.com',
        description: 'Premium quality spice seeds and organic spice farming solutions',
        detailedDescription: 'We provide premium spice seeds and plants with complete agronomic support. Our varieties are known for high yield and superior quality suitable for both domestic and export markets.',
        products: ['Pepper Seeds', 'Cardamom Plants', 'Cinnamon Saplings', 'Clove Seeds'],
        delivery: true,
        verified: true,
        experience: '22+ years',
        image: '/farmer6.png'
      },
      {
        _id: '27',
        name: 'Eco Fertilizers Hub',
        category: 'fertilizers',
        categories: ['fertilizers', 'organic', 'biofertilizers'],
        location: 'Ludhiana, Punjab',
        rating: 4.5,
        phone: '+91 9876543236',
        email: 'hub@ecofertilizers.com',
        description: 'Eco-friendly and bio-based fertilizers for sustainable farming',
        detailedDescription: 'We manufacture eco-friendly fertilizers using organic materials and bio-based formulations. Our products improve soil health while maintaining environmental sustainability.',
        products: ['Vermicompost', 'Seaweed Extract', 'Mycorrhiza', 'Phosphate Solubilizers'],
        delivery: true,
        verified: true,
        experience: '9+ years',
        image: '/farmer7.png'
      },
      {
        _id: '28',
        name: 'Digital Farm Solutions',
        category: 'equipment',
        categories: ['equipment', 'technology', 'software'],
        location: 'Bangalore, Karnataka',
        rating: 4.9,
        phone: '+91 9876543237',
        email: 'digital@farmsolutions.com',
        description: 'Farm management software and digital agriculture solutions',
        detailedDescription: 'We develop comprehensive farm management applications with crop tracking, soil monitoring, market price tracking, and AI-powered weather forecasts to optimize farming decisions.',
        products: ['Crop Management App', 'Soil Monitoring', 'Market Price Tracking', 'AI Weather Forecast'],
        delivery: false,
        verified: true,
        experience: '5+ years',
        image: '/farmer8.png'
      },
      {
        _id: '29',
        name: 'Polyhouse & Drip Experts',
        category: 'equipment',
        categories: ['equipment', 'greenhouse', 'irrigation'],
        location: 'Chandigarh, Haryana',
        rating: 4.7,
        phone: '+91 9876543238',
        email: 'experts@polyhouse.com',
        description: 'Polyhouse setup and drip irrigation installation with training',
        detailedDescription: 'We design and install complete polyhouse systems with integrated drip irrigation. We provide on-site training to farmers for proper maintenance and operation.',
        products: ['Polyhouse Structure', 'Drip Kits', 'Installation Service', 'Training Programs'],
        delivery: true,
        verified: true,
        experience: '14+ years',
        image: '/farmer9.png'
      },
      {
        _id: '30',
        name: 'Vermi Farming Systems',
        category: 'fertilizers',
        categories: ['fertilizers', 'organic', 'vermiculture'],
        location: 'Mysore, Karnataka',
        rating: 4.6,
        phone: '+91 9876543239',
        email: 'vermi@farmingsystems.com',
        description: 'Vermicompost production units and earthworm culture supplies',
        detailedDescription: 'We provide vermicompost production units and earthworm culture supplies. Our systems enable farmers to produce high-quality organic fertilizer on-farm at low cost.',
        products: ['Earthworm Culture', 'Vermicompost Bins', 'Bedding Material', 'Inoculants'],
        delivery: true,
        verified: true,
        experience: '11+ years',
        image: '/farmer10.png'
      },
      {
        _id: '31',
        name: 'Citrus Crop Specialists',
        category: 'seeds',
        categories: ['seeds', 'citrus', 'fruits'],
        location: 'Nagpur, Maharashtra',
        rating: 4.8,
        phone: '+91 9876543240',
        email: 'citrus@specialists.com',
        description: 'Premium citrus saplings and disease-free fruit tree varieties',
        detailedDescription: 'We specialize in premium citrus saplings including orange, lemon, sweet lime, and mosambi. All plants are disease-free, certified, and come with complete cultivation guidance.',
        products: ['Orange Saplings', 'Lemon Grafts', 'Sweet Lime Plants', 'Mosambi Saplings'],
        delivery: true,
        verified: true,
        experience: '19+ years',
        image: '/farmer1.png'
      },
      {
        _id: '32',
        name: 'Crop Insurance Advisors',
        category: 'consultation',
        categories: ['consultation', 'insurance', 'financial'],
        location: 'Lucknow, Uttar Pradesh',
        rating: 4.4,
        phone: '+91 9876543241',
        email: 'advise@cropinsurance.com',
        description: 'Comprehensive crop insurance and risk management consultation',
        detailedDescription: 'We provide expert consultation on crop insurance schemes, risk assessment, and premium optimization. Our team helps farmers navigate insurance claims and maximize coverage.',
        products: ['Insurance Schemes', 'Risk Assessment', 'Claims Processing', 'Premium Optimization'],
        delivery: false,
        verified: true,
        experience: '13+ years',
        image: '/farmer2.png'
      },
      {
        _id: '33',
        name: 'Vegetable Seed House',
        category: 'seeds',
        categories: ['seeds', 'vegetables', 'hybrid'],
        location: 'Jalna, Maharashtra',
        rating: 4.7,
        phone: '+91 9876543242',
        email: 'veg@seedhouse.com',
        description: 'Premium vegetable seeds with high germination rates and yields',
        detailedDescription: 'We supply premium hybrid vegetable seeds with germination rates above 95%. Our varieties are specially selected for high yield and disease resistance.',
        products: ['Tomato Seeds', 'Onion Sets', 'Brinjal Seeds', 'Capsicum Varieties'],
        delivery: true,
        verified: true,
        experience: '16+ years',
        image: '/farmer3.png'
      },
      {
        _id: '34',
        name: 'Organic Pesticide Works',
        category: 'pesticides',
        categories: ['pesticides', 'organic', 'natural'],
        location: 'Guwahati, Assam',
        rating: 4.6,
        phone: '+91 9876543243',
        email: 'organic@pestworks.com',
        description: 'Natural and organic pesticides made from plant extracts',
        detailedDescription: 'We manufacture natural pesticides from plant extracts including neem, garlic, and chili. Our products are completely organic, safe for farmers and environment-friendly.',
        products: ['Neem Oil Spray', 'Garlic Extract', 'Chili Powder Mix', 'Plant-based Fungicides'],
        delivery: true,
        verified: true,
        experience: '8+ years',
        image: '/farmer4.png'
      },
      {
        _id: '35',
        name: 'Mushroom Culture Labs',
        category: 'seeds',
        categories: ['seeds', 'mushroom', 'organic'],
        location: 'Solan, Himachal Pradesh',
        rating: 4.9,
        phone: '+91 9876543244',
        email: 'culture@mushrooms.com',
        description: 'Mushroom spawn and cultivation kits for modern mushroom farming',
        detailedDescription: 'We supply high-quality mushroom spawn and complete cultivation kits. Our training programs help farmers start profitable mushroom farming operations.',
        products: ['Oyster Spawn', 'Button Mushroom Culture', 'Cultivation Kits', 'Growing Substrates'],
        delivery: true,
        verified: true,
        experience: '10+ years',
        image: '/farmer5.png'
      }
    ];

    // Return all suppliers
    res.json({ suppliers: allSuppliers });
  } catch (error) {
    console.error('Suppliers fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch suppliers',
      fallback: 'Please try again later'
    });
  }
});

/**
 * @swagger
 * /api/ml/comprehensive-analysis:
 *   post:
 *     summary: Get comprehensive ML analysis (all models)
 *     tags: [ML Comprehensive]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               soil_data:
 *                 type: object
 *                 properties:
 *                   N:
 *                     type: number
 *                   P:
 *                     type: number
 *                   K:
 *                     type: number
 *                   temperature:
 *                     type: number
 *                   humidity:
 *                     type: number
 *                   ph:
 *                     type: number
 *                   rainfall:
 *                     type: number
 *                   moisture:
 *                     type: number
 *                   soil_type:
 *                     type: string
 *               current_crop:
 *                 type: string
 *               forecast_data:
 *                 type: object
 *                 properties:
 *                   region:
 *                     type: string
 *                   crop:
 *                     type: string
 *     responses:
 *       200:
 *         description: Comprehensive analysis completed successfully
 */
app.post('/api/ml/comprehensive-analysis', async (req, res) => {
  try {
    // Call ML API
    const mlResponse = await axios.post(`${ML_API_BASE}/api/ml/comprehensive-analysis`, req.body);

    res.json(mlResponse.data);
  } catch (error) {
    console.error('ML Comprehensive Analysis error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({ 
      error: 'ML service unavailable',
      fallback: 'Please try again later'
    });
  }
});

// Legacy endpoint for backward compatibility
app.post('/api/recommendation', (req, res) => {
  try {
    const { soil_type, season } = req.body;

    if (!soil_type || !season) {
      return res.status(400).json({ error: 'soil_type and season are required' });
    }

    // Mock recommendation logic based on soil and season
    const cropRecommendations = {
      'loamy': {
        'kharif': ['Rice', 'Cotton', 'Sugarcane'],
        'rabi': ['Wheat', 'Barley', 'Mustard'],
        'zaid': ['Watermelon', 'Cucumber', 'Fodder']
      },
      'clay': {
        'kharif': ['Rice', 'Jute', 'Sugarcane'],
        'rabi': ['Wheat', 'Gram', 'Pea'],
        'zaid': ['Rice', 'Sugarcane', 'Fodder']
      },
      'sandy': {
        'kharif': ['Millet', 'Groundnut', 'Cotton'],
        'rabi': ['Barley', 'Gram', 'Mustard'],
        'zaid': ['Watermelon', 'Muskmelon', 'Fodder']
      }
    };

    const recommended = cropRecommendations[soil_type.toLowerCase()]?.[season.toLowerCase()] || ['Consult local agricultural expert'];

    res.json({ recommended });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit user feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The feedback message
 *               category:
 *                 type: string
 *                 enum: [general, bug, feature, improvement, complaint]
 *                 default: general
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Feedback received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feedbackId:
 *                   type: string
 */
app.post('/api/feedback', authenticateToken, async (req, res) => {
  try {
    const { message, category, rating } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'A valid message is required' });
    }

    const userId = req.user.id; // Get user ID from authenticated token

    // Create and save the feedback
    const newFeedback = new Feedback({
      userId,
      message: message.trim(),
      category: category || 'general',
      rating: rating || null
    });

    await newFeedback.save();

    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedbackId: newFeedback._id
    });
  } catch (error) {
    console.error('Feedback error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all feedbacks for the user
app.get('/api/feedback', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const feedbacks = await Feedback.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ feedbacks });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid token
 */
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid token
 */
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, location, farmSize, cropTypes } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: user._id } 
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update user profile
    const updateData = {};
    if (username) updateData.username = username.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (location) updateData.location = location.trim();
    if (farmSize !== undefined) updateData.farmSize = farmSize;
    if (cropTypes) updateData.cropTypes = cropTypes;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      message: 'Profile updated',
      user: updatedUser.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/user/predictions:
 *   get:
 *     summary: Get user's prediction history
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of predictions to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: User prediction history retrieved successfully
 */
app.get('/api/user/predictions', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const predictions = await Prediction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('prediction cropType createdAt verified');

    const total = await Prediction.countDocuments({ userId: req.user.id });

    res.json({
      predictions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Prediction history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/admin/feedback:
 *   get:
 *     summary: Get all feedback (Admin only - for demo purposes)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, resolved, closed]
 *         description: Filter by feedback status
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 */
app.get('/api/admin/feedback', async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;

    const feedbacks = await Feedback.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(feedbacks);
  } catch (error) {
    console.error('Admin feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
app.get('/api/stats/dashboard', async (req, res) => {
  try {
    // Get various statistics
    const [
      totalUsers,
      totalPredictions,
      totalFeedback,
      recentPredictions,
      diseaseStats
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Prediction.countDocuments(),
      Feedback.countDocuments(),
      Prediction.find().sort({ createdAt: -1 }).limit(5).select('prediction.disease createdAt'),
      Prediction.aggregate([
        {
          $group: {
            _id: '$prediction.disease',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$prediction.confidence' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      summary: {
        totalUsers,
        totalPredictions,
        totalFeedback,
        activeUsers: totalUsers // For demo - in real app, count active users differently
      },
      recentActivity: recentPredictions,
      diseaseDistribution: diseaseStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/user/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: User's password for confirmation
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
app.delete('/api/user/delete', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Soft delete - deactivate account instead of hard delete
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/predictions/search:
 *   get:
 *     summary: Search predictions by disease or crop type
 *     tags: [Crop Prediction]
 *     parameters:
 *       - in: query
 *         name: disease
 *         schema:
 *           type: string
 *         description: Search by disease name
 *       - in: query
 *         name: cropType
 *         schema:
 *           type: string
 *         description: Search by crop type
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: Predictions search results
 */
app.get('/api/predictions/search', async (req, res) => {
  try {
    const { disease, cropType, verified } = req.query;
    const filter = {};

    if (disease) {
      filter['prediction.disease'] = new RegExp(disease, 'i');
    }
    if (cropType) {
      filter.cropType = cropType;
    }
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const predictions = await Prediction.find(filter)
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(20)
      .select('prediction cropType createdAt verified userId');

    res.json(predictions);
  } catch (error) {
    console.error('Prediction search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ML API INTEGRATION ENDPOINTS =====

/**
 * @swagger
 * /api/ml/crop-recommendation:
 *   post:
 *     summary: Get AI-powered crop recommendations based on soil and environmental data
 *     tags: [ML - Crop Intelligence]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [N, P, K, temperature, humidity, ph, rainfall]
 *             properties:
 *               N:
 *                 type: number
 *               P:
 *                 type: number
 *               K:
 *                 type: number
 *               temperature:
 *                 type: number
 *               humidity:
 *                 type: number
 *               ph:
 *                 type: number
 *               rainfall:
 *                 type: number
 *     responses:
 *       200:
 *         description: Crop recommendations retrieved successfully
 */
app.post('/api/ml/crop-recommendation', async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    // Validate required fields
    const requiredFields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Call ML API using configured client
    console.log(`🤖 Calling ML API: ${ML_API_BASE}/api/ml/crop-recommendation`);
    const mlResponse = await mlApiClient.post('/api/ml/crop-recommendation', {
      N: parseFloat(N),
      P: parseFloat(P),
      K: parseFloat(K),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall)
    });

    console.log('✅ ML API response received:', mlResponse.status);
    
    // Check if the response was successful
    if (mlResponse.status >= 200 && mlResponse.status < 300) {
      res.json(mlResponse.data);
    } else {
      console.error('❌ ML API returned error status:', mlResponse.status);
      res.status(mlResponse.status).json(mlResponse.data || { error: 'ML service error' });
    }
  } catch (error) {
    console.error('❌ ML Crop Recommendation error:', error.message);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'ML service unavailable',
        message: 'Cannot connect to ML service. Please ensure it is deployed and running.',
        ml_api_base: ML_API_BASE
      });
    }
    
    res.status(500).json({ 
      error: 'ML service error',
      message: error.message,
      ml_api_base: ML_API_BASE
    });
  }
});

/**
 * @swagger
 * /api/ml/demand-forecast:
 *   post:
 *     summary: Get market demand forecast for specific crop and region
 *     tags: [ML - Market Intelligence]
 */
app.post('/api/ml/demand-forecast', async (req, res) => {
  try {
    const { year, month, region, crop } = req.body;

    if (!year || !month || !region || !crop) {
      return res.status(400).json({ error: 'year, month, region, and crop are required' });
    }

    console.log(`🤖 Calling ML API: ${ML_API_BASE}/api/ml/demand-forecast`);
    const response = await mlApiClient.post('/api/ml/demand-forecast', {
      year: parseInt(year),
      month: parseInt(month),
      region: region.toString(),
      crop: crop.toString()
    });

    res.json(response.data);
  } catch (error) {
    console.error('ML Demand Forecast error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'ML service unavailable',
        fallback: 'Market demand data temporarily unavailable'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to get demand forecast',
      details: error.response?.data?.error || error.message
    });
  }
});

/**
 * @swagger
 * /api/ml/crop-rotation:
 *   post:
 *     summary: Get intelligent crop rotation recommendations
 *     tags: [ML - Crop Intelligence]
 */
app.post('/api/ml/crop-rotation', async (req, res) => {
  try {
    const { 
      current_crop, soil_type, temperature, humidity, moisture, 
      nitrogen, phosphorous, potassium, top_k = 5 
    } = req.body;

    const requiredFields = [
      'current_crop', 'soil_type', 'temperature', 'humidity', 
      'moisture', 'nitrogen', 'phosphorous', 'potassium'
    ];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    console.log(`🤖 Calling ML API: ${ML_API_BASE}/api/ml/crop-rotation`);
    const response = await mlApiClient.post('/api/ml/crop-rotation', {
      current_crop: current_crop.toString(),
      soil_type: soil_type.toString(),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      moisture: parseFloat(moisture),
      nitrogen: parseFloat(nitrogen),
      phosphorous: parseFloat(phosphorous),
      potassium: parseFloat(potassium),
      top_k: parseInt(top_k)
    });

    res.json(response.data);
  } catch (error) {
    console.error('ML Crop Rotation error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'ML service unavailable',
        fallback: 'Crop rotation recommendations temporarily unavailable'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to get crop rotation recommendations',
      details: error.response?.data?.error || error.message
    });
  }
});

/**
 * @swagger
 * /api/ml/health:
 *   get:
 *     summary: Check ML service health status
 *     tags: [ML - System]
 */
app.get('/api/ml/health', async (req, res) => {
  try {
    console.log(`🤖 Testing ML API health: ${ML_API_BASE}/health`);
    const response = await mlApiClient.get('/health');
    res.json({
      status: 'OK',
      ml_service: response.data,
      integration: 'Backend successfully connected to ML service'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      error: 'ML service unavailable',
      details: error.message,
      ml_api_base: ML_API_BASE
    });
  }
});

// Helper function for fallback chatbot responses
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Crop-related queries
  if (lowerMessage.includes('crop') || lowerMessage.includes('plant') || lowerMessage.includes('grow')) {
    return `🌾 **Crop Selection Guide**

For successful crop selection, consider these key factors:

**Environmental Factors:**
• **Soil Type:** Sandy, loamy, or clay - each suits different crops
• **Climate:** Temperature range, rainfall patterns (annual/seasonal)
• **Season:** Summer (hot-weather crops), Winter (cool-season crops), Monsoon (water-intensive crops)

**Popular Crop Categories:**

**Summer Crops:**
• Vegetables: Tomatoes, peppers, cucumbers, squash
• Grains: Maize, sorghum, pearl millet
• Cash Crops: Cotton, sunflower

**Winter Crops:**
• Vegetables: Cabbage, cauliflower, peas, carrots
• Grains: Wheat, barley, mustard
• Pulses: Chickpeas, lentils

**Monsoon/Kharif Crops:**
• Rice, soybeans, groundnut, sugarcane

💡 **Pro Tip:** Visit our **ML Insights** page for AI-powered crop recommendations based on your specific soil parameters (N, P, K, pH), temperature, humidity, and rainfall data!`;
  }
  
  // Weather-related queries
  if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('temperature')) {
    return `⛅ **Weather & Agriculture Guide**

Weather plays a crucial role in farming decisions:

**Temperature Considerations:**
• **Optimal Growth:** Most crops thrive between 15-30°C (59-86°F)
• **Frost Damage:** Protect crops when temp drops below 0°C (32°F)
• **Heat Stress:** Above 35°C (95°F) can reduce yields - use shade nets or irrigation

**Rainfall Management:**
• **Adequate:** 500-1000mm annually for most crops
• **Excess Rain:** Ensure proper drainage, use raised beds
• **Drought:** Install drip irrigation, mulching for water conservation

**Weather-Based Actions:**
• **Before Rain:** Avoid fertilizer application, prepare drainage
• **During Dry Spells:** Increase irrigation frequency, add mulch
• **Frost Forecast:** Cover sensitive plants, use heaters/smoke

🌤️ Check our **Weather** page for real-time forecasts and farming recommendations!`;
  }
  
  // Pest and disease queries
  if (lowerMessage.includes('pest') || lowerMessage.includes('disease') || lowerMessage.includes('insect') || lowerMessage.includes('bug')) {
    return `🐛 **Pest & Disease Management Guide**

**Integrated Pest Management (IPM) Approach:**

**1. Prevention (Best Strategy):**
• Crop rotation every 2-3 seasons
• Plant resistant varieties
• Maintain proper plant spacing (reduces humidity/disease)
• Remove crop debris after harvest
• Use disease-free seeds

**2. Monitoring:**
• Inspect plants weekly for signs (discoloration, holes, wilting)
• Use pheromone traps for early detection
• Check undersides of leaves

**3. Organic Control Methods:**
• **Neem Oil:** Effective against aphids, whiteflies (5ml/liter water)
• **Beneficial Insects:** Ladybugs eat aphids, wasps control caterpillars
• **Garlic/Chili Spray:** Natural deterrent for many pests
• **Bacillus thuringiensis (Bt):** Organic bacterial insecticide

**4. Chemical Control (Last Resort):**
• Identify pest accurately first
• Use recommended pesticides only
• Follow safety guidelines strictly
• Alternate chemicals to prevent resistance

**Common Problems:**
• **Aphids:** Neem oil, ladybugs
• **Caterpillars:** Bt spray, hand-picking
• **Fungal Diseases:** Proper spacing, fungicides
• **Root Rot:** Improve drainage, reduce watering

⚠️ Always wear protective gear when applying treatments!`;
  }
  
  // Soil-related queries
  if (lowerMessage.includes('soil') || lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient') || lowerMessage.includes('compost')) {
    return `🌱 **Soil Health & Fertilization Guide**

**Essential Soil Parameters:**

**pH Levels:**
• **Neutral (6.5-7.5):** Ideal for most crops
• **Acidic (<6.5):** Add lime to increase pH
• **Alkaline (>7.5):** Add sulfur or organic matter to lower pH

**Primary Nutrients (NPK):**
• **Nitrogen (N):** Leaf growth, green color (deficiency = yellowing)
• **Phosphorus (P):** Root development, flowering (deficiency = purple leaves)
• **Potassium (K):** Overall health, disease resistance (deficiency = brown edges)

**NPK Ratios for Different Crops:**
• **Leafy Vegetables:** 3-1-2 (high N)
• **Flowering/Fruiting:** 1-2-2 (balanced P & K)
• **Root Crops:** 1-2-3 (high K)

**Soil Improvement Strategies:**

**Organic Matter:**
• **Compost:** 5-10 tons/hectare annually
• **Green Manure:** Grow legumes, plow back before flowering
• **Mulching:** 2-3 inch layer retains moisture, adds nutrients

**Testing & Amendment:**
• Get soil tested every 2-3 years
• Add organic matter to improve texture
• Ensure good drainage (raised beds if needed)

**Natural Fertilizers:**
• **Cow Manure:** Excellent all-purpose (aged 6 months)
• **Vermicompost:** Rich in micronutrients
• **Bone Meal:** High phosphorus for flowering
• **Wood Ash:** Adds potassium

🔬 Visit our **ML Insights** page to input your soil NPK values for personalized crop recommendations!`;
  }
  
  // Irrigation queries
  if (lowerMessage.includes('water') || lowerMessage.includes('irrigation') || lowerMessage.includes('drip')) {
    return `💧 **Irrigation & Water Management Guide**

**Irrigation Methods:**

**1. Drip Irrigation (Most Efficient):**
• Water efficiency: 90-95%
• Delivers water directly to roots
• Reduces disease risk (keeps leaves dry)
• Best for: Row crops, vegetables, orchards
• Cost: Higher initial, lower operational

**2. Sprinkler System:**
• Water efficiency: 70-80%
• Covers large areas evenly
• Can cause leaf diseases if overused
• Best for: Field crops, lawns

**3. Furrow/Flood Irrigation:**
• Water efficiency: 50-60%
• Traditional method, low tech
• Can cause waterlogging
• Best for: Rice, sugarcane

**Watering Best Practices:**

**Timing:**
• **Early Morning (6-10 AM):** Best - less evaporation, leaves dry by evening
• **Evening:** Acceptable but may promote fungal growth
• **Midday:** Avoid - high evaporation, water stress

**Frequency & Amount:**
• **Sandy Soil:** Frequent light watering (every 2-3 days)
• **Clay Soil:** Less frequent deep watering (every 5-7 days)
• **General Rule:** 1-2 inches per week for most vegetables
• **Check:** Soil should be moist 6 inches deep

**Water Conservation:**
• Mulch to reduce evaporation (reduces water need by 25%)
• Fix leaks in irrigation systems
• Collect rainwater in tanks
• Use drip irrigation with timers
• Group plants by water needs

**Signs of Water Issues:**
• **Underwatering:** Wilting, dry soil, slow growth
• **Overwatering:** Yellow leaves, root rot, fungal growth

💡 Adjust watering based on rainfall, temperature, and growth stage!`;
  }
  
  // Fertilizer timing queries
  if (lowerMessage.includes('when') && (lowerMessage.includes('fertilize') || lowerMessage.includes('fertilizer'))) {
    return `⏰ **Fertilizer Application Timing Guide**

**Growth Stage Fertilization:**

**1. Pre-Planting (1-2 weeks before):**
• Apply basal/base fertilizer
• Mix compost or aged manure into soil
• Add phosphorus-rich fertilizer (for root development)

**2. Vegetative Stage:**
• Apply nitrogen-rich fertilizer
• Frequency: Every 2-4 weeks
• Example: Urea, ammonium nitrate

**3. Flowering/Fruiting Stage:**
• Reduce nitrogen, increase phosphorus & potassium
• Use bloom boosters (10-52-10 ratio)
• Apply when first flowers appear

**4. Post-Harvest:**
• Apply balanced fertilizer to replenish soil
• Add organic matter for next crop

**Application Tips:**
• **Morning/Evening:** Best time (cooler temperature)
• **After Rain:** Nutrients absorb better in moist soil
• **Avoid:** Don't fertilize stressed, diseased, or wilted plants
• **Water After:** Helps dissolve and distribute nutrients

**Seasonal Timing:**
• **Spring:** Heavy feeding as plants grow
• **Summer:** Lighter, more frequent applications
• **Fall:** Reduce nitrogen, increase potassium (for winter hardiness)
• **Winter:** Minimal or no fertilization for dormant plants

🌿 Less is more - over-fertilization burns roots and pollutes groundwater!`;
  }
  
  // Default response
  return `🌾 **Welcome to Your AI Agricultural Assistant!**

I'm here to help you with comprehensive farming advice. Ask me about:

**🌱 Crop Management:**
• Which crops to plant and when
• Crop rotation strategies
• Variety selection and planting techniques
• Growth stage management

**🌍 Soil & Nutrients:**
• Soil testing and improvement
• NPK ratios and fertilization schedules
• Organic vs chemical fertilizers
• Composting and soil amendments

**💧 Water Management:**
• Irrigation methods and timing
• Water conservation techniques
• Drainage solutions
• Drought management

**🐛 Pest & Disease Control:**
• Pest identification and prevention
• Organic and chemical control methods
• Integrated Pest Management (IPM)
• Disease diagnosis and treatment

**⛅ Weather & Climate:**
• Seasonal planning
• Weather-based farming decisions
• Climate adaptation strategies
• Frost and heat protection

**📊 Advanced Tools:**
Visit our **ML Insights** page for:
• AI-powered crop recommendations (based on soil NPK, pH, rainfall, temperature)
• Demand forecasting for market planning
• Optimal crop rotation suggestions

💬 **Example Questions:**
• "What's the best fertilizer for tomatoes?"
• "How do I control aphids organically?"
• "When should I plant wheat in my region?"
• "What's the ideal soil pH for rice?"

Ask me anything about agriculture and farming!`;
}

// Chatbot endpoint
app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: `You are an expert agricultural AI assistant with deep knowledge in farming, crop science, agronomy, and sustainable agriculture practices. 

Your expertise includes:
- Crop selection, planting schedules, and cultivation techniques
- Soil management, fertilization, and nutrient requirements (NPK ratios)
- Pest and disease identification and organic/chemical control methods
- Irrigation systems, water management, and conservation
- Weather impact on crops and climate-smart agriculture
- Crop rotation, intercropping, and sustainable farming practices
- Market trends, crop demand, and economic considerations
- Modern agricultural technologies and precision farming

Guidelines for responses:
1. Provide specific, actionable advice with practical steps
2. Include relevant numbers, measurements, or ranges when applicable (e.g., "pH 6.0-7.0", "30-40 cm spacing")
3. Consider local climate zones and seasonal variations in your advice
4. Mention both traditional and modern farming techniques when relevant
5. Suggest preventive measures and early intervention strategies
6. Keep responses well-structured with bullet points or numbered lists for clarity
7. When discussing chemicals or treatments, always mention safety precautions
8. Encourage sustainable and environmentally friendly practices

Respond in a friendly, professional manner. Make complex agricultural concepts easy to understand for farmers of all experience levels.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3001',
          'X-Title': 'AgriMetrix Agricultural Assistant'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      const botResponse = response.data.choices[0].message.content;
      res.json({ response: botResponse });
    } else if (response.data && response.data.error) {
      // Handle OpenRouter API errors
      console.error('OpenRouter API error:', response.data.error);
      const errorMessage = response.data.error.message || 'Failed to get response from AI';
      
      // Provide a helpful fallback response
      const fallbackResponse = getFallbackResponse(message);
      res.json({ 
        response: fallbackResponse,
        warning: 'Using fallback response due to AI service issue'
      });
    } else {
      console.error('Unexpected response structure:', response.data);
      const fallbackResponse = getFallbackResponse(message);
      res.json({ 
        response: fallbackResponse,
        warning: 'Using fallback response'
      });
    }
  } catch (error) {
    console.error('Chatbot error:', error.message);
    
    // Always provide a fallback response
    const fallbackResponse = getFallbackResponse(message);
    
    if (error.response && error.response.status === 429) {
      // Rate limiting - still provide fallback
      res.json({ 
        response: fallbackResponse,
        warning: 'AI service rate limit reached. Using fallback response.'
      });
    } else if (error.code === 'ECONNABORTED') {
      res.json({ 
        response: fallbackResponse,
        warning: 'Request timeout. Using fallback response.'
      });
    } else {
      // Any other error - provide fallback
      res.json({ 
        response: fallbackResponse,
        warning: 'AI service temporarily unavailable. Using fallback response.'
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AgriMetrix API is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Helper function to convert tomorrow.io weather codes to descriptions
function getWeatherDescription(weatherCode) {
  const weatherDescriptions = {
    1000: 'Clear',
    1001: 'Cloudy',
    1100: 'Mostly Clear',
    1101: 'Partly Cloudy',
    1102: 'Mostly Cloudy',
    2000: 'Fog',
    2100: 'Light Fog',
    4000: 'Drizzle',
    4001: 'Rain',
    4200: 'Light Rain',
    4201: 'Heavy Rain',
    5000: 'Snow',
    5001: 'Flurries',
    5100: 'Light Snow',
    5101: 'Heavy Snow',
    6000: 'Freezing Drizzle',
    6001: 'Freezing Rain',
    6200: 'Light Freezing Rain',
    6201: 'Heavy Freezing Rain',
    7000: 'Ice Pellets',
    7101: 'Heavy Ice Pellets',
    7102: 'Light Ice Pellets',
    8000: 'Thunderstorm'
  };
  return weatherDescriptions[weatherCode] || 'Unknown';
}

// Helper function to get weather condition category
function getWeatherCondition(weatherCode) {
  if (weatherCode >= 1000 && weatherCode < 2000) return 'Clear';
  if (weatherCode >= 2000 && weatherCode < 3000) return 'Foggy';
  if (weatherCode >= 4000 && weatherCode < 5000) return 'Rainy';
  if (weatherCode >= 5000 && weatherCode < 6000) return 'Snowy';
  if (weatherCode >= 6000 && weatherCode < 7000) return 'Freezing';
  if (weatherCode >= 7000 && weatherCode < 8000) return 'Icy';
  if (weatherCode >= 8000) return 'Thunderstorm';
  return 'Unknown';
}

// Helper function to get weather icon
function getWeatherIcon(weatherCode) {
  const icons = {
    1000: '☀️', // Clear
    1001: '☁️', // Cloudy
    1100: '��️', // Mostly Clear
    1101: '⛅', // Partly Cloudy
    1102: '��️', // Mostly Cloudy
    2000: '��️', // Fog
    2100: '🌫️', // Light Fog
    4000: '��️', // Drizzle
    4001: '��️', // Rain
    4200: '🌦️', // Light Rain
    4201: '🌧️', // Heavy Rain
    5000: '❄️', // Snow
    5001: '🌨️', // Flurries
    5100: '🌨️', // Light Snow
    5101: '❄️', // Heavy Snow
    6000: '🧊', // Freezing Drizzle
    6001: '🌨️', // Freezing Rain
    6200: '🧊', // Light Freezing Rain
    6201: '🧊', // Heavy Freezing Rain
    7000: '🧊', // Ice Pellets
    7101: '🧊', // Heavy Ice Pellets
    7102: '🧊', // Light Ice Pellets
    8000: '⛈️'  // Thunderstorm
  };
  return icons[weatherCode] || '��️';
}

app.listen(PORT, async () => {
  // Connect to MongoDB
  await connectDB();
  
  console.log(`�� AnnData API Server running on port ${PORT}`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});