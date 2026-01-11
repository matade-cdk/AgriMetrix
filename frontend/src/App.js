import React, { useState, useEffect } from 'react';
import LandingPage from './landing/LandingPage';
import AuthPage from './auth/AuthPage';
import Navbar from './home/nav/Navbar';
import WeatherPage from './home/weather/WeatherPage';
import PredictPage from './home/predict/PredictPage';
import MLInsightsPage from './home/ml-insights/MLInsightsPage';
import SuppliersPage from './home/suppliers/SuppliersPage';
import FeedbackPage from './home/feedback/FeedbackPage';
import ChatbotPage from './home/chatbot/ChatbotPage';
import FAQPage from './home/faq/FAQPage';
import ProfilePage from './home/profile/ProfilePage';
import Dashboard from './home/dashboard/Dashboard';
import './App.css';
import './landing/LandingPage.css';
import './auth/AuthPage.css';
import './home/nav/Navbar.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'auth', 'home'
  const [activeTab, setActiveTab] = useState('weather');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentView('home');
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleLogin = () => {
    setCurrentView('auth');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleAuthSuccess = (authData) => {
    console.log('Authentication successful:', authData);
    if (authData.token) {
      localStorage.setItem('token', authData.token);
    }
    setIsAuthenticated(true);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    setCurrentView('landing');
    setActiveTab('weather');
  };

  // Render different views based on current state
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
      />
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthPage 
        onBack={handleBackToLanding}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (currentView === 'home' && isAuthenticated) {
    return (
      <div className="app-layout">
        <Navbar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />
        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'weather' && <WeatherPage />}
          {activeTab === 'predict' && <PredictPage />}
          {activeTab === 'insights' && <MLInsightsPage />}
          {activeTab === 'suppliers' && <SuppliersPage />}
          {activeTab === 'feedback' && <FeedbackPage />}
          {activeTab === 'chatbot' && <ChatbotPage />}
          {activeTab === 'faq' && <FAQPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </main>
      </div>
    );
  }

  // Fallback to landing if something goes wrong
  return (
    <LandingPage 
      onGetStarted={handleGetStarted}
      onLogin={handleLogin}
    />
  );
}

export default App;