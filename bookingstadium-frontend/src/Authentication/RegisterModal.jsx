import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../Authentication/AuthModals.css';

const RegisterModal = ({ isOpen, onClose, openLoginModal }) => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    phone: '',
    day_of_birth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu xác nhận
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Chuẩn bị dữ liệu đúng format cho backend
      const userData = {
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        password: formData.password,
        phone: formData.phone,
        day_of_birth: formData.day_of_birth ? new Date(formData.day_of_birth).toISOString().split('T')[0] : null,
      };
      
      const result = await register(userData);
      
      if (result.success) {
        // Đăng ký thành công, chuyển sang trang đăng nhập
        onClose();
        openLoginModal();
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
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
          {error && <div className="error-message">{error}</div>}
          
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
                type="text"
                name="firstname"
                placeholder="Họ *"
                value={formData.firstname}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="lastname"
                placeholder="Tên *"
                value={formData.lastname}
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
                type="date"
                name="day_of_birth"
                placeholder="Ngày sinh"
                value={formData.day_of_birth}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
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