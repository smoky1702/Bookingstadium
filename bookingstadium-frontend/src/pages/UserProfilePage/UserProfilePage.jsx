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
  const [apiLoaded, setApiLoaded] = useState(false);
  
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
  const checkIsAdmin = (user) => {
    if (!user || !user.role) return false;
    
    // Xử lý nhiều dạng role khác nhau
    if (typeof user.role === 'string') {
      return user.role === 'ADMIN';
    } else if (user.role.roleName) {
      return user.role.roleName === 'ADMIN';
    } else if (user.role.roleId) {
      return user.role.roleId === 'ADMIN';
    }
    
    return false;
  };

  // Kiểm tra xem người dùng có phải là admin hay không
  const isAdmin = checkIsAdmin(currentUser);
  
  // Hàm xử lý định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Trả về chuỗi gốc nếu không parse được
    }
  };
  
  // Sử dụng ngay thông tin từ token cho hiển thị ban đầu
  useEffect(() => {
    if (currentUser) {
      console.log('Thông tin người dùng từ token:', currentUser);
      setUserData(currentUser);
      setFormData({
        firstname: currentUser.firstname || '',
        lastname: currentUser.lastname || '',
        phone: currentUser.phone || '',
        day_of_birth: currentUser.day_of_birth || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [currentUser]);
  
  // Sau đó fetch thông tin chi tiết từ API
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Fetch full user details from API
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        console.log('Gọi API lấy thông tin người dùng hiện tại (email:', currentUser?.email, ')');
          
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        console.log('Token hiện tại:', token ? 'Có token (độ dài: ' + token.length + ' ký tự)' : 'Không có token');
        
        const response = await userAPI.getCurrentUser();
        
        // Debug: Log API response đầy đủ
        console.log('API Response đầy đủ:', response);
        
        if (response && response.data) {
          let userData = null;
          
          // Kiểm tra cấu trúc response và tìm đúng user
          if (response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
            console.log('API trả về array users, tìm kiếm user với email:', currentUser?.email);
            
            // Tìm người dùng có email khớp với email đang đăng nhập
            const foundUser = response.data.result.find(
              user => user.email === currentUser?.email
            );
            
            if (foundUser) {
              console.log('Tìm thấy user khớp với email đang đăng nhập');
              userData = foundUser;
            } else {
              console.warn('Không tìm thấy user với email khớp với email đang đăng nhập');
              // Nếu không tìm thấy, kiểm tra có thể có user_id khớp
              const foundUserById = response.data.result.find(
                user => user.user_id === currentUser?.user_id
              );
              
              if (foundUserById) {
                console.log('Tìm thấy user khớp với ID đang đăng nhập');
                userData = foundUserById;
              } else {
                console.warn('Không tìm thấy user phù hợp, sử dụng thông tin từ token');
                // Nếu không tìm thấy, sử dụng thông tin từ token
                return;
              }
            }
          } else if (response.data.result) {
            console.log('API trả về object result');
            userData = response.data.result;
          } else {
            console.log('API trả về object trực tiếp');
            userData = response.data;
          }
          
          console.log('User data extracted:', userData);
          
          // Nếu userData không có thông tin cần thiết, có thể đã có lỗi trong cấu trúc dữ liệu
          if (!userData.email) {
            console.warn('API đã trả về dữ liệu nhưng không chứa thông tin người dùng cần thiết:', userData);
            setError('Dữ liệu API không chứa thông tin người dùng cần thiết.');
            return;
          }
          
          // Merge API data với current user data
          const fullUserData = { 
            ...currentUser, 
            ...userData,
            // Ensure we preserve role information correctly
            role: userData.role || currentUser.role
          };
          
          console.log('Full User Data (merged):', fullUserData);
          setUserData(fullUserData);
          setApiLoaded(true);
          
          // Update form data with complete user details
          setFormData({
            firstname: fullUserData.firstname || '',
            lastname: fullUserData.lastname || '',
            phone: fullUserData.phone || '',
            day_of_birth: fullUserData.day_of_birth || '',
            password: '',
            confirmPassword: ''
          });
        } else {
          console.warn('API response không chứa data:', response);
          setError('Không nhận được dữ liệu từ API.');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
          setError(`Lỗi API: ${error.response.status} - ${error.response.statusText || 'Không rõ lỗi'}`);
        } else if (error.request) {
          console.error('Error request:', error.request);
          setError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và API endpoint.');
        } else {
          console.error('Error message:', error.message);
          setError(`Lỗi: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
    
    // Nếu không phải admin, lấy lịch sử đặt sân
    if (!isAdmin && currentUser?.user_id) {
      const fetchBookingHistory = async () => {
        try {
          setLoading(true);
          console.log('Fetching booking history for user ID:', currentUser.user_id);
          const response = await bookingAPI.getUserBookings(currentUser.user_id);
          console.log('Booking history response:', response);
          
          if (response.data && response.data.result) {
            setBookingHistory(response.data.result);
          } else if (response.data) {
            // Trường hợp API trả về data trực tiếp, không qua result
            setBookingHistory(Array.isArray(response.data) ? response.data : [response.data]);
          } else {
            console.warn('API booking không trả về dữ liệu');
          }
        } catch (error) {
          console.error('Lỗi khi lấy lịch sử đặt sân:', error);
          if (error.response) {
            console.error('Error booking response:', error.response.status, error.response.data);
          }
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
      // Create update data object
      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        day_of_birth: formData.day_of_birth
      };
      
      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // Call API to update user profile
      console.log('Gửi request cập nhật thông tin người dùng:', updateData);
      const response = await userAPI.updateUser(userData.user_id, updateData);
      console.log('Kết quả cập nhật:', response);
      
      // Cập nhật userData trong state
      const updatedUserData = {
        ...userData,
        ...updateData
      };
      
      setUserData(updatedUserData);
      setUpdateSuccess(true);
      setEditMode(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
        setUpdateError(`Lỗi: ${error.response.status} - ${error.response.data?.message || 'Không thể cập nhật hồ sơ'}`);
      } else {
        setUpdateError('Không thể cập nhật hồ sơ. Vui lòng thử lại sau.');
      }
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserRoleName = () => {
    if (!userData) return 'Người dùng';
    
    // Xử lý nhiều dạng role khác nhau từ API
    let roleName = 'Người dùng';
    
    if (userData.role) {
      if (typeof userData.role === 'string') {
        // Trường hợp role là string
        roleName = userData.role;
      } else if (userData.role.roleName) {
        // Trường hợp { roleName: "ADMIN" }
        roleName = userData.role.roleName;
      } else if (userData.role.roleId) {
        // Trường hợp { roleId: "USER" }
        roleName = userData.role.roleId;
      } else {
        // Không biết định dạng, hiển thị JSON string
        roleName = JSON.stringify(userData.role);
      }
    }
    
    // Chuyển đổi tên vai trò thành tiếng Việt
    switch(roleName) {
      case 'ADMIN': return 'Quản trị viên';
      case 'USER': return 'Người dùng';
      default: return roleName;
    }
  };

  const getAccountStatus = () => {
    if (!userData) return 'Không xác định';
    
    if (userData.active === true || userData.active === 'true') {
      return 'Đang hoạt động';
    } else if (userData.active === false || userData.active === 'false') {
      return 'Bị vô hiệu hóa';
    }
    
    return 'Đang hoạt động'; // Default value
  };

  // Lấy tên hiển thị của người dùng
  const getDisplayName = () => {
    if (userData?.firstname && userData?.lastname) {
      return `${userData.firstname} ${userData.lastname}`;
    } else if (userData?.firstname) {
      return userData.firstname;
    } else if (userData?.lastname) {
      return userData.lastname;
    } else if (userData?.email) {
      return userData.email.split('@')[0];
    } else {
      return 'Người dùng';
    }
  };

  // Lấy chữ cái đầu tiên cho avatar - ưu tiên lastName
  const getAvatarLetter = () => {
    if (userData?.lastname) {
      return userData.lastname.charAt(0).toUpperCase();
    } else if (userData?.firstname) {
      return userData.firstname.charAt(0).toUpperCase();
    } else if (userData?.email) {
      return userData.email.charAt(0).toUpperCase();
    } else {
      return 'U';
    }
  };
  
  // Lấy dữ liệu từ token hoặc API tùy thuộc vào trạng thái tải
  const getDataSource = () => {
    return apiLoaded ? "API chi tiết" : "Token đăng nhập";
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
              <div className="user-profile-card">
                <div className="avatar-circle">
                  <span className="avatar-text">{userData?.lastname || 'User'}</span>
                </div>
                <div className="user-info">
                  <h3 className="user-name">{getDisplayName()}</h3>
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
                  
                  {error && (
                    <div className="info-message">
                      <i className="fas fa-info-circle"></i>
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {/* Debug information - Hiển thị dữ liệu hiện tại - Đã tắt */}
                  {/* Đã tắt để sản phẩm gọn gàng hơn
                  {process.env.NODE_ENV === 'development' && (
                    <div className="debug-data">
                      <strong>Debug - User Data <span className={`data-source ${apiLoaded ? 'api' : 'token'}`}>
                        {getDataSource()}
                      </span>:</strong>
                      <pre style={{ overflow: 'auto', maxHeight: '100px' }}>
                        {JSON.stringify(userData, null, 2)}
                      </pre>
                    </div>
                  )}
                  */}
                  
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
                  
                  {loading ? (
                    <div className="loading">
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Đang tải thông tin...</span>
                    </div>
                  ) : (
                    <>
                      {editMode ? (
                        <form onSubmit={handleProfileUpdate} className="profile-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="firstname">Họ</label>
                              <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                className="form-control"
                                value={formData.firstname}
                                onChange={handleInputChange}
                              />
                            </div>
                            
                            <div className="form-group">
                              <label htmlFor="lastname">Tên</label>
                              <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                className="form-control"
                                value={formData.lastname}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="email">Email</label>
                              <input
                                type="email"
                                id="email"
                                className="form-control"
                                value={userData?.email || ''}
                                disabled
                              />
                              <small className="form-text text-muted">
                                Email không thể thay đổi.
                              </small>
                            </div>
                            
                            <div className="form-group">
                              <label htmlFor="phone">Số điện thoại</label>
                              <input
                                type="text"
                                id="phone"
                                name="phone"
                                className="form-control"
                                value={formData.phone}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="day_of_birth">Ngày sinh</label>
                              <input
                                type="date"
                                id="day_of_birth"
                                name="day_of_birth"
                                className="form-control"
                                value={formData.day_of_birth}
                                onChange={handleInputChange}
                              />
                            </div>

                            <div className="form-group">
                              <label>Vai trò</label>
                              <input
                                type="text"
                                className="form-control"
                                value={getUserRoleName()}
                                disabled
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="password">Mật khẩu mới (để trống nếu không đổi)</label>
                              <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleInputChange}
                              />
                            </div>
                            
                            <div className="form-group">
                              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                              <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-control"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          
                          <div className="form-actions">
                            <button type="submit" className="save-button">
                              Lưu thay đổi
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="profile-info">
                          <div className="info-card">
                            <div className="info-section">
                              <h3>Thông tin cơ bản</h3>
                              <div className="info-grid">
                                <div className="info-group">
                                  <div className="info-label">Họ và tên</div>
                                  <div className="info-value">
                                    {userData?.firstname && userData?.lastname 
                                      ? `${userData.firstname} ${userData.lastname}`
                                      : (userData?.firstname || userData?.lastname || 'Chưa cập nhật')}
                                  </div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Email</div>
                                  <div className="info-value">{userData?.email || 'Chưa cập nhật'}</div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Số điện thoại</div>
                                  <div className="info-value">{userData?.phone || 'Chưa cập nhật'}</div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Ngày sinh</div>
                                  <div className="info-value">{formatDate(userData?.day_of_birth)}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="info-section">
                              <h3>Thông tin tài khoản</h3>
                              <div className="info-grid">
                                <div className="info-group">
                                  <div className="info-label">Mã người dùng</div>
                                  <div className="info-value user-id">{userData?.user_id || 'Không có'}</div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Vai trò</div>
                                  <div className="info-value">
                                    <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                                      {getUserRoleName()}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Trạng thái</div>
                                  <div className="info-value">
                                    <span className={`status-badge ${getAccountStatus() === 'Đang hoạt động' ? 'active' : 'inactive'}`}>
                                      {getAccountStatus()}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Ngày tạo tài khoản</div>
                                  <div className="info-value">{formatDate(userData?.date_created || userData?.dateCreated)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
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
                    <div className="loading">
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  ) : bookingHistory.length > 0 ? (
                    <div className="booking-list">
                      {/* Booking history content */}
                      {bookingHistory.map(booking => (
                        <div key={booking.booking_id} className="booking-card">
                          <div className="booking-header">
                            <div className="booking-id">Mã đặt sân: #{booking.booking_id}</div>
                            <div className={`booking-status ${booking.status?.toLowerCase()}`}>
                              {booking.status === 'PENDING' ? 'Đang chờ' : 
                               booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                               booking.status === 'COMPLETED' ? 'Hoàn thành' :
                               booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
                            </div>
                          </div>
                          <div className="booking-body">
                            <div className="booking-detail">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>Sân: {booking.stadium_name || booking.stadiumName || 'Không có thông tin'}</span>
                            </div>
                            <div className="booking-detail">
                              <i className="far fa-calendar-alt"></i>
                              <span>Ngày: {formatDate(booking.booking_date || booking.bookingDate)}</span>
                            </div>
                            <div className="booking-detail">
                              <i className="far fa-clock"></i>
                              <span>Thời gian: {booking.time_start || booking.timeStart} - {booking.time_end || booking.timeEnd}</span>
                            </div>
                            <div className="booking-detail">
                              <i className="fas fa-money-bill-wave"></i>
                              <span>Tổng tiền: {booking.total_price?.toLocaleString() || booking.totalPrice?.toLocaleString() || 0} VNĐ</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-bookings">
                      <i className="far fa-calendar-times"></i>
                      <p>Bạn chưa có lịch sử đặt sân nào.</p>
                      <Link to="/danh-sach-san" className="book-now-button">
                        Đặt sân ngay
                      </Link>
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