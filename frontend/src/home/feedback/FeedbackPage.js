import React, { useState, useEffect } from 'react';
import { Send, Star, MessageSquare, User, Calendar, CheckCircle } from 'lucide-react';
import './FeedbackPage.css';

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    rating: 5,
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ann-data-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks || []);
      } else {
        console.error('Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
    setLoading(false);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.message.trim()) {
      setMessage('Please enter a feedback message');
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ann-data-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFeedback)
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Thank you for your feedback!');
        setNewFeedback({ rating: 5, message: '', category: 'general' });
        fetchFeedbacks();
      } else {
        setMessage(data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('Error submitting feedback. Please try again.');
    }
    setSubmitLoading(false);
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`star ${star <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>Feedback & Reviews</h1>
        <p>Share your experience and help us improve AnnData</p>
      </div>

      {/* Submit Feedback Form */}
      <div className="feedback-form-section">
        <div className="form-card">
          <h2>Submit Your Feedback</h2>
          <form onSubmit={handleSubmitFeedback}>
            <div className="form-group">
              <label>Rating</label>
              {renderStars(newFeedback.rating, true, (rating) => 
                setNewFeedback(prev => ({ ...prev, rating }))
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={newFeedback.category}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                className="form-select"
              >
                <option value="general">General</option>
                <option value="disease-detection">Disease Detection</option>
                <option value="ui-ux">User Interface</option>
                <option value="performance">Performance</option>
                <option value="feature-request">Feature Request</option>
                <option value="bug-report">Bug Report</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Feedback</label>
              <textarea
                id="message"
                rows={4}
                placeholder="Share your thoughts, suggestions, or report any issues..."
                value={newFeedback.message}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, message: e.target.value }))}
                className="form-textarea"
                required
              />
            </div>

            {message && (
              <div className={`message ${message.includes('Thank you') ? 'success' : 'error'}`}>
                {message.includes('Thank you') && <CheckCircle size={16} />}
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send size={16} />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Existing Feedbacks */}
      <div className="feedbacks-section">
        <h2>Community Feedback</h2>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading feedbacks...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>No Feedback Yet</h3>
            <p>Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="feedbacks-grid">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="feedback-card">
                <div className="feedback-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      <User size={20} />
                    </div>
                    <div className="user-details">
                      <span className="user-name">{feedback.userId?.name || 'Anonymous'}</span>
                      <span className="feedback-category">{feedback.category}</span>
                    </div>
                  </div>
                  <div className="feedback-meta">
                    {renderStars(feedback.rating)}
                    <span className="feedback-date">
                      <Calendar size={14} />
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="feedback-content">
                  <p>{feedback.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
