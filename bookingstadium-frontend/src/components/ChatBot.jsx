import React, { useState } from 'react';
import './ChatBot.css';
import axios from 'axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Xin chào! Tôi là Mi247 Bot, bạn cần hỗ trợ gì?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const res = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAjX7VMGXOavm-SHVV2U_m-NsSYSXBrHtU',
        {
          contents: [{ parts: [{ text: input }] }],
        }
      );

      const botReply = res.data.candidates[0]?.content?.parts[0]?.text || 'Xin lỗi, tôi không hiểu.';
      setMessages((prev) => [...prev, { text: botReply, sender: 'bot' }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { text: 'Lỗi khi gọi API Gemini.', sender: 'bot' }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div>
      <div className="chat-toggle-button" onClick={toggleChat}>
        💬
      </div>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <span>Mi24/7 Chat AI</span>
            <button className="close-btn" onClick={toggleChat}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
