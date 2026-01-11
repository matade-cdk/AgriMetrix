import React, { useState } from 'react';
import { Upload, Brain, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import './PredictPage.css';

const PredictPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setError('');
        setPrediction(null);
      } else {
        setError('Please select a valid image file (JPG, PNG, etc.)');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile, 'crop-image.jpg');

      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ann-data-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE_URL}/crops/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setPrediction({
          disease: data.prediction,
          confidence: Math.round(data.confidence * 100),
          recommendations: getTreatment(data.prediction),
          prevention: getPreventionTips(data.prediction)
        });
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Prediction failed');
        setPrediction(null);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Network error. Please try again.');
      setPrediction(null);
    }

    setLoading(false);
  };

  const getTreatment = (disease) => {
    const treatments = {
      'Healthy': ['Continue current care practices'],
      'Blight': ['Apply copper-based fungicide', 'Improve air circulation'],
      'Rust': ['Use sulfur-based fungicide', 'Remove infected leaves'],
      'Leaf Spot': ['Apply fungicide', 'Avoid overhead watering'],
      'Powdery Mildew': ['Improve air circulation', 'Apply neem oil']
    };
    return treatments[disease] || ['Consult local agricultural expert'];
  };

  const getPreventionTips = (disease) => {
    const tips = {
      'Healthy': 'Maintain good farming practices',
      'Blight': 'Ensure proper spacing and avoid overhead watering',
      'Rust': 'Plant resistant varieties and ensure good air circulation',
      'Leaf Spot': 'Avoid wetting leaves and provide adequate spacing',
      'Powdery Mildew': 'Maintain low humidity and good air circulation'
    };
    return tips[disease] || 'Follow standard disease prevention practices';
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPrediction(null);
    setError('');
  };

  return (
    <div className="predict-page">
      <div className="predict-header">
        <h1>AI Plant Disease Detection</h1>
        <p>Upload a plant image to detect diseases and get treatment recommendations</p>
      </div>

      <div className="predict-container">
        <div className="upload-section">
          <div 
            className={`upload-area ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="file-preview">
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Selected plant" 
                  className="preview-image"
                />
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <button onClick={removeImage} className="btn btn-outline btn-sm">
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-prompt">
                <Camera size={48} className="upload-icon" />
                <h3>Upload Plant Image</h3>
                <p>Drag and drop an image here, or click to select</p>
                <p className="upload-formats">Supports JPG, PNG, JPEG files</p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
              id="file-input"
            />
            
            {!selectedFile && (
              <label htmlFor="file-input" className="upload-button">
                <Upload size={20} />
                Choose Image
              </label>
            )}
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {selectedFile && (
            <button 
              onClick={handlePredict}
              className="btn btn-primary btn-lg predict-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Brain size={20} />
                  Detect Disease
                </>
              )}
            </button>
          )}
        </div>

        {prediction && (
          <div className="prediction-results">
            <div className="result-header">
              <CheckCircle size={24} className="success-icon" />
              <h3>Analysis Complete</h3>
            </div>

            <div className="prediction-card">
              <div className="prediction-main">
                <h4>Detected Condition</h4>
                <p className="disease-name">{prediction.disease || prediction.class || 'Unknown'}</p>
                
                {prediction.confidence && (
                  <div className="confidence-score">
                    <span className="confidence-label">Confidence:</span>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill"
                        style={{ width: `${(prediction.confidence * 100) || 0}%` }}
                      ></div>
                    </div>
                    <span className="confidence-value">{Math.round((prediction.confidence * 100) || 0)}%</span>
                  </div>
                )}
              </div>

              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>Treatment Recommendations</h4>
                  <ul>
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.prevention && (
                <div className="prevention-tips">
                  <h4>Prevention Tips</h4>
                  <p>{prediction.prevention}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictPage;
