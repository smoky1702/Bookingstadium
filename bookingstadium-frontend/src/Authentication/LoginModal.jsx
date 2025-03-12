import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Authentication/AuthModals.css';

const LoginModal = ({ isOpen, onClose, openRegisterModal }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted:', formData);
    // Đây chỉ là FE nên không xử lý gì thêm
    // Sau này sẽ gọi API đăng nhập ở đây
  };

  const handleSwitchToRegister = () => {
    onClose();
    openRegisterModal();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>Đăng nhập</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="auth-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu *"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="forgot-password">
              <span>Quên mật khẩu</span>
            </div>
            
            <button type="submit" className="auth-button">Đăng nhập</button>
          </form>
          
          <div className="social-login-section">
            <p>Hay tiếp tục với</p>
            <div className="social-buttons">
              <button className="social-button facebook">
                <i className="fab fa-facebook-f"></i> Facebook
              </button>
              <button className="social-button google">
                <i className="fab fa-google"></i> Google
              </button>
            </div>
          </div>
          
          <div className="switch-form">
            <p>Chưa có tài khoản? <span onClick={handleSwitchToRegister}>Đăng ký</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;