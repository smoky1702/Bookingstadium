import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '.././context/AuthContext';
import { locationAPI, stadiumAPI, workScheduleAPI } from '../../services/apiService';
import '../OwnerHomePage/OwnerHomePage.css';

const OwnerHomePage = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userLocations, setUserLocations] = useState([]);
  const [userStadiums, setUserStadiums] = useState([]);
  const [statistics, setStatistics] = useState({
    totalLocations: 0,
    totalStadiums: 0,
    availableStadiums: 0,
    maintenanceStadiums: 0,
    bookedStadiums: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Lấy danh sách địa điểm của người dùng
        const locationsResponse = await locationAPI.getLocations();
        if (locationsResponse.data && locationsResponse.data.result) {
          // Lọc ra các địa điểm của người dùng hiện tại
          const userLocs = locationsResponse.data.result.filter(loc => 
            loc.userId === currentUser.user_id
          );
          setUserLocations(userLocs);
          
          // Cập nhật số liệu thống kê
          setStatistics(prev => ({
            ...prev,
            totalLocations: userLocs.length
          }));
          
          // Lấy danh sách sân bóng
          const stadiumsResponse = await stadiumAPI.getStadiums();
          if (stadiumsResponse.data && stadiumsResponse.data.result) {
            // Lọc ra các sân thuộc địa điểm của người dùng hiện tại
            const locationIds = userLocs.map(loc => loc.locationId);
            const userStads = stadiumsResponse.data.result.filter(stad => 
              locationIds.includes(stad.locationId)
            );
            setUserStadiums(userStads);
            
            // Cập nhật số liệu thống kê
            const availableCount = userStads.filter(stad => stad.status === 'AVAILABLE').length;
            const maintenanceCount = userStads.filter(stad => stad.status === 'MAINTENANCE').length;
            const bookedCount = userStads.filter(stad => stad.status === 'BOOKED').length;
            
            setStatistics(prev => ({
              ...prev,
              totalStadiums: userStads.length,
              availableStadiums: availableCount,
              maintenanceStadiums: maintenanceCount,
              bookedStadiums: bookedCount
            }));
          }
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

  return (
    <div className="owner-home-page">
      <Navbar />
      
      <div className="owner-home-container">
        <div className="container">
          <div className="owner-home-header">
            <h1>Quản lý chủ sân</h1>
            <p>Xin chào, {currentUser?.firstname || 'Chủ sân'}! Quản lý sân bóng của bạn tại đây.</p>
          </div>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}
          
          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="owner-home-content">
              {/* Thống kê */}
              <div className="statistics-section">
                <div className="statistics-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{statistics.totalLocations}</div>
                      <div className="stat-label">Địa điểm</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-futbol"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{statistics.totalStadiums}</div>
                      <div className="stat-label">Sân bóng</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon green">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{statistics.availableStadiums}</div>
                      <div className="stat-label">Sân trống</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon yellow">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{statistics.bookedStadiums}</div>
                      <div className="stat-label">Sân đã đặt</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon red">
                      <i className="fas fa-tools"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{statistics.maintenanceStadiums}</div>
                      <div className="stat-label">Sân bảo trì</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Các địa điểm của bạn */}
              <div className="section locations-section">
                <div className="section-header">
                  <h2>Địa điểm của bạn</h2>
                  <Link to="/quan-ly-san" className="view-all-button">
                    Quản lý <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                
                {userLocations.length > 0 ? (
                  <div className="locations-grid">
                    {userLocations.map(location => (
                      <div key={location.locationId} className="location-card">
                        <div className="location-image">
                          <img src="/location-placeholder.jpg" alt={location.locationName} />
                        </div>
                        <div className="location-info">
                          <h3>{location.locationName}</h3>
                          <p className="location-address">
                            <i className="fas fa-map-marker-alt"></i>
                            {location.address}, {location.district}, {location.city}
                          </p>
                          <div className="stadiums-count">
                            <i className="fas fa-futbol"></i>
                            {userStadiums.filter(s => s.locationId === location.locationId).length} sân bóng
                          </div>
                          <div className="location-actions">
                            <Link to={`/quan-ly-san?locationId=${location.locationId}`} className="location-button">
                              Quản lý sân
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="add-location-card">
                      <Link to="/quan-ly-san?tab=add-location" className="add-button">
                        <i className="fas fa-plus"></i>
                        <span>Thêm địa điểm mới</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <h3>Bạn chưa có địa điểm nào</h3>
                    <p>Bắt đầu bằng cách thêm địa điểm đầu tiên của bạn</p>
                    <Link to="/quan-ly-san?tab=add-location" className="add-first-button">
                      Thêm địa điểm <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Sân bóng của bạn */}
              {userLocations.length > 0 && (
                <div className="section stadiums-section">
                  <div className="section-header">
                    <h2>Sân bóng của bạn</h2>
                    <Link to="/quan-ly-san?tab=stadiums" className="view-all-button">
                      Xem tất cả <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                  
                  {userStadiums.length > 0 ? (
                    <div className="stadiums-grid">
                      {userStadiums.slice(0, 4).map(stadium => {
                        // Tìm thông tin location
                        const location = userLocations.find(loc => loc.locationId === stadium.locationId);
                        return (
                          <div key={stadium.stadiumId} className="stadium-card">
                            <div className="stadium-header">
                              <div className="stadium-name">{stadium.stadiumName}</div>
                              <div className={`stadium-status ${stadium.status.toLowerCase()}`}>
                                {stadium.status === 'AVAILABLE' ? 'Còn trống' : 
                                 stadium.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đã đặt'}
                              </div>
                            </div>
                            <div className="stadium-location">
                              <i className="fas fa-map-marker-alt"></i> {location ? location.locationName : 'Không rõ địa điểm'}
                            </div>
                            <div className="stadium-price">
                              <i className="fas fa-tag"></i> {stadium.price.toLocaleString()} VNĐ/giờ
                            </div>
                            <div className="stadium-actions">
                              <Link to={`/san/${stadium.stadiumId}`} className="view-stadium-button">
                                <i className="fas fa-eye"></i> Xem
                              </Link>
                              <Link to={`/quan-ly-san?editStadium=${stadium.stadiumId}`} className="edit-stadium-button">
                                <i className="fas fa-edit"></i> Sửa
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                      
                      {userStadiums.length < 4 && (
                        <div className="add-stadium-card">
                          <Link to="/quan-ly-san?tab=add-stadium" className="add-button">
                            <i className="fas fa-plus"></i>
                            <span>Thêm sân bóng mới</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <i className="fas fa-futbol"></i>
                      </div>
                      <h3>Bạn chưa có sân bóng nào</h3>
                      <p>Hãy thêm sân bóng cho địa điểm của bạn</p>
                      <Link to="/quan-ly-san?tab=add-stadium" className="add-first-button">
                        Thêm sân bóng <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* Các liên kết hữu ích */}
              <div className="section useful-links-section">
                <div className="section-header">
                  <h2>Liên kết hữu ích</h2>
                </div>
                
                <div className="useful-links-grid">
                  <div className="useful-link-card">
                    <div className="link-icon">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div className="link-content">
                      <h3>Lịch đặt sân</h3>
                      <p>Xem lịch đặt sân của khách hàng</p>
                      <Link to="/lich-dat-san" className="link-button">
                        Xem lịch
                      </Link>
                    </div>
                  </div>
                  
                  <div className="useful-link-card">
                    <div className="link-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="link-content">
                      <h3>Lịch làm việc</h3>
                      <p>Quản lý lịch làm việc của sân bóng</p>
                      <Link to="/lich-lam-viec" className="link-button">
                        Cài đặt
                      </Link>
                    </div>
                  </div>
                  
                  <div className="useful-link-card">
                    <div className="link-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="link-content">
                      <h3>Thống kê</h3>
                      <p>Xem thống kê doanh thu</p>
                      <Link to="/thong-ke" className="link-button">
                        Xem thống kê
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OwnerHomePage;