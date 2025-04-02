import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext';
import { stadiumAPI, locationAPI, typeAPI, bookingAPI, stadiumBookingDetailAPI } from '../services/apiService';
import '../pages/StadiumDetailPage.css';

const StadiumDetailPage = () => {
  const { stadiumId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  const [stadium, setStadium] = useState(null);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Booking form data
  const [bookingData, setBookingData] = useState({
    userId: currentUser?.user_id || '',
    locationId: '',
    dateOfBooking: '',
    startTime: '',
    endTime: '',
  });
  
  // Thời gian có sẵn
  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    { id: '1', time: '08:00 - 10:00', available: true, start: '08:00:00', end: '10:00:00' },
    { id: '2', time: '10:00 - 12:00', available: true, start: '10:00:00', end: '12:00:00' },
    { id: '3', time: '12:00 - 14:00', available: true, start: '12:00:00', end: '14:00:00' },
    { id: '4', time: '14:00 - 16:00', available: true, start: '14:00:00', end: '16:00:00' },
    { id: '5', time: '16:00 - 18:00', available: true, start: '16:00:00', end: '18:00:00' },
    { id: '6', time: '18:00 - 20:00', available: true, start: '18:00:00', end: '20:00:00' },
    { id: '7', time: '20:00 - 22:00', available: true, start: '20:00:00', end: '22:00:00' }
  ]);
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  useEffect(() => {
    const fetchStadiumDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy thông tin sân bóng
        const response = await stadiumAPI.getStadiumById(stadiumId);
        
        if (response.data && response.data.result) {
          const stadiumData = response.data.result;
          setStadium(stadiumData);
          
          // Cập nhật locationId trong bookingData
          setBookingData(prev => ({
            ...prev,
            locationId: stadiumData.locationId
          }));
          
          // Lấy thông tin địa điểm
          if (stadiumData.locationId) {
            const locationResponse = await locationAPI.getLocationById(stadiumData.locationId);
            if (locationResponse.data && locationResponse.data.result) {
              setLocation(locationResponse.data.result);
            }
          }
          
          // Lấy thông tin loại sân
          if (stadiumData.typeId) {
            try {
              const typeResponse = await typeAPI.getTypeById(stadiumData.typeId);
              if (typeResponse.data && typeResponse.data.result) {
                setType(typeResponse.data.result);
              }
            } catch (typeError) {
              console.error('Error fetching type details:', typeError);
            }
          }
        } else {
          setError('Không tìm thấy thông tin sân bóng.');
        }
      } catch (error) {
        console.error('Error fetching stadium details:', error);
        setError('Không thể tải thông tin sân bóng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (stadiumId) {
      fetchStadiumDetails();
    }
  }, [stadiumId]);
  
  useEffect(() => {
    // Cập nhật userId trong bookingData khi currentUser thay đổi
    if (currentUser) {
      setBookingData(prev => ({
        ...prev,
        userId: currentUser.user_id
      }));
    }
  }, [currentUser]);
  
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setBookingData(prev => ({
      ...prev,
      dateOfBooking: selectedDate
    }));
    
    // Lấy time slots khả dụng cho ngày được chọn
    // Trong dự án thực tế, sẽ gọi API để lấy các time slots chưa được đặt
    // Ở đây sẽ mô phỏng bằng cách random
    const newSlots = availableTimeSlots.map(slot => ({
      ...slot,
      available: Math.random() > 0.3
    }));
    setAvailableTimeSlots(newSlots);
    
    // Reset time slot đã chọn khi thay đổi ngày
    setSelectedTimeSlot(null);
  };
  
  const handleTimeSlotSelect = (slot) => {
    if (!slot.available) return;
    
    setSelectedTimeSlot(slot.id);
    
    setBookingData(prev => ({
      ...prev,
      startTime: slot.start,
      endTime: slot.end
    }));
  };
  
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setBookingError('Vui lòng đăng nhập để đặt sân.');
      return;
    }
    
    if (!bookingData.dateOfBooking) {
      setBookingError('Vui lòng chọn ngày.');
      return;
    }
    
    if (!selectedTimeSlot) {
      setBookingError('Vui lòng chọn khung giờ.');
      return;
    }
    
    try {
      setBookingError(null);
      
      // Tạo đặt sân mới
      const bookingResponse = await bookingAPI.createBooking({
        userId: bookingData.userId,
        locationId: bookingData.locationId,
        dateOfBooking: bookingData.dateOfBooking,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      });
      
      if (bookingResponse.data && bookingResponse.data.result) {
        // Lấy booking ID từ response
        const newBookingId = bookingResponse.data.result.bookingId || bookingResponse.data.result.stadium_booking_id;
        
        // Tạo chi tiết đặt sân
        await stadiumBookingDetailAPI.createStadiumBookingDetail({
          stadium_booking_id: newBookingId,
          type_id: stadium.typeId,
          stadium_id: stadium.stadiumId
        });
        
        setBookingSuccess(true);
        
        // Reset form
        setSelectedTimeSlot(null);
        setBookingData({
          userId: currentUser?.user_id || '',
          locationId: stadium.locationId,
          dateOfBooking: '',
          startTime: '',
          endTime: ''
        });
        
        // Chuyển hướng đến trang chi tiết đặt sân sau 2 giây
        setTimeout(() => {
          navigate(`/booking/${newBookingId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error booking stadium:', error);
      setBookingError('Đặt sân thất bại. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <div className="stadium-detail-page">
        <Navbar />
        <div className="container">
          <div className="loading">Đang tải thông tin sân bóng...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="stadium-detail-page">
        <Navbar />
        <div className="container">
          <div className="error-message">{error}</div>
          <Link to="/danh-sach-san" className="back-button">
            <i className="fas fa-arrow-left"></i> Quay lại danh sách sân
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="stadium-detail-page">
        <Navbar />
        <div className="container">
          <div className="error-message">Không tìm thấy sân bóng.</div>
          <Link to="/danh-sach-san" className="back-button">
            <i className="fas fa-arrow-left"></i> Quay lại danh sách sân
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Hàm tính tổng giá khi đặt sân
  const calculateTotalPrice = () => {
    if (!stadium || !selectedTimeSlot) return 0;
    
    const selectedSlot = availableTimeSlots.find(slot => slot.id === selectedTimeSlot);
    if (!selectedSlot) return 0;
    
    // Phân tích giờ để tính số giờ thuê
    const startHour = parseInt(selectedSlot.start.split(':')[0]);
    const endHour = parseInt(selectedSlot.end.split(':')[0]);
    const hours = endHour - startHour;
    
    return stadium.price * hours;
  };

  return (
    <div className="stadium-detail-page">
      <Navbar />
      
      <div className="stadium-detail-container">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span className="separator">/</span>
            <Link to="/danh-sach-san">Danh sách sân</Link>
            <span className="separator">/</span>
            <span className="current">{stadium.stadiumName}</span>
          </div>
          
          <div className="stadium-detail-content">
            <div className="stadium-images">
              <div className="main-image">
                <img src="/stadium-placeholder.jpg" alt={stadium.stadiumName} />
                <div className="stadium-type">{type ? type.typeName : 'Không xác định'}</div>
              </div>
              <div className="thumbnail-images">
                <img src="/stadium-thumb1.jpg" alt="Thumbnail 1" className="thumbnail" />
                <img src="/stadium-thumb2.jpg" alt="Thumbnail 2" className="thumbnail" />
                <img src="/stadium-thumb3.jpg" alt="Thumbnail 3" className="thumbnail" />
              </div>
            </div>
            
            <div className="stadium-info-booking">
              <div className="stadium-info">
                <h1 className="stadium-name">{stadium.stadiumName}</h1>
                
                <div className="stadium-meta">
                  <div className="meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{location ? location.address : 'Không có thông tin địa chỉ'}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-futbol"></i>
                    <span>{type ? type.typeName : 'Không xác định'}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-tag"></i>
                    <span>{stadium.price?.toLocaleString() || 0} VNĐ/giờ</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-check-circle"></i>
                    <span className={`status ${stadium.status?.toLowerCase() || 'available'}`}>
                      {stadium.status === 'AVAILABLE' ? 'Còn trống' : 
                       stadium.status === 'MAINTENANCE' ? 'Bảo trì' : 
                       stadium.status === 'BOOKED' ? 'Đã đặt' : 'Còn trống'}
                    </span>
                  </div>
                </div>
                
                <div className="stadium-description">
                  <h3>Mô tả</h3>
                  <p>{stadium.description || 'Không có mô tả cho sân bóng này.'}</p>
                </div>
                
                <div className="stadium-location">
                  <h3>Địa chỉ</h3>
                  <p>
                    {location ? (
                      `${location.address}, ${location.district || ''}, ${location.city || ''}`
                    ) : 'Không có thông tin địa chỉ'}
                  </p>
                  {/* Placeholder for map */}
                  <div className="map-placeholder">
                    <img src="/map-placeholder.jpg" alt="Map" />
                  </div>
                </div>
              </div>
              
              <div className="booking-section">
                <h3>Đặt sân</h3>
                
                {bookingSuccess && (
                  <div className="booking-success">
                    <i className="fas fa-check-circle"></i>
                    <p>Đặt sân thành công! Đang chuyển hướng đến trang chi tiết đặt sân...</p>
                  </div>
                )}
                
                {bookingError && (
                  <div className="booking-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{bookingError}</p>
                  </div>
                )}
                
                <form onSubmit={handleBookingSubmit} className="booking-form">
                  <div className="form-group">
                    <label>Chọn ngày:</label>
                    <input 
                      type="date" 
                      value={bookingData.dateOfBooking}
                      onChange={handleDateChange}
                      className="form-control"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  {bookingData.dateOfBooking && (
                    <div className="form-group">
                      <label>Chọn khung giờ:</label>
                      <div className="time-slots">
                        {availableTimeSlots.map(slot => (
                          <div 
                            key={slot.id}
                            className={`time-slot ${!slot.available ? 'unavailable' : ''} ${selectedTimeSlot === slot.id ? 'selected' : ''}`}
                            onClick={() => handleTimeSlotSelect(slot)}
                          >
                            {slot.time}
                            {!slot.available && <span className="unavailable-label">Đã đặt</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="booking-summary">
                    <h4>Thông tin đặt sân</h4>
                    <div className="summary-item">
                      <span>Sân:</span>
                      <span>{stadium.stadiumName}</span>
                    </div>
                    {bookingData.dateOfBooking && (
                      <div className="summary-item">
                        <span>Ngày:</span>
                        <span>{new Date(bookingData.dateOfBooking).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedTimeSlot && (
                      <div className="summary-item">
                        <span>Giờ:</span>
                        <span>{availableTimeSlots.find(slot => slot.id === selectedTimeSlot)?.time}</span>
                      </div>
                    )}
                    <div className="summary-item total">
                      <span>Tổng tiền:</span>
                      <span>{calculateTotalPrice().toLocaleString()} VNĐ</span>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="booking-button"
                    disabled={!isAuthenticated || !bookingData.dateOfBooking || !selectedTimeSlot || stadium.status === 'MAINTENANCE' || stadium.status === 'BOOKED' || bookingSuccess}
                  >
                    {!isAuthenticated ? 'Vui lòng đăng nhập để đặt sân' : 'Đặt sân ngay'}
                  </button>
                  
                  {!isAuthenticated && (
                    <div className="login-prompt">
                      <p>Vui lòng <a href="#" onClick={(e) => {
                        e.preventDefault();
                        document.querySelector('.navbar-action-button').click();
                      }}>đăng nhập</a> để đặt sân.</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StadiumDetailPage;