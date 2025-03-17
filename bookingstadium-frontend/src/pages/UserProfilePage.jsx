import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext';
import { userAPI, bookingAPI } from '../services/apiService';
import '../pages/UserProfilePage.css';

const UserProfilePage = () => {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line
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
  // eslint-disable-next-line
  const [bookingHistory, setBookingHistory] = useState([
    {
      id: 'BK001',
      stadiumName: 'Sân Thống Nhất',
      date: '2025-03-15',
      time: '18:00 - 20:00',
      price: 350000,
      status: 'CONFIRMED'
    },
    {
      id: 'BK002',
      stadiumName: 'Sân Hoa Lư',
      date: '2025-03-20',
      time: '16:00 - 18:00',
      price: 300000,
      status: 'PENDING'
    },
    {
      id: 'BK003',
      stadiumName: 'Sân Phú Thọ',
      date: '2025-03-10',
      time: '20:00 - 22:00',
      price: 400000,
      status: 'COMPLETED'
    }
  ]);
  
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
    
    const fetchUserData = async () => {
      if (!currentUser?.user_id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching user data for ID:", currentUser.user_id);
        const response = await userAPI.getCurrentUser(currentUser.user_id);
        console.log("User data response:", response);
        
        // Kiểm tra cấu trúc response từ API
        if (response.data) {
          // Nếu API trả về dữ liệu trong thuộc tính result
          if (response.data.result) {
            setUserData(response.data.result);
            setFormData({
              firstname: response.data.result.firstname || '',
              lastname: response.data.result.lastname || '',
              phone: response.data.result.phone || '',
              day_of_birth: response.data.result.day_of_birth || '',
              password: '',
              confirmPassword: ''
            });
          } 
          // Nếu API trả về dữ liệu trực tiếp trong data
          else {
            setUserData(response.data);
            setFormData({
              firstname: response.data.firstname || '',
              lastname: response.data.lastname || '',
              phone: response.data.phone || '',
              day_of_birth: response.data.day_of_birth || '',
              password: '',
              confirmPassword: ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Hàm lấy lịch sử đặt sân
    const fetchBookingHistory = async () => {
      try {
        // Ví dụ: Gọi API để lấy lịch sử đặt sân
        // const response = await bookingAPI.getUserBookings(currentUser.user_id);
        // if (response.data && response.data.result) {
        //   setBookingHistory(response.data.result);
        // }
        console.log("Would fetch booking history here");
        // Hiện tại đang sử dụng mock data, sẽ thay bằng API thực khi cần
      } catch (error) {
        console.error('Error fetching booking history:', error);
      }
    };
    
    fetchUserData();
    fetchBookingHistory();
  }, [isAuthenticated, currentUser, navigate]);
  
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
      setUpdateError('Passwords do not match.');
      return;
    }
    
    try {
      setUpdateError(null);
      
      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        day_of_birth: formData.day_of_birth,
      };
      
      // Only include password if it's been changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      console.log("Sending update with data:", updateData);
      const response = await userAPI.updateUser(currentUser.user_id, updateData);
      console.log("Update response:", response);
      
      // Kiểm tra response từ API
      if (response.data) {
        if (response.data.result) {
          setUserData(response.data.result);
        } else {
          setUserData(response.data);
        }
        setUpdateSuccess(true);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Failed to update profile. Please try again.');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="container">
          <div className="loading">Loading profile...</div>
        </div>
        <Footer />
      </div>
    );
  }

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
                  {userData?.firstname?.charAt(0) || ''}{userData?.lastname?.charAt(0) || ''}
                </div>
                <div className="user-name">
                  {userData?.firstname} {userData?.lastname}
                </div>
                <div className="user-email">
                  {userData?.email}
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
                <button 
                  className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`} 
                  onClick={() => handleTabChange('bookings')}
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span>Lịch sử đặt sân</span>
                </button>
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
                        <div className="info-value">{userData?.email}</div>
                      </div>
                      <div className="info-group">
                        <div className="info-label">Họ và tên</div>
                        <div className="info-value">{userData?.firstname} {userData?.lastname}</div>
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
                          {formatDate(userData?.date_created)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'bookings' && (
                <div className="bookings-tab">
                  <div className="tab-header">
                    <h2>Lịch sử đặt sân</h2>
                  </div>
                  
                  {bookingHistory.length === 0 ? (
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
                          <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                              <div className="booking-id">Mã đặt sân: #{booking.id}</div>
                              <div className={`booking-status ${booking.status.toLowerCase()}`}>
                                {booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                 booking.status === 'PENDING' ? 'Đang chờ' :
                                 booking.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
                              </div>
                            </div>
                            <div className="booking-body">
                              <div className="booking-detail">
                                <i className="fas fa-futbol"></i>
                                <span>{booking.stadiumName}</span>
                              </div>
                              <div className="booking-detail">
                                <i className="fas fa-calendar-day"></i>
                                <span>{formatDate(booking.date)}</span>
                              </div>
                              <div className="booking-detail">
                                <i className="fas fa-clock"></i>
                                <span>{booking.time}</span>
                              </div>
                              <div className="booking-detail">
                                <i className="fas fa-tag"></i>
                                <span>{booking.price.toLocaleString()} VNĐ</span>
                              </div>
                            </div>
                            <div className="booking-actions">
                              <Link to={`/booking/${booking.id}`} className="view-detail-button">
                                Xem chi tiết
                              </Link>
                              {booking.status === 'CONFIRMED' && (
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