import React, { useState } from 'react';
import { Repeat, Zap, TrendingUp, Leaf, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './MLInsightsPage.css';

const InsightsPage = () => {
  const [activeTab, setActiveTab] = useState('crop-recommendation');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Crop Recommendation State
  const [cropFormData, setCropFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [cropRecommendation, setCropRecommendation] = useState(null);

  // Demand Forecasting State
  const [demandFormData, setDemandFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    region: '',
    crop: ''
  });
  const [demandForecast, setDemandForecast] = useState(null);

  // Crop Rotation State
  const [rotationFormData, setRotationFormData] = useState({
    current_crop: '',
    soil_type: '',
    temperature: '',
    humidity: '',
    moisture: '',
    nitrogen: '',
    phosphorous: '',
    potassium: '',
    top_k: 5
  });
  const [rotationRecommendations, setRotationRecommendations] = useState(null);

  const token = localStorage.getItem('token');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ann-data-api.onrender.com/api';

  // API call functions
  const getCropRecommendation = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('🌱 Calling crop recommendation API:', `${API_BASE_URL}/ml/crop-recommendation`);
      const response = await axios.post(`${API_BASE_URL}/ml/crop-recommendation`, cropFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000
      });

      console.log('✅ Crop recommendation response:', response.data);
      if (response.data && (response.data.success !== false)) {
        const data = response.data.data || response.data;
        setCropRecommendation(data);
        setMessage('✅ AI crop recommendation generated successfully!');
      } else {
        setMessage(response.data.error || 'Failed to get crop recommendation');
      }
    } catch (error) {
      console.error('❌ Crop recommendation error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Network error. Please try again.';
      setMessage(`❌ ${errorMsg}`);
    }
    
    setLoading(false);
  };

  const getDemandForecast = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('📈 Calling demand forecast API:', `${API_BASE_URL}/ml/demand-forecast`);
      const response = await axios.post(`${API_BASE_URL}/ml/demand-forecast`, demandFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000
      });

      console.log('✅ Demand forecast response:', response.data);
      if (response.data && (response.data.success !== false)) {
        const data = response.data.data || response.data;
        setDemandForecast(data);
        setMessage('✅ Market demand forecast generated successfully!');
      } else {
        setMessage(response.data.error || 'Failed to get demand forecast');
      }
    } catch (error) {
      console.error('❌ Demand forecast error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Network error. Please try again.';
      setMessage(`❌ ${errorMsg}`);
    }
    
    setLoading(false);
  };

  const getCropRotation = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('🔄 Calling crop rotation API:', `${API_BASE_URL}/ml/crop-rotation`);
      const response = await axios.post(`${API_BASE_URL}/ml/crop-rotation`, rotationFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000
      });

      console.log('✅ Crop rotation response:', response.data);
      if (response.data && (response.data.success !== false)) {
        const data = response.data.data || response.data;
        setRotationRecommendations(data);
        setMessage('✅ Crop rotation recommendations generated successfully!');
      } else {
        setMessage(response.data.error || 'Failed to get crop rotation recommendations');
      }
    } catch (error) {
      console.error('❌ Crop rotation error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Network error. Please try again.';
      setMessage(`❌ ${errorMsg}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="insights-page">
      <div className="insights-header">
        <h1>🧠 AI-Powered Agricultural Intelligence</h1>
        <p>Advanced machine learning insights for smart farming decisions</p>
      </div>

      {message && (
        <div className={message.includes('✅') ? 'message-success' : 'message-error'}>
          {message}
        </div>
      )}

      <div className="ml-tabs">
        {[
          { id: 'crop-recommendation', label: 'Crop Recommendation', icon: <Leaf className="tab-icon" />, description: 'Soil-based' },
          { id: 'demand-forecast', label: 'Market Forecast', icon: <TrendingUp className="tab-icon" />, description: 'Price trends' },
          { id: 'crop-rotation', label: 'Crop Rotation', icon: <Repeat className="tab-icon" />, description: 'Soil health' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`ml-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            title={tab.description}
          >
            {tab.icon}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'crop-recommendation' && (
        <div className="ml-section">
          <div className="section-header">
            <div className="header-content">
              <Leaf size={3} className="section-icon" />
              <div>
                <h3>🌱 AI Crop Recommendation</h3>
              </div>
            </div>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); getCropRecommendation(); }} className="ml-form">
            <div className="form-grid">
              <div className="input-wrapper">
                <label>Nitrogen (N) Content</label>
                <input
                  type="number"
                  placeholder="0-200 mg/kg"
                  value={cropFormData.N}
                  onChange={(e) => setCropFormData({...cropFormData, N: e.target.value})}
                  min="0"
                  max="200"
                  step="0.1"
                  required
                />
              </div>
              <div className="input-wrapper">
                <label>Phosphorous (P) Content</label>
                <input
                  type="number"
                  placeholder="mg/kg"
                  value={cropFormData.P}
                  onChange={(e) => setCropFormData({...cropFormData, P: e.target.value})}
                  required
                />
              </div>
              <div className="input-wrapper">
                <label>Potassium (K) Content</label>
                <input
                  type="number"
                  placeholder="mg/kg"
                  value={cropFormData.K}
                  onChange={(e) => setCropFormData({...cropFormData, K: e.target.value})}
                  required
                />
              </div>
              <div className="input-wrapper">
                <label>Temperature</label>
                <input
                  type="number"
                  placeholder="°C"
                  value={cropFormData.temperature}
                  onChange={(e) => setCropFormData({...cropFormData, temperature: e.target.value})}
                  required
                />
              </div>
              <div className="input-wrapper">
                <label>Humidity</label>
                <input
                  type="number"
                  placeholder="%"
                  value={cropFormData.humidity}
                  onChange={(e) => setCropFormData({...cropFormData, humidity: e.target.value})}
                  required
                />
              </div>
              <div className="input-wrapper">
                <label>Soil pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="6.5-7.5"
                  value={cropFormData.ph}
                  onChange={(e) => setCropFormData({...cropFormData, ph: e.target.value})}
                  required
                />
              </div>
              <div className="input-wrapper">
                <label>Rainfall</label>
                <input
                  type="number"
                  placeholder="mm"
                  value={cropFormData.rainfall}
                  onChange={(e) => setCropFormData({...cropFormData, rainfall: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="btn btn-primary btn-large">
              {loading ? (
                <>
                  <Zap size={20} className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Leaf size={20} />
                  Get AI Recommendation
                </>
              )}
            </button>
          </form>

          {cropRecommendation && (
            <div className="ml-results">
              <h4><CheckCircle size={24} /> Recommendation Results</h4>
              {cropRecommendation.primary_recommendation && (
                <div className="primary-recommendation">
                  <h5>Top Recommendation: <strong>{cropRecommendation.primary_recommendation}</strong></h5>
                </div>
              )}
              
              {cropRecommendation.all_recommendations && cropRecommendation.all_recommendations.length > 0 ? (
                <div className="recommendations-grid">
                  {cropRecommendation.all_recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-card">
                      <div className="card-rank">#{index + 1}</div>
                      <h5>{rec.crop}</h5>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ width: `${rec.confidence * 100}%` }}
                        ></div>
                      </div>
                      <p className="confidence-text">Confidence: {Math.round(rec.confidence * 100)}%</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="debug-info">
                  <p><strong>Debug:</strong> Response data structure:</p>
                  <pre>{JSON.stringify(cropRecommendation, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'demand-forecast' && (
        <div className="ml-section">
          <h3>📈 Market Demand Forecasting</h3>
          <p>Predict market demand for crops to optimize your planting decisions</p>
          
          <form onSubmit={(e) => { e.preventDefault(); getDemandForecast(); }}>
            <div className="form-grid">
              <input
                type="number"
                placeholder="Year"
                value={demandFormData.year}
                onChange={(e) => setDemandFormData({...demandFormData, year: e.target.value})}
                required
              />
              <select
                value={demandFormData.month}
                onChange={(e) => setDemandFormData({...demandFormData, month: e.target.value})}
                required
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Region (e.g., Maharashtra)"
                value={demandFormData.region}
                onChange={(e) => setDemandFormData({...demandFormData, region: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Crop name (e.g., Rice)"
                value={demandFormData.crop}
                onChange={(e) => setDemandFormData({...demandFormData, crop: e.target.value})}
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Forecasting...' : 'Get Market Forecast'}
            </button>
          </form>

          {demandForecast && (
            <div className="ml-results">
              <h4>📊 Market Demand Forecast Results</h4>
              <div className="forecast-card">
                <p><strong>Crop:</strong> {demandFormData.crop}</p>
                <p><strong>Region:</strong> {demandFormData.region}</p>
                <p><strong>Period:</strong> {new Date(0, demandFormData.month - 1).toLocaleString('default', { month: 'long' })} {demandFormData.year}</p>
                <p><strong>Predicted Demand:</strong> {demandForecast.predicted_demand || demandForecast.demand || 'N/A'} tonnes</p>
                {demandForecast.confidence && (
                  <p><strong>Confidence:</strong> {Math.round(demandForecast.confidence * 100)}%</p>
                )}
                {demandForecast.trend && (
                  <p><strong>Market Trend:</strong> {demandForecast.trend}</p>
                )}
                {demandForecast.recommendations && demandForecast.recommendations.length > 0 && (
                  <div className="forecast-recommendations">
                    <h5>💡 Recommendations:</h5>
                    <ul>
                      {demandForecast.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'crop-rotation' && (
        <div className="ml-section">
          <h3>🔄 Smart Crop Rotation</h3>
          <p>Optimize soil health and yields with AI-powered crop rotation planning</p>
          
          <form onSubmit={(e) => { e.preventDefault(); getCropRotation(); }}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Current crop"
                value={rotationFormData.current_crop}
                onChange={(e) => setRotationFormData({...rotationFormData, current_crop: e.target.value})}
                required
              />
              <select
                value={rotationFormData.soil_type}
                onChange={(e) => setRotationFormData({...rotationFormData, soil_type: e.target.value})}
                required
              >
                <option value="">Select soil type</option>
                <option value="clay">Clay</option>
                <option value="sandy">Sandy</option>
                <option value="loamy">Loamy</option>
                <option value="silt">Silt</option>
              </select>
              <input
                type="number"
                placeholder="Temperature (°C)"
                value={rotationFormData.temperature}
                onChange={(e) => setRotationFormData({...rotationFormData, temperature: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Humidity (%)"
                value={rotationFormData.humidity}
                onChange={(e) => setRotationFormData({...rotationFormData, humidity: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Soil moisture (%)"
                value={rotationFormData.moisture}
                onChange={(e) => setRotationFormData({...rotationFormData, moisture: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Nitrogen level"
                value={rotationFormData.nitrogen}
                onChange={(e) => setRotationFormData({...rotationFormData, nitrogen: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Phosphorous level"
                value={rotationFormData.phosphorous}
                onChange={(e) => setRotationFormData({...rotationFormData, phosphorous: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Potassium level"
                value={rotationFormData.potassium}
                onChange={(e) => setRotationFormData({...rotationFormData, potassium: e.target.value})}
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Planning...' : 'Get Rotation Plan'}
            </button>
          </form>

          {rotationRecommendations && (
            <div className="ml-results">
              <h4>🌾 Recommended Next Crops</h4>
              <div className="rotation-grid">
                {rotationRecommendations.recommendations?.map((rec, index) => (
                  <div key={index} className="rotation-card">
                    <h5>{rec.crop}</h5>
                    <p><strong>Suitability:</strong> {rec.suitability_score}%</p>
                    <p><strong>Benefits:</strong> {rec.benefits}</p>
                    <div className="suitability-bar">
                      <div 
                        className="suitability-fill"
                        style={{ width: `${rec.suitability_score}%` }}
                      ></div>
                    </div>
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

export default InsightsPage;
