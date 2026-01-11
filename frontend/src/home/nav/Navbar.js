import React, { useState } from 'react';
import { 
  Cloud, 
  Brain, 
  TrendingUp, 
  Users,
  MessageSquare, 
  User,
  MessageCircle,
  LogOut,
  Leaf,
  X,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const navItems = [
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'predict', label: 'AI Predict', icon: Brain },
    { id: 'insights', label: 'ML Insights', icon: TrendingUp },
    { id: 'suppliers', label: 'Farmers', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const assistantItems = [
    { id: 'chatbot', label: 'AI Assistant', icon: MessageCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Leaf className="brand-icon" />
          <span className="brand-text">AgriMetrix</span>
        </div>

        <div className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="nav-dropdown">
            <button
              className={`nav-item ${['chatbot', 'faq'].includes(activeTab) ? 'active' : ''}`}
              onClick={() => setAssistantOpen(!assistantOpen)}
            >
              <MessageCircle size={20} />
              <span>Assistant</span>
              <ChevronDown size={16} className={`dropdown-icon ${assistantOpen ? 'open' : ''}`} />
            </button>
            
            {assistantOpen && (
              <div className="dropdown-menu">
                {assistantItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`dropdown-item ${activeTab === item.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setAssistantOpen(false);
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="nav-footer">
          <button className="nav-item logout" onClick={handleLogoutClick}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={handleCancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <h3>Confirm Logout</h3>
              <button className="modal-close-btn" onClick={handleCancelLogout}>
                <X size={24} />
              </button>
            </div>
            <div className="logout-modal-body">
              <p>Are you really sure you want to exit?</p>
            </div>
            <div className="logout-modal-footer">
              <button className="btn-cancel" onClick={handleCancelLogout}>
                No
              </button>
              <button className="btn-confirm" onClick={handleConfirmLogout}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;