// Auth Components
import React, { useState } from 'react';
import { LogIn, User, Mail, Lock, UserPlus } from 'lucide-react';

export const LoginForm = ({ onLogin, onSwitchToRegister, API_BASE_URL }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          onLogin(data.token, data.user);
        }, 1000);
      } else {
        setMessage(`❌ ${data.message || 'Login failed'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="form-container">
      <h2>
        <LogIn className="h-6 w-6 inline mr-2" />
        Login to AgriMetrix
      </h2>
      <p>Access your personalized agricultural dashboard</p>

      {message && (
        <div className={`${message.includes('❌') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <Mail className="h-5 w-5 input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <Lock className="h-5 w-5 input-icon" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner-small"></div>
              Signing In...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="form-footer">
        <p>Don't have an account?</p>
        <button onClick={onSwitchToRegister}>
          <UserPlus className="h-4 w-4 inline mr-1" />
          Create Account
        </button>
      </div>
    </div>
  );
};

export const RegisterForm = ({ onRegister, onSwitchToLogin, API_BASE_URL }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Registration successful! Please login.');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setMessage(`❌ ${data.message || 'Registration failed'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="form-container">
      <h2>
        <UserPlus className="h-6 w-6 inline mr-2" />
        Join AgriMetrix
      </h2>
      <p>Create your account to access AI-powered farming tools</p>

      {message && (
        <div className={`${message.includes('❌') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <User className="h-5 w-5 input-icon" />
          <input
            type="text"
            name="username"
            placeholder="Full name"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <Mail className="h-5 w-5 input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <Lock className="h-5 w-5 input-icon" />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <Lock className="h-5 w-5 input-icon" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner-small"></div>
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create Account
            </>
          )}
        </button>
      </form>

      <div className="form-footer">
        <p>Already have an account?</p>
        <button onClick={onSwitchToLogin}>
          <LogIn className="h-4 w-4 inline mr-1" />
          Sign In
        </button>
      </div>
    </div>
  );
};

export const AuthPage = ({ onLogin, API_BASE_URL }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="page-bg">
      {showLogin ? (
        <LoginForm
          onLogin={onLogin}
          onSwitchToRegister={() => setShowLogin(false)}
          API_BASE_URL={API_BASE_URL}
        />
      ) : (
        <RegisterForm
          onRegister={onLogin}
          onSwitchToLogin={() => setShowLogin(true)}
          API_BASE_URL={API_BASE_URL}
        />
      )}
    </div>
  );
};