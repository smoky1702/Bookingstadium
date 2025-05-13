import React, { useState, useEffect } from 'react';
import { userAPI, stadiumAPI, locationAPI, typeAPI, bookingAPI } from '../services/apiService';
import '../Admin/AdminPanel.css';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [locations, setLocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Lấy dữ liệu khi component được tạo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy tất cả người dùng
        try {
          const usersResponse = await userAPI.getAllUsers();
          if (usersResponse.data && usersResponse.data.result) {
            setUsers(usersResponse.data.result);
          }
        } catch (error) {
          console.error('Lỗi khi lấy danh sách người dùng:', error);
          setUsers([]);
        }

        // Lấy tất cả sân bóng
        try {
          const stadiumsResponse = await stadiumAPI.getStadiums();
          if (stadiumsResponse.data && stadiumsResponse.data.result) {
            setStadiums(stadiumsResponse.data.result);
          }
        } catch (error) {
          console.error('Lỗi khi lấy danh sách sân bóng:', error);
          setStadiums([]);
        }

        // Lấy tất cả địa điểm
        try {
          const locationsResponse = await locationAPI.getLocations();
          if (locationsResponse.data && locationsResponse.data.result) {
            setLocations(locationsResponse.data.result);
          }
        } catch (error) {
          console.error('Lỗi khi lấy danh sách địa điểm:', error);
          setLocations([]);
        }

        // Lấy tất cả đơn đặt sân
        try {
          const bookingsResponse = await bookingAPI.getAllBookings();
          if (bookingsResponse.data && bookingsResponse.data.result) {
            setBookings(bookingsResponse.data.result);
          }
        } catch (error) {
          console.error('Lỗi khi lấy đơn đặt sân:', error);
          setBookings([]);
        }

      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu admin:', error);
        setError('Không thể tải dữ liệu quản trị. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý xóa người dùng
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);
      setUsers(users.filter(user => user.user_id !== userId));
      setSuccessMessage('Xóa người dùng thành công!');
      
      // Xóa thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Không thể xóa người dùng. Vui lòng thử lại.');
      console.error('Lỗi khi xóa người dùng:', error);
    }
  };

  // Xử lý xóa sân bóng
  const handleDeleteStadium = async (stadiumId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sân bóng này?')) {
      return;
    }

    try {
      await stadiumAPI.deleteStadium(stadiumId);
      setStadiums(stadiums.filter(stadium => stadium.stadiumId !== stadiumId));
      setSuccessMessage('Xóa sân bóng thành công!');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Không thể xóa sân bóng. Vui lòng thử lại.');
      console.error('Lỗi khi xóa sân bóng:', error);
    }
  };

  // Xử lý xóa địa điểm
  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
      return;
    }

    try {
      await locationAPI.deleteLocation(locationId);
      setLocations(locations.filter(location => location.locationId !== locationId));
      setSuccessMessage('Xóa địa điểm thành công!');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Không thể xóa địa điểm. Vui lòng thử lại.');
      console.error('Lỗi khi xóa địa điểm:', error);
    }
  };

  // Xử lý cập nhật trạng thái đặt sân
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, { status: newStatus });
      
      setBookings(bookings.map(booking => {
        if (booking.bookingId === bookingId) {
          return { ...booking, status: newStatus };
        }
        return booking;
      }));
      
      setSuccessMessage(`Cập nhật trạng thái đặt sân thành ${newStatus}!`);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Không thể cập nhật trạng thái đặt sân. Vui lòng thử lại.');
      console.error('Lỗi khi cập nhật trạng thái đặt sân:', error);
    }
  };

  // Hàm lấy tên địa điểm theo ID
  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.locationId === locationId);
    return location ? location.locationName : 'Địa điểm không xác định';
  };

  // Phần Dashboard
  const renderDashboard = () => {
    return (
      <div className="admin-dashboard">
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <div className="stat-info">
              <h3>{users.length}</h3>
              <p>Tổng người dùng</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-futbol"></i>
            <div className="stat-info">
              <h3>{stadiums.length}</h3>
              <p>Sân bóng</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-map-marker-alt"></i>
            <div className="stat-info">
              <h3>{locations.length}</h3>
              <p>Địa điểm</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-calendar-check"></i>
            <div className="stat-info">
              <h3>{bookings.length}</h3>
              <p>Đơn đặt sân</p>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Đơn đặt sân gần đây</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đặt sân</th>
                <th>Người dùng</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map(booking => (
                <tr key={booking.bookingId}>
                  <td>{booking.bookingId}</td>
                  <td>{booking.userId}</td>
                  <td>{new Date(booking.dateOfBooking).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>
                      {booking.status === 'PENDING' ? 'Chờ xác nhận' :
                       booking.status === 'CONFIRMED' ? 'Đã xác nhận' : 
                       booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-data">Không tìm thấy đơn đặt sân nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Phần quản lý người dùng
  const renderUsers = () => {
    return (
      <div className="admin-users">
        <h3>Quản lý người dùng</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.firstname} {user.lastname}</td>
                <td>{user.email}</td>
                <td>{user.role?.roleName === 'ADMIN' ? 'Quản trị viên' : 
                     user.role?.roleName === 'MANAGER' ? 'Quản lý sân' : 'Người dùng'}</td>
                <td className="action-buttons">
                  <button 
                    className="edit-button"
                    onClick={() => {/* Xử lý chỉnh sửa */}}
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteUser(user.user_id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="no-data">Không tìm thấy người dùng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Phần quản lý sân bóng
  const renderStadiums = () => {
    return (
      <div className="admin-stadiums">
        <h3>Quản lý sân bóng</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sân</th>
              <th>Địa điểm</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stadiums.map(stadium => (
              <tr key={stadium.stadiumId}>
                <td>{stadium.stadiumId}</td>
                <td>{stadium.stadiumName}</td>
                <td>{getLocationName(stadium.locationId)}</td>
                <td>{stadium.price.toLocaleString()} VNĐ</td>
                <td>
                  <span className={`status-badge ${stadium.status.toLowerCase()}`}>
                    {stadium.status === 'AVAILABLE' ? 'Khả dụng' :
                     stadium.status === 'MAINTENANCE' ? 'Bảo trì' :
                     stadium.status === 'BOOKED' ? 'Đã đặt' : stadium.status}
                  </span>
                </td>
                <td className="action-buttons">
                  <button 
                    className="edit-button"
                    onClick={() => {/* Xử lý chỉnh sửa */}}
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteStadium(stadium.stadiumId)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {stadiums.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">Không tìm thấy sân bóng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Phần quản lý đặt sân
  const renderBookings = () => {
    return (
      <div className="admin-bookings">
        <h3>Quản lý đặt sân</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đặt sân</th>
              <th>Người dùng</th>
              <th>Ngày đặt</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.bookingId}>
                <td>{booking.bookingId}</td>
                <td>{booking.userId}</td>
                <td>{new Date(booking.dateOfBooking).toLocaleDateString()}</td>
                <td>{booking.startTime}</td>
                <td>{booking.endTime}</td>
                <td>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>
                    {booking.status === 'PENDING' ? 'Chờ xác nhận' :
                     booking.status === 'CONFIRMED' ? 'Đã xác nhận' : 
                     booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
                  </span>
                </td>
                <td className="action-buttons">
                  {booking.status === 'PENDING' && (
                    <>
                      <button 
                        className="confirm-button"
                        onClick={() => handleUpdateBookingStatus(booking.bookingId, 'CONFIRMED')}
                        title="Xác nhận"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => handleUpdateBookingStatus(booking.bookingId, 'CANCELLED')}
                        title="Hủy"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  )}
                  <button 
                    className="view-button"
                    onClick={() => {/* Xử lý xem chi tiết */}}
                    title="Xem chi tiết"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">Không tìm thấy đơn đặt sân nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Phần quản lý địa điểm
  const renderLocations = () => {
    return (
      <div className="admin-locations">
        <h3>Quản lý địa điểm</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên địa điểm</th>
              <th>Địa chỉ</th>
              <th>Quận/Huyện</th>
              <th>Thành phố</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(location => (
              <tr key={location.locationId}>
                <td>{location.locationId}</td>
                <td>{location.locationName}</td>
                <td>{location.address}</td>
                <td>{location.district}</td>
                <td>{location.city}</td>
                <td className="action-buttons">
                  <button 
                    className="edit-button"
                    onClick={() => {/* Xử lý chỉnh sửa */}}
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteLocation(location.locationId)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">Không tìm thấy địa điểm nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <span>{successMessage}</span>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
      
      <div className="admin-header">
        <h2>Quản trị hệ thống</h2>
      </div>
      
      <div className="admin-content">
        <div className="admin-sidebar">
          <button 
            className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Tổng quan</span>
          </button>
          <button 
            className={`admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <i className="fas fa-users"></i>
            <span>Người dùng</span>
          </button>
          <button 
            className={`admin-nav-item ${activeSection === 'stadiums' ? 'active' : ''}`}
            onClick={() => setActiveSection('stadiums')}
          >
            <i className="fas fa-futbol"></i>
            <span>Sân bóng</span>
          </button>
          <button 
            className={`admin-nav-item ${activeSection === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveSection('locations')}
          >
            <i className="fas fa-map-marker-alt"></i>
            <span>Địa điểm</span>
          </button>
          <button 
            className={`admin-nav-item ${activeSection === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveSection('bookings')}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Đặt sân</span>
          </button>
        </div>
        
        <div className="admin-main">
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              {activeSection === 'dashboard' && renderDashboard()}
              {activeSection === 'users' && renderUsers()}
              {activeSection === 'stadiums' && renderStadiums()}
              {activeSection === 'locations' && renderLocations()}
              {activeSection === 'bookings' && renderBookings()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;