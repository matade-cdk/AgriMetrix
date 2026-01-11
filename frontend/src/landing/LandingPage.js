import React from 'react';
import { Leaf, ArrowRight, Star, Zap, Brain, TrendingUp, Mail, Phone, MapPin } from 'lucide-react';

const LandingPage = ({ onGetStarted, onLogin }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <Leaf className="logo-icon" />
            <span>AgriMetrix</span>
          </div>
          <nav className="landing-nav">
            <button onClick={() => scrollToSection('home')} className="nav-link">Home</button>
            <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
            <button onClick={() => scrollToSection('reviews')} className="nav-link">Reviews</button>
            <button onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
          </nav>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={onLogin}>
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Home/Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-content">
            <h1>Smart Agriculture Solutions for Modern Farmers</h1>
            <p>
              Harness the power of AI and data analytics to optimize your crop yields, 
              predict weather patterns, and make informed farming decisions.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
                Get Started <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img src="/landing.png" alt="AgriMetrix Platform" className="hero-img" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features</h2>
            <p>Everything you need to succeed in modern agriculture</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Weather Forecasting</h3>
              <p>Accurate weather predictions up to 7 days in advance with hourly updates to help you plan your farming activities.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Brain size={32} />
              </div>
              <h3>AI Crop Recommendation</h3>
              <p>Get personalized crop suggestions based on your soil conditions, climate data, and environmental factors using advanced ML models.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={32} />
              </div>
              <h3>ML Insights & Analytics</h3>
              <p>Detailed crop rotation plans, yield forecasting, and demand predictions to maximize your profits.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Leaf size={32} />
              </div>
              <h3>Farmer Network</h3>
              <p>Connect with experienced farmers in your region, share knowledge, and get practical farming advice.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Real-time Monitoring</h3>
              <p>Track your farm's health with real-time data updates and instant alerts for critical changes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Brain size={32} />
              </div>
              <h3>AI Assistant</h3>
              <p>24/7 AI chatbot support to answer your farming questions and provide instant guidance on crop management.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews/Testimonials Section */}
      <section className="testimonials" id="reviews">
        <div className="container">
          <div className="section-header">
            <h2>What Farmers Say</h2>
          </div>
          <div className="testimonials-wrapper">
            <div className="testimonials-scroll">
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"AnnData helped me increase my wheat yield by 35%. The soil analysis and crop recommendations are spot on!"</p>
                <div className="testimonial-author">
                  <strong>Amit Kumar</strong>
                  <span>Wheat Farmer, Punjab</span>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"The weather predictions saved my rice crop from heavy rains. This platform is truly revolutionary for Indian farmers."</p>
                <div className="testimonial-author">
                  <strong>Sahil Mann</strong>
                  <span>Rice Farmer, Haryana</span>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"AnnData's crop rotation suggestions improved my soil health significantly. My potato yield increased by 40%!"</p>
                <div className="testimonial-author">
                  <strong>Deepak Mehra</strong>
                  <span>Potato Farmer, Uttar Pradesh</span>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"The supplier network feature helped me get quality seeds at competitive prices. Highly recommended for all farmers!"</p>
                <div className="testimonial-author">
                  <strong>Afzal Khan</strong>
                  <span>Cotton Farmer, Maharashtra</span>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"Best agricultural platform I've used! The AI predictions are accurate and easy to understand. My farm profits doubled!"</p>
                <div className="testimonial-author">
                  <strong>Shivam Joshi</strong>
                  <span>Sugarcane Farmer, Uttarakhand</span>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"The demand forecasting feature helped me plan my cultivation better. No more guessing what to grow next season!"</p>
                <div className="testimonial-author">
                  <strong>Rajesh Sharma</strong>
                  <span>Vegetable Farmer, Rajasthan</span>
                </div>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"AgriMetrix helped me increase my wheat yield by 35%. The soil analysis and crop recommendations are spot on!"</p>
                <div className="testimonial-author">
                  <strong>Amit Kumar</strong>
                  <span>Wheat Farmer, Punjab</span>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"The weather predictions saved my rice crop from heavy rains. This platform is truly revolutionary for Indian farmers."</p>
                <div className="testimonial-author">
                  <strong>Sahil Mann</strong>
                  <span>Rice Farmer, Haryana</span>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"AgriMetrix's crop rotation suggestions improved my soil health significantly. My potato yield increased by 40%!"</p>
                <div className="testimonial-author">
                  <strong>Deepak Mehra</strong>
                  <span>Potato Farmer, Uttar Pradesh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="section-header">
            <h2>Get In Touch</h2>
            <p>Have questions? We'd love to hear from you!</p>
          </div>
          <div className="contact-wrapper">
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={28} />
                <div>
                  <h4>Email</h4>
                  <p><a href="mailto:support@agrimetrix.com">support@agrimetrix.com</a></p>
                </div>
              </div>
              <div className="contact-item">
                <Phone size={28} />
                <div>
                  <h4>Phone</h4>
                  <p><a href="tel:+911234567890">+91 1234 567890</a></p>
                </div>
              </div>
              <div className="contact-item">
                <MapPin size={28} />
                <div>
                  <h4>Location</h4>
                  <p>New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <Leaf className="logo-icon" />
                <span>AgriMetrix</span>
              </div>
              <p>Empowering farmers with intelligent agricultural solutions.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Product</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#demo">Demo</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <ul>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#docs">Documentation</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <ul>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#careers">Careers</a></li>
                  <li><a href="#blog">Blog</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 AgriMetrix. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;