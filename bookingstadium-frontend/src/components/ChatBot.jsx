import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Xin chào! Tôi là Mi247 Bot, bạn cần hỗ trợ gì?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  const [lastTopic, setLastTopic] = useState('');
  const messagesEndRef = useRef(null);
  const accessToken = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId') || '';
  const isLoggedIn = !!accessToken;

  // Tự động cuộn đến tin nhắn mới nhất
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Cập nhật ngữ cảnh hội thoại
    const lastMessages = messages.slice(-3).map(msg => msg.text);
    const updatedContext = [...lastMessages, input];
    setConversationContext(updatedContext);

    try {
      // Gọi API backend chatbot
      const res = await axios.post(
        'http://localhost:8080/api/chatbot/query',
        {
          query: input,
          user_id: userId,
          conversation_context: updatedContext,
          last_topic: lastTopic
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      // Thêm hiệu ứng typing
      setTimeout(() => {
        setIsTyping(false);
        const botReply = res.data.result.answer || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.';
        setMessages((prev) => [...prev, { text: botReply, sender: 'bot' }]);
        
        // Lưu chủ đề cuối cùng nếu có
        if (res.data.result.sourceType) {
          setLastTopic(res.data.result.sourceType);
        }
      }, 500);

    } catch (err) {
      console.error('Lỗi khi gọi API chatbot:', err);
      setTimeout(() => {
        setIsTyping(false);
        
        // Nếu lỗi 401 - Unauthorized thì hiển thị thông báo cần đăng nhập lại
        if (err.response && err.response.status === 401) {
          setMessages((prev) => [...prev, { 
            text: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.',
            sender: 'bot' 
          }]);
        } else {
          setMessages((prev) => [...prev, { 
            text: 'Xin lỗi, hiện tại tôi không thể trả lời. Vui lòng thử lại sau hoặc liên hệ hotline 0987.654.321.', 
            sender: 'bot' 
          }]);
        }
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Nếu chưa đăng nhập, hiển thị một giao diện đơn giản yêu cầu đăng nhập
  if (!isLoggedIn) {
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
            <div className="chatbot-messages login-required">
              <div className="chatbot-message bot">
                <p>Vui lòng đăng nhập để sử dụng tính năng chat hỗ trợ!</p>
                {/* <div className="login-buttons">
                  <Link to="/login" className="login-button">Đăng nhập</Link>
                  <Link to="/register" className="register-button">Đăng ký</Link>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
            {isTyping && (
              <div className="chatbot-message bot typing">
                <span className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
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
