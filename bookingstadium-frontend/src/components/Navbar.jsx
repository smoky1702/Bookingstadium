import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LoginModal from '../Authentication/LoginModal';
import RegisterModal from '../Authentication/RegisterModal';
import SearchModal from '../pages/SearchModal/SearchModal';
import '../components/Navbar.css';

const Navbar = () => {
  const { isAuthenticated, currentUser, logout, forbiddenError } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();

  // Thêm console.log để debug
  console.log("Auth state:", { isAuthenticated, currentUser });

  // Hiển thị thông báo lỗi khi có lỗi 403 (không có quyền)
  useEffect(() => {
    if (forbiddenError) {
      setErrorMessage(forbiddenError.message);
      setShowErrorToast(true);
      
      // Tự động ẩn thông báo sau 5 giây
      const timer = setTimeout(() => {
        setShowErrorToast(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [forbiddenError]);

  // Lắng nghe sự kiện api:forbidden từ apiService
  useEffect(() => {
    const handleForbidden = (event) => {
      setErrorMessage(event.detail.message || 'Bạn không có quyền thực hiện hành động này');
      setShowErrorToast(true);
      
      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => {
        setShowErrorToast(false);
      }, 5000);
    };
    
    window.addEventListener('api:forbidden', handleForbidden);
    
    // Cleanup
    return () => {
      window.removeEventListener('api:forbidden', handleForbidden);
    };
  }, []);

  // Hàm điều khiển modal
  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowSearchModal(false);
    setShowLoginModal(true);
  };

  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowSearchModal(false);
    setShowRegisterModal(true);
  };

  const openSearchModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowSearchModal(true);
  };

  const closeAllModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowSearchModal(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNavLinkClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTop();
    }
  };

  // Đóng thông báo lỗi
  const closeErrorToast = () => {
    setShowErrorToast(false);
  };

  return (
    <>
      {/* Thông báo lỗi */}
      {showErrorToast && (
        <div className="error-toast">
          <div className="error-toast-content">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errorMessage}</span>
          </div>
          <button className="error-toast-close" onClick={closeErrorToast}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    
      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/" onClick={(e) => handleNavLinkClick(e, "/")} className="navbar-logo">
            <img src="/logo.png" alt="Mi24/7 Logo" />
          </Link>

          <div className="navbar-menu-toggle" onClick={toggleMenu}>
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </div>

          <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <li className="navbar-item">
              <Link 
                to="/" 
                className={location.pathname === '/' ? "navbar-link active" : "navbar-link"}
                onClick={(e) => handleNavLinkClick(e, "/")}
              >
                Trang chủ
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/danh-sach-san" 
                className={location.pathname === '/danh-sach-san' ? "navbar-link active" : "navbar-link"}
                onClick={(e) => handleNavLinkClick(e, "/danh-sach-san")}
              >
                Danh sách sân
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/gioi-thieu" 
                className={location.pathname === '/gioi-thieu' ? "navbar-link active" : "navbar-link"}
                onClick={(e) => handleNavLinkClick(e, "/gioi-thieu")}
              >
                Giới thiệu
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/chinh-sach" 
                className={location.pathname === '/chinh-sach' ? "navbar-link active" : "navbar-link"}
                onClick={(e) => handleNavLinkClick(e, "/chinh-sach")}
              >
                Chính sách
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/dieu-khoan" 
                className={location.pathname === '/dieu-khoan' ? "navbar-link active" : "navbar-link"}
                onClick={(e) => handleNavLinkClick(e, "/dieu-khoan")}
              >
                Điều khoản
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/chu-san" 
                className={location.pathname === '/chu-san' ? "navbar-link active" : "navbar-link"}
                onClick={(e) => handleNavLinkClick(e, "/chu-san")}
              >
                Chủ sân
              </Link>
            </li>
            <li className="navbar-item">
              <a 
                href="#footer" 
                className="navbar-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('footer').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Liên hệ
              </a>
            </li>
          </ul>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <div className="user-dropdown-container">
                <div className="user-info" onClick={toggleUserDropdown}>
                  <span className="user-name">{currentUser?.firstname || currentUser?.email.split('@')[0] || 'User'}</span>
                  <i className={`fas fa-chevron-${showUserDropdown ? 'up' : 'down'}`}></i>
                </div>
                
                {showUserDropdown && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <i className="fas fa-user"></i> Tài khoản
                    </Link>
                    {/* <Link to="/bookings" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <i className="fas fa-calendar-alt"></i> Lịch đặt sân
                    </Link>
                    <Link to="/bills" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <i className="fas fa-file-invoice-dollar"></i> Hóa đơn
                    </Link> */}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item logout" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="navbar-action-button" onClick={openRegisterModal}>Đăng ký</button>
                <button className="navbar-action-button" onClick={openLoginModal}>Đăng nhập</button>
              </>
            )}
            <div className="navbar-search-icon" onClick={openSearchModal}>
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>
      </nav>

      {/* Render modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={closeAllModals} 
        openRegisterModal={openRegisterModal} 
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={closeAllModals} 
        openLoginModal={openLoginModal} 
      />
      <SearchModal 
        isOpen={showSearchModal} 
        onClose={closeAllModals} 
      />
    </>
  );
};

export default Navbar;