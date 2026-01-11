import React, { useState } from 'react';
import { ArrowLeft, Leaf } from 'lucide-react';

const AuthPage = ({ onBack, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ann-data-api.onrender.com/api';

  // Password strength validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character (!@#$%^&*)');
    return errors;
  };

  // Username validation
  const validateUsername = (username) => {
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 50) return 'Username cannot exceed 50 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    // Validation
    const validationErrors = {};
    
    if (!isLogin) {
      const usernameError = validateUsername(formData.username);
      if (usernameError) validationErrors.username = usernameError;
      
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        validationErrors.password = passwordErrors.join(', ');
      }
      
      if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          setMessage('Login successful!');
          if (onAuthSuccess) {
            onAuthSuccess({
              token: data.token,
              user: data.user,
              name: data.user.username || data.user.name,
              email: data.user.email
            });
          }
        } else {
          setMessage('Registration successful! Please login.');
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        }
      } else {
        setMessage(data.error || 'An error occurred');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <Leaf className="logo-icon" />
              <span>AgriMetrix</span>
            </div>
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to your account' : 'Join thousands of farmers'}</p>
          </div>

          {message && (
            <div className={message.includes('successful') ? 'message-success' : 'message-error'}>
              {message}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username (3-50 characters)"
                  className={errors.username ? 'error' : ''}
                  required
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
              {!isLogin && (
                <div className="password-requirements">
                  <small>Password must contain: 8+ characters, uppercase, lowercase, number, special character</small>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'error' : ''}
                  required
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-switch">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                className="switch-btn"
                onClick={() => { 
                  setIsLogin(!isLogin); 
                  setMessage(''); 
                  setErrors({});
                  setFormData({ username: '', email: '', password: '', confirmPassword: '' });
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;