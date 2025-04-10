import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../Authentication/AuthModals.css';

const RegisterModal = ({ isOpen, onClose, openLoginModal }) => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: '',
    phone: '',
    day_of_birth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    
    // Kiểm tra mật khẩu có đủ 6 ký tự không
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // form cho backend
      const userData = {
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        day_of_birth: formData.day_of_birth ? formData.day_of_birth : null,
      };
      
      // Gọi hàm register từ AuthContext
      const result = await register(userData);
      
      if (result.success) {
        // Đăng ký thành công, chuyển sang trang đăng nhập
        onClose();
        openLoginModal();
        // Có thể thêm thông báo thành công ở đây
      } else {
        // Hiển thị lỗi nếu đăng ký thất bại
        setError(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    openLoginModal();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    if (!showPassword) {
      setTimeout(() => {
        setShowPassword(false);
      }, 5000);
    }
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
    if (!showConfirmPassword) {
      setTimeout(() => {
        setShowConfirmPassword(false);
      }, 5000);
    }
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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu * (ít nhất 6 ký tự)"
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
            
            <div className="form-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu *"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
                required
              />
              <i
                className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                onClick={toggleConfirmPasswordVisibility}
                style={{ cursor: 'pointer', marginLeft: '10px' }}
              ></i>
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
            Bằng việc đăng ký, bạn đã đồng ý với Mi24/7 về{' '}
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