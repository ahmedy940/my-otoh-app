import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([
    "Manage campaigns page",
    "Brief about your current campaigns",
    "Create a new campaign",
    "Enhance summer collection campaign"
  ]);
  const [isOpen, setIsOpen] = useState(false); // State to manage chatbot visibility

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: 'user', text: input }]);
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessages([...messages, { sender: 'user', text: suggestion }]);
  };

  return (
    <div>
      {!isOpen && (
        <button className="chatbot-toggle-button" onClick={() => setIsOpen(!isOpen)}>
          Your Otoh
        </button>
      )}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            Your Otoh
            <button className="chatbot-close-button" onClick={() => setIsOpen(false)}>
              ▼
            </button>
          </div>
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="chatbot-suggestion"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
          <div className="chatbot-input-container">
            <input
              type="text"
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's on your mind?"
            />
            <button onClick={handleSendMessage} className="chatbot-send-button">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
