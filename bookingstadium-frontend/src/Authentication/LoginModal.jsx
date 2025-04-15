import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../Authentication/AuthModals.css';

const LoginModal = ({ isOpen, onClose, openRegisterModal }) => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Gọi hàm login từ AuthContext
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Đóng modal nếu đăng nhập thành công
        onClose();
      } else {
        // Hiển thị lỗi nếu đăng nhập thất bại
        setError(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      
      // Xử lý thông báo lỗi chi tiết hơn
      if (error.response) {
        if (error.response.status === 403) {
          setError('Tài khoản của bạn không có quyền truy cập vào hệ thống.');
        } else if (error.response.status === 401) {
          setError('Email hoặc mật khẩu không chính xác.');
        } else if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError('Đăng nhập thất bại. Vui lòng thử lại.');
        }
      } else {
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    onClose();
    openRegisterModal();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    if (!showPassword) {
      setTimeout(() => {
        setShowPassword(false);
      }, 5000);
    }
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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu *"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
              <i
                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                onClick={togglePasswordVisibility}
                style={{ cursor: 'pointer', marginLeft: '10px' }}
              ></i>
            </div>
            
            <div className="forgot-password">
              <span>Quên mật khẩu</span>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
          
          {/* Ẩn Social Login - Có thể bỏ comment nếu cần
          <div className="social-login-section">
            <p>Hoặc tiếp tục với</p>
            <div className="social-buttons">
              <button className="social-button facebook">
                <i className="fab fa-facebook-f"></i> Facebook
              </button>
              <button className="social-button google">
                <i className="fab fa-google"></i> Google
              </button>
            </div>
          </div>
          */}
          
          <div className="switch-form">
            <p>Chưa có tài khoản? <span onClick={handleSwitchToRegister}>Đăng ký</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;