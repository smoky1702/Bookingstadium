import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Authentication/AuthModals.css';

const RegisterModal = ({ isOpen, onClose, openLoginModal }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    fullName: ''
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
    console.log('Register form submitted:', formData);
    // Đây chỉ là FE nên không xử lý gì thêm
    // Sau này sẽ gọi API đăng ký ở đây
  };

  const handleSwitchToLogin = () => {
    onClose();
    openLoginModal();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>Đăng ký</h2>
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
            
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu *"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại *"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                placeholder="Họ & tên *"
                value={formData.fullName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <button type="submit" className="auth-button">Đăng ký</button>
          </form>
          
          <div className="terms-agreement">
            Bằng việc đăng ký, bạn đã đồng ý với Datsan247 về{' '}
            <Link to="/dieu-khoan" onClick={onClose} className="terms-link">Điều khoản dịch vụ</Link> và{' '}
            <Link to="/chinh-sach" onClick={onClose} className="terms-link">Chính sách bảo mật</Link>
          </div>
          
          <div className="switch-form">
            <p>Đã có tài khoản? <span onClick={handleSwitchToLogin}>Đăng nhập</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;