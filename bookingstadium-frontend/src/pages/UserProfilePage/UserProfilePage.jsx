import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { userAPI, bookingAPI, billAPI, stadiumAPI, paymentMethodAPI, stadiumBookingDetailAPI } from '../../services/apiService';
import '../UserProfilePage/UserProfilePage.css';
import axios from 'axios';

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
  const [bookingDetails, setBookingDetails] = useState({});
  const [stadiums, setStadiums] = useState({});
  
  // Bill history state
  const [billHistory, setBillHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});
  
  // API đang lấy từ backend thông tin các trạng thái đặt sân
  const [bookingStatuses, setBookingStatuses] = useState({});
  
  // Bill statuses
  const [billStatuses, setBillStatuses] = useState({});
  
  // Thêm state để lưu locations
  const [locations, setLocations] = useState({});
  
  // Thêm state cho phân trang
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [currentBillPage, setCurrentBillPage] = useState(1);
  const bookingsPerPage = 10;
  const billsPerPage = 5;
  
  // Lấy cấu hình trạng thái đặt sân và hóa đơn từ API
  useEffect(() => {
    const getStatuses = async () => {
      try {
        // Xác định trạng thái từ backend
        setBookingStatuses({
          PENDING: 'Đang chờ',
          CONFIRMED: 'Đã xác nhận',
          COMPLETED: 'Hoàn thành',  
          CANCELLED: 'Đã hủy'
        });
        
        setBillStatuses({
          PAID: 'Đã thanh toán',
          UNPAID: 'Chưa thanh toán',
          CANCELLED: 'Đã hủy'
        });
      } catch (error) {
        //console.error('Lỗi khi lấy cấu hình trạng thái:', error);
      }
    };
    
    getStatuses();
  }, []);
  
  // Lấy thông tin phương thức thanh toán
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentMethodAPI.getPaymentMethod();
        
        const methods = {};
        if (response && response.data) {
          const paymentMethodsData = response.data.result || response.data;
          
          if (Array.isArray(paymentMethodsData)) {
            paymentMethodsData.forEach(method => {
              methods[method.id || method.paymentMethodId] = method.name || method.paymentMethodName || '';
            });
          }
        }
        
        setPaymentMethods(methods);
      } catch (error) {
        // Xử lý lỗi nhưng không log ra console
      }
    };
    
    fetchPaymentMethods();
  }, []);
  
  // Lấy thông tin sân bóng
  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const response = await stadiumAPI.getStadiums();
        if (response && response.data) {
          const stadiumsData = {};
          const stadiumsList = response.data.result || response.data;
          
          if (Array.isArray(stadiumsList)) {
            stadiumsList.forEach(stadium => {
              stadiumsData[stadium.stadiumId || stadium.id] = stadium;
              if (stadium.locationId) {
                stadiumsData[stadium.locationId] = stadium;
              }
            });
          }
          
          setStadiums(stadiumsData);
        }
      } catch (error) {
        // Xử lý lỗi nhưng không log ra console
      }
    };
    
    // Thêm API lấy thông tin địa điểm
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:8080/location');
        
        const locationsData = {};
        if (response && response.data) {
          const locationsList = response.data.result || response.data;
          
          if (Array.isArray(locationsList)) {
            locationsList.forEach(location => {
              locationsData[location.locationId || location.id] = location;
            });
            
            setLocations(locationsData);
          }
        }
      } catch (error) {
        // Xử lý lỗi nhưng không log ra console
      }
    };
    
    fetchStadiums();
    fetchLocations();
  }, []);
  
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
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
          const response = await bookingAPI.getCurrentUserBookings();
          
          if (response && response.data) {
            let bookings = [];
            if (response.data.result) {
              bookings = response.data.result;
            } else {
              bookings = Array.isArray(response.data) ? response.data : [response.data];
            }
            
            const processedBookings = bookings.map((booking, index) => {
              return {
                ...booking,
                bookingId: booking.bookingId || booking.stadium_booking_id || booking.id || `booking-${index}`,
                userId: booking.userId || booking.user_id,
                locationId: booking.locationId || booking.location_id,
                dateOfBooking: booking.dateOfBooking || booking.date_of_booking,
                startTime: booking.startTime || booking.start_time,
                endTime: booking.endTime || booking.end_time,
                status: booking.status || '',
                price: booking.price || booking.totalPrice || 0,
                dateCreated: booking.dateCreated || booking.date_created || booking.createdAt || new Date().toISOString()
              };
            });
            
            // Sắp xếp đặt sân theo ngày tạo mới nhất
            processedBookings.sort((a, b) => {
              // Ưu tiên sắp xếp theo ngày đặt sân
              const dateA = new Date(a.dateOfBooking );
              const dateB = new Date(b.dateOfBooking );
              return dateB - dateA;
            });
            
            setBookingHistory(processedBookings);
          } else {
            setBookingHistory([]);
          }
        } catch (error) {
          setBookingHistory([]);
        }
      };
      
      fetchBookingHistory();
      
      // Lấy lịch sử hóa đơn của người dùng
      const fetchBillHistory = async () => {
        try {
          const response = await billAPI.getCurrentUserBills();
          
          if (response && response.data) {
            let bills = [];
            if (response.data.result) {
              bills = response.data.result;
            } else {
              bills = Array.isArray(response.data) ? response.data : [response.data];
            }
            
            const processedBills = bills.map((bill, index) => {
              return {
                ...bill,
                billId: bill.billId || bill.bill_id || `bill-${index}`,
                stadiumBookingId: bill.stadiumBookingId || bill.stadium_booking_id,
                paymentMethodId: bill.paymentMethodId || bill.payment_method_id || 1,
                userId: bill.userId || bill.user_id,
                finalPrice: bill.finalPrice || bill.final_price || 0,
                status: bill.status || '',
                dateCreated: bill.dateCreated || bill.date_created,
                datePaid: bill.datePaid || bill.date_paid
              };
            });
            
            // Sắp xếp hóa đơn theo ngày tạo mới nhất
            processedBills.sort((a, b) => {
              const dateA = new Date(a.dateCreated || 0);
              const dateB = new Date(b.dateCreated || 0);
              return dateB - dateA;
            });
            
            setBillHistory(processedBills);
          } else {
            setBillHistory([]);
          }
        } catch (error) {
          setBillHistory([]);
        }
      };
      
      fetchBillHistory();
    } else {
      setBookingHistory([]);
      setBillHistory([]);
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
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setUpdateError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }
    
    setLoading(true);
    setUpdateError(null);
    
    const updateData = {
      email: userData.email,
      firstname: formData.firstname,
      lastname: formData.lastname,
      phone: formData.phone,
      password: formData.password 
    };
    
    if (formData.day_of_birth && formData.day_of_birth.trim() !== '') {
      try {
        const dateObj = new Date(formData.day_of_birth);
        const formattedDate = dateObj.toISOString().split('T')[0];
        updateData.day_of_birth = formattedDate;
      } catch (error) {
        updateData.day_of_birth = formData.day_of_birth.trim();
      }
    }
    
    userAPI.updateUser(userData.user_id, updateData)
      .then(response => {
        setUpdateSuccess(true);
        setUpdateError(null);
        setEditMode(false);
        refreshUserData();
      })
      .catch(error => {
        if (error.response) {
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
                  
                  <button 
                    className={`menu-item ${activeTab === 'bills' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('bills')}
                  >
                    <i className="fas fa-file-invoice-dollar"></i>
                    <span>Hóa đơn</span>
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
                      {bookingHistory
                        .slice((currentBookingPage - 1) * bookingsPerPage, currentBookingPage * bookingsPerPage)
                        .map((booking, index) => {
                        const bookingId = booking.bookingId || booking.id || booking.stadium_booking_id || `booking-${index}`;
                        const locationId = booking.locationId || booking.location_id;
                        
                        let locationData = { locationName: 'Đang tải...' };
                        let fullAddress = 'Đang tải địa chỉ...';
                        
                        if (locations && locationId && locations[locationId]) {
                          const matchedLocation = locations[locationId];
                          
                          if (matchedLocation) {
                            locationData = matchedLocation;
                            
                            // Tạo địa chỉ đầy đủ
                            const addressParts = [];
                            if (matchedLocation.address) addressParts.push(matchedLocation.address);
                            if (matchedLocation.ward) addressParts.push(matchedLocation.ward);
                            if (matchedLocation.district) addressParts.push(matchedLocation.district);
                            if (matchedLocation.city) addressParts.push(matchedLocation.city);
                            if (matchedLocation.province) addressParts.push(matchedLocation.province);
                            
                            fullAddress = addressParts.join(', ');
                          }
                        }
                        
                        return (
                          <div key={`booking-${index}`} className={`booking-card ${booking.status && booking.status.toLowerCase()}`}>
                            <div className="booking-header">
                              <div className="booking-id">Mã đặt sân: #{bookingId}</div>
                              <div className={`booking-status ${(booking.status || 'pending').toLowerCase().replace(/\s+/g, '')}`}>
                                {bookingStatuses[booking.status] || booking.status || 'Chờ xác nhận'}
                              </div>
                            </div>
                            
                            <div className="booking-body">
                              <div className="booking-detail">
                                <i className="fas fa-database"></i>
                                <span>Stadium Booking ID: {booking.stadium_booking_id || bookingId}</span>
                              </div>
                              
                              <div className="booking-detail">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>Sân: {locationData.locationName || locationData.name || ''}</span>
                              </div>
                              
                              <div className="booking-detail">
                                <i className="fas fa-map"></i>
                                <span>Địa chỉ: {fullAddress}</span>
                              </div>
                              
                              <div className="booking-detail">
                                <i className="far fa-calendar-alt"></i>
                                <span>Ngày: {formatDate(booking.dateOfBooking || booking.date_of_booking)}</span>
                              </div>
                              
                              <div className="booking-detail">
                                <i className="far fa-clock"></i>
                                <span>Thời gian: {booking.startTime || booking.start_time} - {booking.endTime || booking.end_time}</span>
                              </div>
                            </div>
                            
                            <div className="booking-actions">
                              <Link to={`/booking/${bookingId}`} className="view-detail-button">
                                <i className="fas fa-info-circle"></i> Xem chi tiết
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Phân trang cho booking */}
                      {bookingHistory.length > bookingsPerPage && (
                        <div className="pagination">
                          <button 
                            onClick={() => setCurrentBookingPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentBookingPage === 1}
                            className="pagination-button"
                          >
                            <i className="fas fa-chevron-left"></i> Trang trước
                          </button>
                          
                          <span className="pagination-info">
                            Trang {currentBookingPage} / {Math.ceil(bookingHistory.length / bookingsPerPage)}
                          </span>
                          
                          <button 
                            onClick={() => setCurrentBookingPage(prev => Math.min(prev + 1, Math.ceil(bookingHistory.length / bookingsPerPage)))}
                            disabled={currentBookingPage === Math.ceil(bookingHistory.length / bookingsPerPage)}
                            className="pagination-button"
                          >
                            Trang sau <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      )}
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
              
              {activeTab === 'bills' && (
                <div className="bills-tab">
                  <div className="tab-header">
                    <h2>Lịch sử hóa đơn</h2>
                  </div>
                  
                  {billHistory.length > 0 ? (
                    <div className="bill-list">
                      {billHistory
                        .slice((currentBillPage - 1) * billsPerPage, currentBillPage * billsPerPage)
                        .map((bill, index) => {
                        const billId = bill.bill_id || bill.billId || `bill-${index}`;
                        
                        return (
                          <div key={`bill-${index}`} className="bill-card">
                            <div className="bill-header">
                              <div className="bill-id">Mã hóa đơn: #{billId}</div>
                              <div className={`bill-status ${(bill.status || 'unpaid').toLowerCase().replace(/\s+/g, '')}`}>
                                {billStatuses[bill.status] || bill.status}
                              </div>
                            </div>
                            
                            <div className="bill-body">
                              <div className="bill-detail">
                                <i className="fas fa-receipt"></i>
                                <span><strong>Mã hóa đơn:</strong> {billId}</span>
                              </div>
                              
                              <div className="bill-detail">
                                <i className="fas fa-bookmark"></i>
                                <span>Mã đặt sân: {bill.stadium_booking_id || bill.stadiumBookingId || ''}</span>
                              </div>
                              
                              <div className="bill-detail">
                                <i className="fas fa-calendar-check"></i>
                                <span>Ngày tạo: {formatDateTime(bill.date_created || bill.dateCreated) || ''}</span>
                              </div>
                              
                              <div className="bill-detail">
                                <i className="fas fa-calendar-alt"></i>
                                <span>Ngày thanh toán: {bill.status === 'PAID' || bill.status === 'paid' ? formatDateTime(bill.date_paid || bill.datePaid) : 'Chưa thanh toán'}</span>
                              </div>
                              
                              <div className="bill-detail">
                                <i className="fas fa-credit-card"></i>
                                <span>Phương thức: {paymentMethods[bill.payment_method_id || bill.paymentMethodId] || ''}</span>
                              </div>
                              
                              <div className="bill-detail">
                                <i className="fas fa-money-bill-wave"></i>
                                <span>Tổng tiền: {(bill.final_price || bill.finalPrice || 0).toLocaleString()} VNĐ</span>
                              </div>
                            </div>
                            
                            <div className="bill-actions">
                              {(bill.stadium_booking_id || bill.stadiumBookingId) && (
                                <Link to={`/booking/${bill.stadium_booking_id || bill.stadiumBookingId}`} className="view-detail-button">
                                  <i className="fas fa-eye"></i> Xem đặt sân
                                </Link>
                              )}
                              {(bill.status === 'UNPAID' || bill.status === 'unpaid' || !bill.status) && (
                                <button className="pay-now-button">
                                  <i className="fas fa-credit-card"></i> Thanh toán
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Phân trang cho bills */}
                      {billHistory.length > billsPerPage && (
                        <div className="pagination">
                          <button 
                            onClick={() => setCurrentBillPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentBillPage === 1}
                            className="pagination-button"
                          >
                            <i className="fas fa-chevron-left"></i> Trang trước
                          </button>
                          
                          <span className="pagination-info">
                            Trang {currentBillPage} / {Math.ceil(billHistory.length / billsPerPage)}
                          </span>
                          
                          <button 
                            onClick={() => setCurrentBillPage(prev => Math.min(prev + 1, Math.ceil(billHistory.length / billsPerPage)))}
                            disabled={currentBillPage === Math.ceil(billHistory.length / billsPerPage)}
                            className="pagination-button"
                          >
                            Trang sau <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-bills">
                      <i className="far fa-file-alt"></i>
                      <p>Bạn chưa có hóa đơn nào.</p>
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