/**
 * ============================================
 * WEATHER PAGE COMPONENT
 * Real-time weather information with forecasts
 * ============================================
 */

import React, { useState } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Eye, 
  Droplets, 
  Compass, 
  Search 
} from 'lucide-react';
import './WeatherPage.css';

const WeatherPage = () => {
  // -------------------- STATE MANAGEMENT --------------------
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -------------------- API FUNCTIONS --------------------
  
  /**
   * Fetch weather data from API
   * Handles both real-time and fallback data
   */
  const fetchWeather = async () => {
    // Validate input
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Make API request
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ann-data-api.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/weather?location=${encodeURIComponent(location)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle error with fallback
        if (data.error) {
          setError(`Error: ${data.error}`);
          if (data.fallback) {
            setWeather(data.fallback);
          }
        } else {
          // Map API response to weather state
          setWeather({
            location: data.location,
            condition: data.current.condition,
            temp: data.current.temperature,
            humidity: data.current.humidity,
            wind: data.current.windSpeed,
            icon: data.current.icon,
            feelsLike: data.current.feelsLike,
            pressure: data.current.pressure,
            visibility: data.current.visibility,
            uvIndex: data.current.uvIndex,
            cloudCover: data.current.cloudCover,
            forecast: data.forecast || []
          });
          
          setError('');
        }
      } else {
        // Handle API errors
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch weather');
      }
    } catch (err) {
      // Handle network errors
      console.error('Weather fetch error:', err);
      setError('Network error. Please check your connection.');
      setWeather(null);
    }

    setLoading(false);
  };

  // -------------------- HELPER FUNCTIONS --------------------
  
  /**
   * Get appropriate weather icon based on condition
   * @param {string} condition - Weather condition description
   * @returns {JSX.Element} Weather icon component
   */
  const getWeatherIcon = (condition) => {
    const iconProps = { className: "weather-icon", size: 48 };
    if (!condition) return <Cloud {...iconProps} />;
    
    const cond = condition.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) {
      return <Sun {...iconProps} />;
    } else if (cond.includes('rain') || cond.includes('shower')) {
      return <CloudRain {...iconProps} />;
    } else if (cond.includes('cloud')) {
      return <Cloud {...iconProps} />;
    }
    return <Cloud {...iconProps} />;
  };

  // -------------------- RENDER --------------------
  
  return (
    <div className="weather-page">
      {/* Page Header */}
      <div className="weather-header">
        <h1>Weather Information</h1>
        <p>Get real-time weather data for informed farming decisions</p>
      </div>

      {/* Search Section */}
      <div className="weather-search">
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name (e.g., New York, London)"
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            />
            <button 
              onClick={fetchWeather} 
              className="search-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-small"></div>
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Weather Display */}
      {weather && (
        <div className="weather-display">
          {/* Current Weather */}
          <div className="weather-main">
            <div className="weather-location">
              <h2>{weather.location || location}</h2>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="weather-current">
              {getWeatherIcon(weather.condition)}
              <div className="temperature">
                <span className="temp-value">{Math.round(weather.temperature || weather.temp || 0)}°</span>
                <span className="temp-unit">C</span>
              </div>
              <p className="condition">{weather.condition || weather.description || 'Unknown'}</p>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="weather-details">
            <div className="weather-card">
              <div className="weather-metric">
                <Thermometer className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">Feels Like</span>
                  <span className="metric-value">{Math.round(weather.feelsLike || weather.feels_like || weather.temperature || 0)}°C</span>
                </div>
              </div>
            </div>

            <div className="weather-card">
              <div className="weather-metric">
                <Droplets className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">Humidity</span>
                  <span className="metric-value">{weather.humidity || 0}%</span>
                </div>
              </div>
            </div>

            <div className="weather-card">
              <div className="weather-metric">
                <Wind className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">Wind Speed</span>
                  <span className="metric-value">{weather.windSpeed || weather.wind_speed || 0} km/h</span>
                </div>
              </div>
            </div>

            <div className="weather-card">
              <div className="weather-metric">
                <Eye className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">Visibility</span>
                  <span className="metric-value">{weather.visibility || 10} km</span>
                </div>
              </div>
            </div>

            <div className="weather-card">
              <div className="weather-metric">
                <Compass className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">Pressure</span>
                  <span className="metric-value">{weather.pressure || 1013} mb</span>
                </div>
              </div>
            </div>

            <div className="weather-card">
              <div className="weather-metric">
                <Sun className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">UV Index</span>
                  <span className="metric-value">{weather.uvIndex || weather.uv || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Section */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div className="weather-forecast">
              <h3>Forecast</h3>
              <div className="forecast-grid">
                {weather.forecast.slice(0, 7).map((day, index) => (
                  <div key={index} className="forecast-item">
                    <p className="forecast-day">{day.day || `Day ${index + 1}`}</p>
                    <Cloud className="forecast-icon" size={32} />
                    <p className="forecast-temp">{Math.round(day.max_temp || 0)}°C</p>
                    <p className="forecast-condition">{day.condition || 'Clear'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
