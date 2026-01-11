import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, Calendar, RefreshCw } from 'lucide-react';
import './InsightsPage.css';

const InsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchInsights();
  }, [timeRange]);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ann-data-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE_URL}/predictions/insights?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setInsights(data.insights);
        setError('');
      } else {
        // Fallback to sample data
        const sampleInsights = {
          totalPredictions: 156,
          predictionsChange: 12,
          accuracyRate: 94.2,
          accuracyChange: 2.1,
          activeUsers: 23,
          diseaseDetectionRate: 15.8,
          popularCrops: [
            { name: 'Tomato', count: 45, percentage: 35 },
            { name: 'Potato', count: 32, percentage: 28 },
            { name: 'Wheat', count: 28, percentage: 22 },
            { name: 'Rice', count: 25, percentage: 20 }
          ],
          diseaseTrends: [
            { name: 'Leaf Blight', percentage: 32, description: 'Most common disease detected' },
            { name: 'Rust', percentage: 28, description: 'Affecting wheat crops mainly' },
            { name: 'Powdery Mildew', percentage: 20, description: 'Common in humid conditions' }
          ],
          timeline: [
            { date: '2026-01-10', predictions: 15, mostCommon: 'Healthy Crops' },
            { date: '2026-01-09', predictions: 12, mostCommon: 'Leaf Spot' },
            { date: '2026-01-08', predictions: 18, mostCommon: 'Healthy Crops' }
          ],
          recommendations: [
            { priority: 'HIGH', title: 'Monitor Soil Moisture', description: 'Current conditions favor fungal diseases' },
            { priority: 'MED', title: 'Apply Preventive Spray', description: 'Weather forecast shows high humidity' }
          ]
        };
        setInsights(sampleInsights);
        setError(data.message || 'Using sample data - API connection issues');
      }
    } catch (err) {
      console.error('Insights fetch error:', err);
      // Fallback to sample data
      const sampleInsights = {
        totalPredictions: 156,
        predictionsChange: 12,
        accuracyRate: 94.2,
        accuracyChange: 2.1,
        activeUsers: 23,
        diseaseDetectionRate: 15.8,
        popularCrops: [
          { name: 'Tomato', count: 45, percentage: 35 },
          { name: 'Potato', count: 32, percentage: 28 },
          { name: 'Wheat', count: 28, percentage: 22 }
        ],
        diseaseTrends: [
          { name: 'Leaf Blight', percentage: 32, description: 'Most common disease detected' },
          { name: 'Rust', percentage: 28, description: 'Affecting wheat crops mainly' }
        ],
        recommendations: [
          { priority: 'HIGH', title: 'Monitor Soil Health', description: 'Sample data - check backend connection' }
        ]
      };
      setInsights(sampleInsights);
      setError('Using sample data - Please check your connection');
    }

    setLoading(false);
  }, [timeRange]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="insights-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      <div className="insights-header">
        <h1>Prediction Insights</h1>
        <p>Analyze agricultural prediction trends and patterns</p>
        <div className="time-range-selector">
          <label htmlFor="time-range">Time Range:</label>
          <select 
            id="time-range"
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message"><p>{error}</p></div>}

      {insights && (
        <div className="insights-grid">
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Total Predictions</span>
                <span className="stat-value">{insights.totalPredictions || 0}</span>
                <span className="stat-change positive">+{insights.predictionsChange || 0}%</span>
              </div>
              <BarChart3 className="stat-icon" size={32} />
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Accuracy Rate</span>
                <span className="stat-value">{insights.accuracyRate || 0}%</span>
                <span className="stat-change positive">+{insights.accuracyChange || 0}%</span>
              </div>
              <TrendingUp className="stat-icon" size={32} />
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Active Users</span>
                <span className="stat-value">{insights.activeUsers || 0}</span>
              </div>
              <Activity className="stat-icon" size={32} />
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Disease Detection</span>
                <span className="stat-value">{insights.diseaseDetectionRate || 0}%</span>
              </div>
              <PieChart className="stat-icon" size={32} />
            </div>
          </div>

          {insights.popularCrops && insights.popularCrops.length > 0 && (
            <div className="insight-card">
              <h3>Popular Crops</h3>
              <div className="crop-list">
                {insights.popularCrops.map((crop, idx) => (
                  <div key={idx} className="crop-item">
                    <span className="crop-name">{crop.name}</span>
                    <div className="crop-bar">
                      <div className="crop-fill" style={{ width: `${crop.percentage}%` }}></div>
                    </div>
                    <span className="crop-count">{crop.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.diseaseTrends && insights.diseaseTrends.length > 0 && (
            <div className="insight-card">
              <h3>Disease Trends</h3>
              <div className="trend-list">
                {insights.diseaseTrends.map((trend, idx) => (
                  <div key={idx} className="trend-item">
                    <div className="trend-info">
                      <span className="trend-name">{trend.name}</span>
                      <p className="trend-description">{trend.description}</p>
                    </div>
                    <span className="trend-percentage">{trend.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.recommendations && insights.recommendations.length > 0 && (
            <div className="insight-card full-width">
              <h3>Recommendations</h3>
              <div className="recommendations-list">
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation-item">
                    <span className={`priority ${rec.priority.toLowerCase()}`}>{rec.priority}</span>
                    <div className="rec-content">
                      <h4>{rec.title}</h4>
                      <p>{rec.description}</p>
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
