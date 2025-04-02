import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import AdminPanel from '../../Admin/AdminPanel';
import { userAPI, bookingAPI } from '../../services/apiService';
import '../UserProfilePage/UserProfilePage.css';

const UserProfilePage = () => {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state for profile editing
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    day_of_birth: '',
    password: '',
    confirmPassword: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  // Booking history state
  const [bookingHistory, setBookingHistory] = useState([]);
  
  // Kiểm tra xem người dùng có phải là admin hay không
  const isAdmin = currentUser?.role?.roleName === 'ADMIN';
  
  // Hàm xử lý định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Trả về chuỗi gốc nếu không parse được
    }
  };
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Sử dụng thông tin từ currentUser thay vì gọi API
    if (currentUser) {
      setUserData(currentUser);
      
      // Khởi tạo form data từ thông tin hiện có
      setFormData({
        firstname: currentUser.firstname || '',
        lastname: currentUser.lastname || '',
        phone: currentUser.phone || '',
        day_of_birth: currentUser.day_of_birth || '',
        password: '',
        confirmPassword: ''
      });
    }
    
    // Nếu không phải admin, lấy lịch sử đặt sân
    if (!isAdmin && currentUser?.user_id) {
      const fetchBookingHistory = async () => {
        try {
          setLoading(true);
          const response = await bookingAPI.getUserBookings(currentUser.user_id);
          if (response.data && response.data.result) {
            setBookingHistory(response.data.result);
          }
        } catch (error) {
          console.error('Lỗi khi lấy lịch sử đặt sân:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchBookingHistory();
    }
  }, [isAuthenticated, currentUser, navigate, isAdmin]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleEditToggle = () => {
    if (editMode) {
      // Reset form data if canceling edit
      setFormData({
        firstname: userData?.firstname || '',
        lastname: userData?.lastname || '',
        phone: userData?.phone || '',
        day_of_birth: userData?.day_of_birth || '',
        password: '',
        confirmPassword: ''
      });
    }
    setEditMode(!editMode);
    setUpdateSuccess(false);
    setUpdateError(null);
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      setUpdateError('Mật khẩu không khớp.');
      return;
    }
    
    try {
      setUpdateError(null);
      
      // Cập nhật userData trong state
      const updatedUserData = {
        ...userData,
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        day_of_birth: formData.day_of_birth
      };
      
      setUserData(updatedUserData);
      setUpdateSuccess(true);
      setEditMode(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Không thể cập nhật hồ sơ. Vui lòng thử lại sau.');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="container">
          <div className="profile-header">
            <h1>Tài khoản của tôi</h1>
          </div>
          
          <div className="profile-content">
            <div className="profile-sidebar">
              <div className="user-avatar">
                <div className="avatar-placeholder">
                  {userData?.firstname?.charAt(0) || userData?.email?.charAt(0) || '?'}
                  {userData?.lastname?.charAt(0) || ''}
                </div>
                <div className="user-name">
                  {userData?.firstname ? `${userData.firstname} ${userData.lastname || ''}` : userData?.email?.split('@')[0] || 'Người dùng'}
                </div>
                <div className="user-email">
                  {userData?.email || 'Không có email'}
                </div>
              </div>
              
              <div className="sidebar-menu">
                <button 
                  className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`} 
                  onClick={() => handleTabChange('profile')}
                >
                  <i className="fas fa-user"></i>
                  <span>Thông tin cá nhân</span>
                </button>
                
                {isAdmin ? (
                  <button 
                    className={`menu-item ${activeTab === 'admin' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('admin')}
                  >
                    <i className="fas fa-cogs"></i>
                    <span>Quản trị hệ thống</span>
                  </button>
                ) : (
                  <button 
                    className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('bookings')}
                  >
                    <i className="fas fa-calendar-alt"></i>
                    <span>Lịch sử đặt sân</span>
                  </button>
                )}
                
                <button className="menu-item logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
            
            <div className="profile-main">
              {activeTab === 'profile' && (
                <div className="profile-tab">
                  <div className="tab-header">
                    <h2>Thông tin cá nhân</h2>
                    <button className="edit-button" onClick={handleEditToggle}>
                      {editMode ? 'Hủy' : 'Chỉnh sửa'}
                    </button>
                  </div>
                  
                  {updateSuccess && (
                    <div className="success-message">
                      <i className="fas fa-check-circle"></i>
                      <span>Cập nhật thông tin thành công!</span>
                    </div>
                  )}
                  
                  {updateError && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{updateError}</span>
                    </div>
                  )}
                  
                  {!userData && !loading ? (
                    <div className="info-message">
                      <i className="fas fa-info-circle"></i>
                      <span>Không thể tải thông tin chi tiết người dùng. Chỉ hiển thị thông tin cơ bản.</span>
                    </div>
                  ) : null}
                  
                  {editMode ? (
                    <form onSubmit={handleProfileUpdate} className="profile-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Họ</label>
                          <input 
                            type="text" 
                            name="firstname" 
                            value={formData.firstname} 
                            onChange={handleInputChange}
                            className="form-control" 
                            placeholder="Nhập họ của bạn"
                          />
                        </div>
                        <div className="form-group">
                          <label>Tên</label>
                          <input 
                            type="text" 
                            name="lastname" 
                            value={formData.lastname} 
                            onChange={handleInputChange}
                            className="form-control" 
                            placeholder="Nhập tên của bạn"
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Số điện thoại</label>
                          <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleInputChange}
                            className="form-control" 
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                        <div className="form-group">
                          <label>Ngày sinh</label>
                          <input 
                            type="date" 
                            name="day_of_birth" 
                            value={formData.day_of_birth} 
                            onChange={handleInputChange}
                            className="form-control" 
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Mật khẩu mới</label>
                          <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange}
                            className="form-control" 
                            placeholder="Để trống nếu không đổi mật khẩu"
                          />
                        </div>
                        <div className="form-group">
                          <label>Xác nhận mật khẩu</label>
                          <input 
                            type="password" 
                            name="confirmPassword" 
                            value={formData.confirmPassword} 
                            onChange={handleInputChange}
                            className="form-control" 
                            placeholder="Nhập lại mật khẩu mới"
                          />
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button type="submit" className="save-button">Lưu thay đổi</button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-info">
                      <div className="info-group">
                        <div className="info-label">Email</div>
                        <div className="info-value">{userData?.email || 'Chưa cập nhật'}</div>
                      </div>
                      <div className="info-group">
                        <div className="info-label">Họ và tên</div>
                        <div className="info-value">
                          {userData?.firstname ? `${userData.firstname} ${userData.lastname || ''}` : 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div className="info-group">
                        <div className="info-label">Số điện thoại</div>
                        <div className="info-value">{userData?.phone || 'Chưa cập nhật'}</div>
                      </div>
                      <div className="info-group">
                        <div className="info-label">Ngày sinh</div>
                        <div className="info-value">
                          {formatDate(userData?.day_of_birth)}
                        </div>
                      </div>
                      <div className="info-group">
                        <div className="info-label">Ngày tạo tài khoản</div>
                        <div className="info-value">
                          {formatDate(userData?.date_created) || 'Không có thông tin'}
                        </div>
                      </div>
                      <div className="info-group">
                        <div className="info-label">Vai trò</div>
                        <div className="info-value">
                          {userData?.role?.roleName === 'ADMIN' ? 'Quản trị viên' : 
                           userData?.role?.roleName === 'MANAGER' ? 'Quản lý sân' : 'Người dùng'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'admin' && isAdmin && (
                <AdminPanel />
              )}
              
              {activeTab === 'bookings' && !isAdmin && (
                <div className="bookings-tab">
                  <div className="tab-header">
                    <h2>Lịch sử đặt sân</h2>
                  </div>
                  
                  {loading ? (
                    <div className="loading">Đang tải dữ liệu...</div>
                  ) : bookingHistory.length === 0 ? (
                    <div className="no-bookings">
                      <i className="fas fa-calendar-times"></i>
                      <p>Bạn chưa có lịch đặt sân nào.</p>
                      <Link to="/danh-sach-san" className="book-now-button">
                        Đặt sân ngay
                      </Link>
                    </div>
                  ) : (
                    <div className="booking-history">
                      <div className="booking-filters">
                        <button className="filter-button active">Tất cả</button>
                        <button className="filter-button">Đang chờ</button>
                        <button className="filter-button">Đã xác nhận</button>
                        <button className="filter-button">Đã hoàn thành</button>
                        <button className="filter-button">Đã hủy</button>
                      </div>
                      
                      <div className="booking-list">
                        {bookingHistory.map(booking => (
                          <div key={booking.bookingId} className="booking-card">
                            <div className="booking-header">
                              <div className="booking-id">Mã đặt sân: #{booking.bookingId}</div>
                              <div className={`booking-status ${booking.status.toLowerCase()}`}>
                                {booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                 booking.status === 'PENDING' ? 'Đang chờ' :
                                 booking.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
                              </div>
                            </div>
                            <div className="booking-body">
                              <div className="booking-detail">
                                <i className="fas fa-futbol"></i>
                                <span>{booking.stadiumName || 'Không có thông tin sân'}</span>
                              </div>
                              <div className="booking-detail">
                                <i className="fas fa-calendar-day"></i>
                                <span>{formatDate(booking.dateOfBooking)}</span>
                              </div>
                              <div className="booking-detail">
                                <i className="fas fa-clock"></i>
                                <span>{booking.startTime} - {booking.endTime}</span>
                              </div>
                              <div className="booking-detail">
                                <i className="fas fa-tag"></i>
                                <span>{booking.price ? booking.price.toLocaleString() : '0'} VNĐ</span>
                              </div>
                            </div>
                            <div className="booking-actions">
                              <Link to={`/booking/${booking.bookingId}`} className="view-detail-button">
                                Xem chi tiết
                              </Link>
                              {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                                <button className="cancel-booking-button">
                                  Hủy đặt sân
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;