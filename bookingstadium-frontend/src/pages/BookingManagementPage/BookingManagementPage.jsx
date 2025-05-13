import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { bookingAPI, stadiumAPI, locationAPI } from '../../services/apiService';
import '../BookingManagementPage/BookingManagementPage.css';

const BookingManagementPage = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Trạng thái lọc
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy tất cả đơn đặt sân
        const bookingsResponse = await bookingAPI.getBookings();
        if (bookingsResponse.data && bookingsResponse.data.result) {
          // Nếu người dùng là admin, lấy tất cả đơn đặt
          // Nếu không phải admin, chỉ lấy đơn đặt của người dùng đó
          let userBookings = bookingsResponse.data.result;
          if (currentUser.role && currentUser.role.roleId !== 'ADMIN') {
            userBookings = userBookings.filter(booking => booking.userId === currentUser.user_id);
          }
          setBookings(userBookings);
        }
        
        // Lấy tất cả sân bóng để hiển thị tên
        const stadiumsResponse = await stadiumAPI.getStadiums();
        if (stadiumsResponse.data && stadiumsResponse.data.result) {
          setStadiums(stadiumsResponse.data.result);
        }
        
        // Lấy tất cả địa điểm để hiển thị tên
        const locationsResponse = await locationAPI.getLocations();
        if (locationsResponse.data && locationsResponse.data.result) {
          setLocations(locationsResponse.data.result);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, currentUser, navigate]);

  // Lọc đơn đặt sân theo trạng thái
  const getFilteredBookings = () => {
    let filtered = [...bookings];
    
    // Lọc theo trạng thái
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getStadiumName(getStadiumByLocationId(booking.locationId)).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Lấy tên sân bóng từ locationId
  const getStadiumByLocationId = (locationId) => {
    return stadiums.find(stadium => stadium.locationId === locationId) || null;
  };
  
  // Lấy tên sân bóng
  const getStadiumName = (stadium) => {
    return stadium ? stadium.stadiumName : 'Sân không xác định';
  };
  
  // Lấy tên địa điểm
  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.locationId === locationId);
    return location ? location.locationName : 'Địa điểm không xác định';
  };
  
  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  // Format giờ
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };
  
  // Xử lý xác nhận đặt sân (chỉ dành cho admin hoặc chủ sân)
  const handleConfirmBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      
      await bookingAPI.updateBooking(bookingId, {
        status: 'CONFIRMED'
      });
      
      // Cập nhật lại danh sách đơn đặt sân
      setBookings(bookings.map(booking => 
        booking.bookingId === bookingId 
          ? { ...booking, status: 'CONFIRMED' } 
          : booking
      ));
      
      setSuccess('Xác nhận đơn đặt sân thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Lỗi khi xác nhận đơn đặt sân:', error);
      setError('Không thể xác nhận đơn đặt sân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý hủy đặt sân
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await bookingAPI.updateBooking(bookingId, {
        status: 'CANCELLED'
      });
      
      // Cập nhật lại danh sách đơn đặt sân
      setBookings(bookings.map(booking => 
        booking.bookingId === bookingId 
          ? { ...booking, status: 'CANCELLED' } 
          : booking
      ));
      
      setSuccess('Hủy đơn đặt sân thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Lỗi khi hủy đơn đặt sân:', error);
      setError('Không thể hủy đơn đặt sân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Xử lý lọc theo trạng thái
  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  return (
    <div className="booking-management-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h1 className="page-title">Quản lý lịch đặt sân</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>
      
      <div className="booking-management-content">
        <div className="container">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}
          
          <div className="booking-management-tools">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm đơn đặt sân..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <button className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </div>
            
            <div className="filter-buttons">
              <button
                className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                Tất cả
              </button>
              <button
                className={`filter-button ${filterStatus === 'PENDING' ? 'active' : ''}`}
                onClick={() => handleFilterChange('PENDING')}
              >
                Chờ xác nhận
              </button>
              <button
                className={`filter-button ${filterStatus === 'CONFIRMED' ? 'active' : ''}`}
                onClick={() => handleFilterChange('CONFIRMED')}
              >
                Đã xác nhận
              </button>
              <button
                className={`filter-button ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
                onClick={() => handleFilterChange('COMPLETED')}
              >
                Đã hoàn thành
              </button>
              <button
                className={`filter-button ${filterStatus === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => handleFilterChange('CANCELLED')}
              >
                Đã hủy
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : getFilteredBookings().length === 0 ? (
            <div className="no-bookings">
              <i className="fas fa-calendar-times"></i>
              <p>Không tìm thấy đơn đặt sân nào.</p>
            </div>
          ) : (
            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Sân</th>
                    <th>Địa điểm</th>
                    <th>Ngày đặt</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredBookings().map(booking => {
                    const stadium = getStadiumByLocationId(booking.locationId);
                    return (
                      <tr key={booking.bookingId}>
                        <td>{booking.bookingId}</td>
                        <td>{getStadiumName(stadium)}</td>
                        <td>{getLocationName(booking.locationId)}</td>
                        <td>{formatDate(booking.dateOfBooking)}</td>
                        <td>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</td>
                        <td>
                          <span className={`status-badge ${booking.status.toLowerCase()}`}>
                            {booking.status === 'PENDING' ? 'Chờ xác nhận' :
                             booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                             booking.status === 'COMPLETED' ? 'Đã hoàn thành' :
                             booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <Link to={`/booking/${booking.bookingId}`} className="view-button" title="Xem chi tiết">
                            <i className="fas fa-eye"></i>
                          </Link>
                          
                          {booking.status === 'PENDING' && currentUser.role && currentUser.role.roleId === 'ADMIN' && (
                            <button 
                              className="confirm-button" 
                              onClick={() => handleConfirmBooking(booking.bookingId)}
                              title="Xác nhận"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <button 
                              className="cancel-button" 
                              onClick={() => handleCancelBooking(booking.bookingId)}
                              title="Hủy đơn"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingManagementPage;