import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './FAQPage.css';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is AgriMetrix?",
      answer: "AgriMetrix is an AI-powered agricultural platform that helps farmers make data-driven decisions using weather forecasts, crop predictions, and ML insights."
    },
    {
      question: "How accurate are the weather predictions?",
      answer: "Our weather predictions use real-time data from reliable meteorological sources and provide accurate forecasts for up to 7 days with hourly updates."
    },
    {
      question: "What is AI Crop Recommendation?",
      answer: "AI Crop Recommendation analyzes your soil conditions (N, P, K levels), climate data (temperature, humidity, rainfall), and pH levels to suggest the most suitable crops for your farm."
    },
    {
      question: "How does the ML Insights feature work?",
      answer: "ML Insights uses machine learning models trained on agricultural data to provide crop recommendations, rotation planning, yield forecasting, and demand predictions based on your specific conditions."
    },
    {
      question: "Can I contact farmers directly?",
      answer: "Yes! The Farmers section provides contact information for experienced farmers in your region. You can view their profiles and reach out via phone or email."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! We use industry-standard encryption and security measures to protect your personal information and farming data. Your data is never shared with third parties without your consent."
    },
    {
      question: "How do I provide feedback?",
      answer: "You can submit feedback through the Feedback page in the navigation menu. We value your input and use it to improve our services continuously."
    },
    {
      question: "What is the AI Assistant?",
      answer: "The AI Assistant is a chatbot that can answer your farming questions, provide guidance on crop management, pest control, fertilizer usage, and other agricultural topics in real-time."
    },
    {
      question: "How often should I check the predictions?",
      answer: "We recommend checking weather predictions daily and reviewing ML insights weekly or before making major farming decisions like planting or harvesting."
    },
    {
      question: "Can I use AgriMetrix on mobile devices?",
      answer: "Yes! AgriMetrix is fully responsive and works seamlessly on smartphones, tablets, and desktop computers."
    },
    {
      question: "What crops does the system support?",
      answer: "Our system supports a wide variety of crops including rice, wheat, maize, cotton, sugarcane, vegetables, fruits, and many more. The AI recommendations are based on extensive agricultural databases."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to the Profile page from the navigation menu. Click 'Edit Profile' to update your name and profile photo."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <HelpCircle size={48} className="faq-icon" />
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about AgriMetrix</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
            <button className="faq-question" onClick={() => toggleFAQ(index)}>
              <span>{faq.question}</span>
              {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
