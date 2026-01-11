import React, { useState } from 'react';
import { ChevronRight, MapPin, Phone, Mail, X } from 'lucide-react';
import './SuppliersPage.css';

const SuppliersPage = () => {
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const farmers = [
    {
      id: 1,
      name: 'राज कुमार सिंह',
      englishName: 'Raj Kumar Singh',
      image: '/farmer1.png',
      location: 'Punjab',
      phone: '+91 9876543210',
      email: 'raj@farmmail.com',
      experience: '15+ years',
      crops: 'Wheat, Rice, Corn',
      description: 'Experienced farmer specializing in grain cultivation with sustainable farming practices.',
      detailedDescription: 'Raj Kumar Singh is a dedicated farmer from Punjab with over 15 years of experience in cultivating high-quality wheat, rice, and corn. He practices organic farming methods and has won several agricultural awards. He provides consultation on crop rotation and soil management.'
    },
    {
      id: 2,
      name: 'प्रिया शर्मा',
      englishName: 'Priya Sharma',
      image: '/farmer2.png',
      location: 'Himachal Pradesh',
      phone: '+91 9876543211',
      email: 'priya@farmmail.com',
      experience: '12+ years',
      crops: 'Apples, Peaches, Walnuts',
      description: 'Horticulture expert growing premium fruits and nuts in hill regions.',
      detailedDescription: 'Priya Sharma is an expert in horticulture from Himachal Pradesh, specializing in growing premium quality apples, peaches, and walnuts. She has developed innovative irrigation systems suitable for hill agriculture and mentors young farmers in her region.'
    },
    {
      id: 3,
      name: 'अमित पटेल',
      englishName: 'Amit Patel',
      image: '/farmer3.png',
      location: 'Gujarat',
      phone: '+91 9876543212',
      email: 'amit@farmmail.com',
      experience: '10+ years',
      crops: 'Cotton, Groundnut, Sesame',
      description: 'Cash crop specialist with modern farming techniques.',
      detailedDescription: 'Amit Patel is a progressive farmer from Gujarat focusing on high-value cash crops. He uses precision agriculture techniques and is known for his excellent cotton yields. He also conducts workshops on modern farming methods.'
    },
    {
      id: 4,
      name: 'विजया नायक',
      englishName: 'Vijaya Nayak',
      image: '/farmer4.png',
      location: 'Karnataka',
      phone: '+91 9876543213',
      email: 'vijaya@farmmail.com',
      experience: '18+ years',
      crops: 'Sugarcane, Coconut, Arecanut',
      description: 'Plantation crop expert with sustainable yield optimization.',
      detailedDescription: 'Vijaya Nayak is a seasoned farmer from Karnataka with expertise in plantation crops. She has implemented water conservation techniques and promoted biodiversity on her farms. Her sugarcane yields are among the highest in the region.'
    },
    {
      id: 5,
      name: 'राहुल वर्मा',
      englishName: 'Rahul Verma',
      image: '/farmer5.png',
      location: 'Uttar Pradesh',
      phone: '+91 9876543214',
      email: 'rahul@farmmail.com',
      experience: '14+ years',
      crops: 'Vegetables, Potatoes, Onions',
      description: 'Vegetable farming pioneer using organic methods.',
      detailedDescription: 'Rahul Verma is an innovative vegetable farmer from Uttar Pradesh, known for growing premium quality vegetables using entirely organic methods. He has established direct market linkages with major vegetable supply chains across North India.'
    },
    {
      id: 6,
      name: 'सुनीता चौधरी',
      englishName: 'Sunita Chaudhari',
      image: '/farmer6.png',
      location: 'Rajasthan',
      phone: '+91 9876543215',
      email: 'sunita@farmmail.com',
      experience: '11+ years',
      crops: 'Millets, Pulses, Mustard',
      description: 'Drought-resilient crop specialist and women farmer advocate.',
      detailedDescription: 'Sunita Chaudhari is an inspiring woman farmer from Rajasthan who specializes in drought-resistant crops. She promotes sustainable farming in arid regions and provides training to other women farmers on water conservation and crop diversity.'
    },
    {
      id: 7,
      name: 'मोहन गोपाल',
      englishName: 'Mohan Gopal',
      image: '/farmer7.png',
      location: 'Tamil Nadu',
      phone: '+91 9876543216',
      email: 'mohan@farmmail.com',
      experience: '16+ years',
      crops: 'Spices, Turmeric, Pepper',
      description: 'Spice cultivation expert with international quality standards.',
      detailedDescription: 'Mohan Gopal is renowned in Tamil Nadu for cultivating premium quality spices meeting international standards. His turmeric and pepper are exported to multiple countries, and he practices sustainable farming with minimal chemical inputs.'
    },
    {
      id: 8,
      name: 'नीता कुमार',
      englishName: 'Neeta Kumar',
      image: '/farmer8.png',
      location: 'West Bengal',
      phone: '+91 9876543217',
      email: 'neeta@farmmail.com',
      experience: '13+ years',
      crops: 'Rice, Jute, Tea',
      description: 'Diversified crop farmer with sustainable practices.',
      detailedDescription: 'Neeta Kumar is a progressive farmer from West Bengal cultivating rice, jute, and tea with integrated crop management. She has implemented modern storage facilities to reduce post-harvest losses and serves as a mentor for young farmers.'
    },
    {
      id: 9,
      name: 'विक्रम सिंह',
      englishName: 'Vikram Singh',
      image: '/farmer9.png',
      location: 'Haryana',
      phone: '+91 9876543218',
      email: 'vikram@farmmail.com',
      experience: '17+ years',
      crops: 'Wheat, Barley, Oats',
      description: 'Cereal crop specialist with research collaboration.',
      detailedDescription: 'Vikram Singh is a research-oriented farmer from Haryana collaborating with agricultural universities. He tests new crop varieties and farming techniques, achieving above-average yields through precision farming methods.'
    },
    {
      id: 10,
      name: 'अनिता राय',
      englishName: 'Anita Rai',
      image: '/farmer10.png',
      location: 'Assam',
      phone: '+91 9876543219',
      email: 'anita@farmmail.com',
      experience: '9+ years',
      crops: 'Tea, Betel Leaf, Citrus',
      description: 'Northeastern crop specialist with organic certification.',
      detailedDescription: 'Anita Rai is an organic certified farmer from Assam, specializing in tea, betel leaf, and citrus cultivation. She promotes northeast India\'s agricultural products globally and conducts workshops on organic farming techniques.'
    }
  ];

  return (
    <div className="suppliers-page">
      <div className="suppliers-header">
        <h1>🌾 Local Farmers Network</h1>
        <p>Connect with experienced Indian farmers for quality agricultural products and expert guidance</p>
      </div>

      <div className="farmers-grid">
        {farmers.map((farmer) => (
          <div key={farmer.id} className="farmer-card">
            <div className="farmer-image-wrapper">
              <img src={farmer.image} alt={farmer.englishName} className="farmer-image" />
              <div className="farmer-overlay">
                <button 
                  className="view-more-btn"
                  onClick={() => setSelectedFarmer(farmer)}
                >
                  View More <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="farmer-info">
              <h3>{farmer.name}</h3>
              <p className="english-name">{farmer.englishName}</p>
              <p className="description">{farmer.description}</p>
              <div className="quick-info">
                <span className="info-item">📍 {farmer.location}</span>
                <span className="info-item">⏱️ {farmer.experience}</span>
              </div>
              <p className="crops">🌾 {farmer.crops}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedFarmer && (
        <div className="modal-overlay" onClick={() => setSelectedFarmer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedFarmer(null)}
            >
              <X size={24} />
            </button>
            
            <div className="modal-body">
              <div className="modal-image">
                <img src={selectedFarmer.image} alt={selectedFarmer.englishName} />
              </div>
              
              <div className="modal-details">
                <h2>{selectedFarmer.name}</h2>
                <p className="english-name">{selectedFarmer.englishName}</p>
                
                <div className="details-section">
                  <h3>About</h3>
                  <p>{selectedFarmer.detailedDescription}</p>
                </div>

                <div className="details-grid">
                  <div className="detail-box">
                    <h4>Experience</h4>
                    <p>{selectedFarmer.experience}</p>
                  </div>
                  <div className="detail-box">
                    <h4>Location</h4>
                    <p className="location-text">
                      <MapPin size={16} /> {selectedFarmer.location}
                    </p>
                  </div>
                  <div className="detail-box">
                    <h4>Crops</h4>
                    <p>{selectedFarmer.crops}</p>
                  </div>
                  <div className="detail-box">
                    <h4>Contact</h4>
                    <div className="contact-info">
                      <p><Phone size={14} /> {selectedFarmer.phone}</p>
                      <p><Mail size={14} /> {selectedFarmer.email}</p>
                    </div>
                  </div>
                </div>

                <button 
                  className="close-modal-btn"
                  onClick={() => setSelectedFarmer(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
