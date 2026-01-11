import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Trash2, Copy, MessageCircle } from 'lucide-react';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI Agricultural Assistant. I can help you with crop recommendations, farming techniques, pest management, weather insights, and much more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage
        })
      });

      const data = await response.json();

      if (data.response) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No response received from server');
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setError('Sorry, I couldn\'t process your message. Please try again.');
      
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I apologize, but I\'m having trouble connecting right now. However, I can still help! Try asking about crop recommendations, soil management, pest control methods, irrigation techniques, or weather considerations!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m your AI Agricultural Assistant. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
    setError('');
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <div className="header-content">
          <MessageCircle className="header-icon" />
          <div>
            <h1>AI Agricultural Assistant</h1>
            <p>Get expert advice on crops and farming techniques</p>
          </div>
        </div>
        <button onClick={clearChat} className="clear-btn" title="Clear Chat">
          <Trash2 size={20} />
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'bot' ? (
                  <Bot size={20} className="bot-icon" />
                ) : (
                  <User size={20} className="user-icon" />
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <p>{message.content}</p>
                  <div className="message-actions">
                    <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
                    <button 
                      onClick={() => copyMessage(message.content)} 
                      className="copy-btn"
                      title="Copy message"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot">
              <div className="message-avatar">
                <Bot size={20} className="bot-icon" />
              </div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <Loader className="spinner" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about crops, farming techniques, weather, pest management..."
              rows="1"
              disabled={isLoading}
              className="message-input"
            />
            <button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
