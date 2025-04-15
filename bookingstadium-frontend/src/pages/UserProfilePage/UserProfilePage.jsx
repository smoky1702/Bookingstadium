import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { userAPI, bookingAPI } from '../../services/apiService';
import '../UserProfilePage/UserProfilePage.css';

const UserProfilePage = () => {
  const { currentUser, isAuthenticated, logout, setUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiLoaded, setApiLoaded] = useState(false);
  const [forbiddenError, setForbiddenError] = useState(null);
  
  // Form state for profile editing
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
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
  
  // API đang lấy từ backend thông tin các trạng thái đặt sân
  const [bookingStatuses, setBookingStatuses] = useState({});
  
  // Lấy cấu hình trạng thái đặt sân từ API
  useEffect(() => {
    const getBookingStatuses = async () => {
      try {
        // Xác định trạng thái từ backend
        setBookingStatuses({
          PENDING: 'Đang chờ',
          CONFIRMED: 'Đã xác nhận',
          COMPLETED: 'Hoàn thành', 
          CANCELLED: 'Đã hủy'
        });
      } catch (error) {
        //console.error('Lỗi khi lấy cấu hình trạng thái đặt sân:', error);
      }
    };
    
    getBookingStatuses();
  }, []);
  
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Trả về chuỗi rỗng nếu không hợp lệ
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      //console.error('Lỗi khi định dạng ngày:', error);
      return '';
    }
  };
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return ''; // Trả về chuỗi rỗng nếu không hợp lệ
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      //console.error('Lỗi khi định dạng ngày giờ:', error);
      return '';
    }
  };
  
  // Lắng nghe sự kiện lỗi 403 từ api:forbidden
  useEffect(() => {
    const handleForbidden = (event) => {
      //console.log('Lỗi phân quyền trong UserProfilePage:', event.detail);
      setForbiddenError({
        message: event.detail.message,
        url: event.detail.url,
        method: event.detail.method
      });
      
      // Tự động xóa thông báo lỗi sau 5 giây
      setTimeout(() => {
        setForbiddenError(null);
      }, 5000);
    };
    
    window.addEventListener('api:forbidden', handleForbidden);
    
    // Cleanup
    return () => {
      window.removeEventListener('api:forbidden', handleForbidden);
    };
  }, []);
  
  // Sử dụng ngay thông tin từ token cho hiển thị ban đầu
  useEffect(() => {
    if (currentUser) {
      // Khởi tạo form data rỗng, chỉ cập nhật khi có dữ liệu từ API
      setFormData({
        email: '',
        firstname: '',
        lastname: '',
        phone: '',
        day_of_birth: '',
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
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          throw new Error('Không tìm thấy token đăng nhập');
        }

        // Sử dụng API /users/me để lấy thông tin người dùng
        try {
          const response = await userAPI.getCurrentUserMe();
          
          if (response && response.data) {
            let userData;
            
            // Xử lý cấu trúc phản hồi
            if (response.data.result) {
              userData = response.data.result;
            } else {
              userData = response.data;
            }
            
            // Cập nhật state và form
            setUserData(userData);
            setApiLoaded(true);
            
            // Lưu thông tin vào sessionStorage để dùng cho lần sau
            try {
              sessionStorage.setItem('currentUser', JSON.stringify(userData));
            } catch (e) {
              //console.error('Lỗi khi lưu user cache:', e);
            }
            
            // Cập nhật form data
            setFormData({
              email: userData.email || '',
              firstname: userData.firstname || '',
              lastname: userData.lastname || '',
              phone: userData.phone || '',
              day_of_birth: userData.day_of_birth || '',
              password: '',
              confirmPassword: ''
            });
            
            // Nếu lấy được ID người dùng từ API, lưu vào context
            if (userData.user_id) {
              setUserInfo(userData.user_id);
            }
          } else {
            throw new Error('Phản hồi API không hợp lệ');
          }
        } catch (error) {
          //console.error('Lỗi khi gọi API /users/me:', error);
          
          // Nếu API /users/me thất bại, thử dùng getCurrentUser
          if (error.response && error.response.status === 404) {
            try {
              const response = await userAPI.getCurrentUser();
              
              if (response && response.data) {
                let userData;
                
                // Xử lý cấu trúc phản hồi
                if (response.data.result) {
                  userData = response.data.result;
                } else {
                  userData = response.data;
                }
                
                // Cập nhật state và form
                setUserData(userData);
          setApiLoaded(true);
          
                // Lưu thông tin vào sessionStorage
                try {
                  sessionStorage.setItem('currentUser', JSON.stringify(userData));
                } catch (e) {
                 // console.error('Lỗi khi lưu user cache:', e);
                }
                
                // Cập nhật form data
          setFormData({
                  email: userData.email || '',
                  firstname: userData.firstname || '',
                  lastname: userData.lastname || '',
                  phone: userData.phone || '',
                  day_of_birth: userData.day_of_birth || '',
            password: '',
            confirmPassword: ''
          });
                
                if (userData.user_id) {
                  setUserInfo(userData.user_id);
                }
              } else {
                throw new Error('Phản hồi API không hợp lệ');
              }
            } catch (backupError) {
              // Sử dụng fallback từ context nếu cả 2 API đều thất bại
              handleApiFailure(backupError);
            }
        } else {
            // Sử dụng fallback từ context nếu API thất bại
            handleApiFailure(error);
          }
        }
      } catch (error) {
        //console.error('Error fetching user details:', error);
        setUserData(null);
        setApiLoaded(false);
        setError('Lỗi khi tải thông tin người dùng: ' + (error.message || 'Vui lòng thử lại sau'));
      } finally {
        setLoading(false);
      }
    };
    
    // Xử lý khi API thất bại - trích xuất thành hàm riêng để tái sử dụng
    const handleApiFailure = (error) => {
      //console.error('Fallback to context data:', error);
      
      if (error.response && error.response.status === 403) {
        setError('Bạn không có quyền xem thông tin người dùng');
      } else if (currentUser) {
        const basicUserData = {
          email: currentUser.email,
          firstname: currentUser.firstName || '',
          lastname: currentUser.lastName || '',
          phone: '',
          day_of_birth: '',
          role: currentUser.role || 'USER',
          active: true
        };
        
        setUserData(basicUserData);
        setApiLoaded(false);
        
        setFormData({
          email: basicUserData.email || '',
          firstname: basicUserData.firstname || '',
          lastname: basicUserData.lastname || '',
          phone: basicUserData.phone || '',
          day_of_birth: basicUserData.day_of_birth || '',
          password: '',
          confirmPassword: ''
        });
      } else {
        throw new Error('Không thể tải thông tin người dùng');
      }
    };
    
    fetchUserData();
    
    // Lấy lịch sử đặt sân của người dùng
    if (currentUser?.user_id) {
      const fetchBookingHistory = async () => {
        try {
          const response = await bookingAPI.getUserBookings(currentUser.user_id);
          
          if (response && response.data) {
            if (response.data.result) {
            setBookingHistory(response.data.result);
            } else {
              // Trường hợp API trả về data trực tiếp
            setBookingHistory(Array.isArray(response.data) ? response.data : [response.data]);
            }
          } else {
            setBookingHistory([]);
          }
        } catch (error) {
          //console.error('Lỗi khi lấy lịch sử đặt sân:', error);
          setBookingHistory([]);
        }
      };
      
      fetchBookingHistory();
    } else {
      setBookingHistory([]);
    }
  }, [isAuthenticated, currentUser, navigate, setUserInfo]);
  
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
        email: '',
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
  
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    // Validate password if user is updating it
    if (formData.password && formData.password !== formData.confirmPassword) {
      setUpdateError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }
    
    setLoading(true);
      setUpdateError(null);
    
    // Luôn gửi đầy đủ các trường, sử dụng giá trị hiện tại nếu không thay đổi
      const updateData = {
      email: userData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
      // QUAN TRỌNG: Backend yêu cầu luôn có password trong request
      password: formData.password && formData.password.trim() !== '' 
        ? formData.password 
        : 'qa1234' // Password mặc định khi không đổi
    };
    
    // Kiểm tra và định dạng ngày sinh trước khi gửi
    if (formData.day_of_birth && formData.day_of_birth.trim() !== '') {
      try {
        // Đảm bảo định dạng đúng YYYY-MM-DD
        const dateObj = new Date(formData.day_of_birth);
        const formattedDate = dateObj.toISOString().split('T')[0];
        updateData.day_of_birth = formattedDate;
      } catch (error) {
        //console.error('Lỗi khi định dạng ngày:', error);
        updateData.day_of_birth = formData.day_of_birth.trim();
      }
    }
    
    //console.log('Dữ liệu gửi đến API:', JSON.stringify(updateData));
    
    // Gọi API để cập nhật thông tin người dùng
    userAPI.updateUser(userData.user_id, updateData)
      .then(response => {
        //console.log('Cập nhật thành công:', response.data);
        setUpdateSuccess(true);
        setUpdateError(null);
        
        // Thoát khỏi chế độ chỉnh sửa
      setEditMode(false);
      
        // Làm mới dữ liệu người dùng từ API
        refreshUserData();
      })
      .catch(error => {
        //console.error('Lỗi khi cập nhật:', error);
      if (error.response) {
          //console.log('Error status:', error.response.status);
          //console.log('Error data:', error.response.data);
          
          // Hiển thị thông báo lỗi chi tiết hơn
          if (error.response.data && error.response.data.message) {
            setUpdateError(error.response.data.message);
          } else if (error.response.data && error.response.data.error) {
            setUpdateError(error.response.data.error);
      } else {
            setUpdateError('Lỗi ' + error.response.status + ': ' + 
              (error.response.statusText || 'Không thể cập nhật thông tin'));
      }
        } else {
          setUpdateError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    }
        setUpdateSuccess(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserRoleName = () => {
    if (!userData) return '';
    
    // Xử lý nhiều dạng role khác nhau từ API
    let roleName = '';
    
    // Đầu tiên kiểm tra role_id từ API /users/me
    if (userData.role_id) {
      roleName = userData.role_id;
    }
    // Nếu không có role_id, kiểm tra role từ các API khác
    else if (userData.role) {
      if (typeof userData.role === 'string') {
        // Trường hợp role là string
        roleName = userData.role;
      } else if (userData.role.roleName) {
        // Trường hợp { roleName: "USER" }
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
    if (roleName === 'USER') return 'Người dùng';
    if (roleName === 'OWNER') return 'Chủ sân';
    if (roleName === 'ADMIN') return 'Quản trị viên';
    
    return roleName || ''; 
  };

  const getAccountStatus = () => {
      return 'Đang hoạt động';
  };

  // Lấy tên hiển thị của người dùng
  const getDisplayName = () => {
    if (!userData) return '';
    
    if (userData.firstname && userData.lastname) {
      return `${userData.firstname} ${userData.lastname}`;
    } else if (userData.firstname) {
      return userData.firstname;
    } else if (userData.lastname) {
      return userData.lastname;
    } else if (userData.email) {
      return userData.email.split('@')[0];
    }
    
    return '';
  };

  // Lấy đầy đủ lastname cho avatar
  const getAvatarName = () => {
    if (!userData) return '';
    
    if (userData.lastname) {
      return userData.lastname;
    } else if (userData.firstname) {
      return userData.firstname;
    } else if (userData.email) {
      return userData.email.split('@')[0];
    }
    
    return '';
  };

  // Hàm làm mới dữ liệu người dùng từ API
  const refreshUserData = () => {
    userAPI.getCurrentUserMe()
      .then(response => {
        if (response && response.data) {
          let userData;
          
          if (response.data.result) {
            userData = response.data.result;
          } else {
            userData = response.data;
          }
          
          setUserData(userData);
          setApiLoaded(true);
          
          // Cập nhật form data
          setFormData({
            email: userData.email || '',
            firstname: userData.firstname || '',
            lastname: userData.lastname || '',
            phone: userData.phone || '',
            day_of_birth: userData.day_of_birth || '',
            password: '',
            confirmPassword: ''
          });
          
          // Lưu vào sessionStorage
          try {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
          } catch (e) {
            //console.error('Lỗi khi lưu user cache:', e);
          }
        }
      })
      .catch(error => {
        //console.error('Lỗi khi làm mới dữ liệu:', error);
      });
  };

  return (
    <div className="profile-page">
      <Navbar />
      
      {/* Hiển thị thông báo lỗi phân quyền nếu có */}
      {forbiddenError && (
        <div className="forbidden-error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{forbiddenError.message}</span>
          <button onClick={() => setForbiddenError(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      <div className="profile-container">
        <div className="container">
          <div className="profile-header">
            <h1>Tài khoản của tôi</h1>
          </div>
          
          <div className="profile-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang tải thông tin...</span>
                </div>
              </div>
            ) : userData && userData.email ? (
              <>
            <div className="profile-sidebar">
              <div className="user-profile-card">
                <div className="avatar-circle">
                      <span className="avatar-text">{getAvatarName()}</span>
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
                                value={formData.day_of_birth || ''}
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
                              <label htmlFor="password">Mật khẩu mới (nhập mật khẩu cũ nếu không đổi)</label>
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
                            <button type="submit" className="save-button" disabled={loading}>
                              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
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
                                      : (userData?.firstname || userData?.lastname || '')}
                                  </div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Email</div>
                                  <div className="info-value">{userData?.email || ''}</div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Số điện thoại</div>
                                  <div className="info-value">{userData?.phone || ''}</div>
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
                                  <div className="info-value user-id">{userData?.user_id || ''}</div>
                                </div>
                                
                                <div className="info-group">
                                  <div className="info-label">Vai trò</div>
                                  <div className="info-value">
                                    <span className="role-badge user">
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
                    </div>
                  )}
                  
                  {activeTab === 'bookings' && (
                <div className="bookings-tab">
                  <div className="tab-header">
                    <h2>Lịch sử đặt sân</h2>
                  </div>
                  
                      {bookingHistory.length > 0 ? (
                    <div className="booking-list">
                      {bookingHistory.map(booking => (
                        <div key={booking.booking_id} className="booking-card">
                          <div className="booking-header">
                            <div className="booking-id">Mã đặt sân: #{booking.booking_id}</div>
                            <div className={`booking-status ${booking.status?.toLowerCase()}`}>
                                  {bookingStatuses[booking.status] || booking.status}
                            </div>
                          </div>
                          <div className="booking-body">
                            <div className="booking-detail">
                              <i className="fas fa-map-marker-alt"></i>
                                  <span>Sân: {booking.stadium_name || booking.stadiumName || ''}</span>
                            </div>
                            <div className="booking-detail">
                              <i className="far fa-calendar-alt"></i>
                                  <span>Ngày: {formatDateTime(booking.booking_date || booking.bookingDate)}</span>
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
              </>
            ) : (
              <div className="no-data">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error || 'Không thể lấy dữ liệu từ máy chủ. Vui lòng thử lại sau.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;