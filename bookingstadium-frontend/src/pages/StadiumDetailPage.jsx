import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext';
import { stadiumAPI, locationAPI, typeAPI, bookingAPI } from '../services/apiService';
import '../pages/StadiumDetailPage.css';

const StadiumDetailPage = () => {
  const { stadiumId } = useParams();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  const [stadium, setStadium] = useState(null);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Booking form data
  const [bookingData, setBookingData] = useState({
    userId: currentUser?.user_id || '',
    dateOfBooking: '',
    startTime: '',
    endTime: '',
    numberOfBookings: 1
  });
  
  // Đặt availableTimeSlots vào state thay vì khai báo trực tiếp
  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    { id: '1', time: '08:00 - 10:00', available: true },
    { id: '2', time: '10:00 - 12:00', available: true },
    { id: '3', time: '12:00 - 14:00', available: false },
    { id: '4', time: '14:00 - 16:00', available: true },
    { id: '5', time: '16:00 - 18:00', available: true },
    { id: '6', time: '18:00 - 20:00', available: false },
    { id: '7', time: '20:00 - 22:00', available: true }
  ]);
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  useEffect(() => {
    const fetchStadiumDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // This is a placeholder. In a real implementation,
        // you would have an API endpoint to get stadium details by ID
        const response = await stadiumAPI.getStadiumById(stadiumId);
        
        if (response.data && response.data.result) {
          const stadiumData = response.data.result;
          setStadium(stadiumData);
          
          // Fetch location details
          if (stadiumData.locationId) {
            const locationResponse = await locationAPI.getLocationById(stadiumData.locationId);
            if (locationResponse.data && locationResponse.data.result) {
              setLocation(locationResponse.data.result);
            }
          }
          
          // Fetch type details
          if (stadiumData.typeId) {
            const typeResponse = await typeAPI.getTypeById(stadiumData.typeId);
            if (typeResponse.data && typeResponse.data.result) {
              setType(typeResponse.data.result);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching stadium details:', error);
        setError('Failed to load stadium details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (stadiumId) {
      fetchStadiumDetails();
    }
  }, [stadiumId]);
  
  useEffect(() => {
    // Update userId in bookingData when currentUser changes
    if (currentUser) {
      setBookingData(prev => ({
        ...prev,
        userId: currentUser.user_id
      }));
    }
  }, [currentUser]);
  
  const handleDateChange = (e) => {
    setBookingData(prev => ({
      ...prev,
      dateOfBooking: e.target.value
    }));
    
    // Giả lập lấy time slots khả dụng cho ngày được chọn
    // sẽ gọi API để lấy dữ liệu này
    const newSlots = [
      { id: '1', time: '08:00 - 10:00', available: Math.random() > 0.3 },
      { id: '2', time: '10:00 - 12:00', available: Math.random() > 0.3 },
      { id: '3', time: '12:00 - 14:00', available: Math.random() > 0.3 },
      { id: '4', time: '14:00 - 16:00', available: Math.random() > 0.3 },
      { id: '5', time: '16:00 - 18:00', available: Math.random() > 0.3 },
      { id: '6', time: '18:00 - 20:00', available: Math.random() > 0.3 },
      { id: '7', time: '20:00 - 22:00', available: Math.random() > 0.3 }
    ];
    setAvailableTimeSlots(newSlots);
  };
  
  const handleTimeSlotSelect = (slot) => {
    if (!slot.available) return;
    
    setSelectedTimeSlot(slot.id);
    
    // Parse start and end times from the slot
    const [startTime, endTime] = slot.time.split(' - ');
    
    setBookingData(prev => ({
      ...prev,
      startTime: startTime,
      endTime: endTime
    }));
  };
  
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setBookingError('Please log in to book a stadium.');
      return;
    }
    
    if (!bookingData.dateOfBooking) {
      setBookingError('Please select a date.');
      return;
    }
    
    if (!selectedTimeSlot) {
      setBookingError('Please select a time slot.');
      return;
    }
    
    try {
      setBookingError(null);
      
      const response = await bookingAPI.createBooking({
        userId: bookingData.userId,
        dateOfBooking: bookingData.dateOfBooking,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        numberOfBookings: bookingData.numberOfBookings
      });
      
      if (response.data && response.data.result) {
        setBookingSuccess(true);
        
        // Reset form
        setSelectedTimeSlot(null);
        setBookingData({
          userId: currentUser?.user_id || '',
          dateOfBooking: '',
          startTime: '',
          endTime: '',
          numberOfBookings: 1
        });
      }
    } catch (error) {
      console.error('Error booking stadium:', error);
      setBookingError('Failed to book stadium. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="stadium-detail-page">
        <Navbar />
        <div className="container">
          <div className="loading">Loading stadium details...</div>
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
            <i className="fas fa-arrow-left"></i> Back to Stadium List
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
          <div className="error-message">Stadium not found.</div>
          <Link to="/danh-sach-san" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Stadium List
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

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
                <div className="stadium-type">{type ? type.typeName : 'Unknown Type'}</div>
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
                    <span>{location ? location.address : 'Unknown Location'}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-futbol"></i>
                    <span>{type ? type.typeName : 'Unknown Type'}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-tag"></i>
                    <span>{stadium.price?.toLocaleString() || 0} VNĐ/giờ</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-check-circle"></i>
                    <span className={`status ${stadium.status?.toLowerCase() || ''}`}>
                      {stadium.status === 'AVAILABLE' ? 'Còn trống' : 
                       stadium.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đã đặt'}
                    </span>
                  </div>
                </div>
                
                <div className="stadium-description">
                  <h3>Mô tả</h3>
                  <p>{stadium.description || 'Không có mô tả cho sân bóng này.'}</p>
                </div>
                
                <div className="stadium-location">
                  <h3>Địa chỉ</h3>
                  <p>{location ? `${location.address}, ${location.district}, ${location.city}` : 'Unknown Location'}</p>
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
                    <p>Đặt sân thành công! Vui lòng kiểm tra email để xác nhận thông tin.</p>
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
                    />
                  </div>
                  
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
                      <span>{stadium.price?.toLocaleString() || 0} VNĐ</span>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="booking-button"
                    disabled={!isAuthenticated || !bookingData.dateOfBooking || !selectedTimeSlot || stadium.status !== 'AVAILABLE'}
                  >
                    {!isAuthenticated ? 'Vui lòng đăng nhập để đặt sân' : 'Đặt sân ngay'}
                  </button>
                  
                  {!isAuthenticated && (
                    <div className="login-prompt">
                      <p>Vui lòng 
                        <button 
                            className="login-link" 
                            onClick={() => document.querySelector('.navbar-action-button').click()}
                        >
                            đăng nhập
                        </button> để đặt sân.</p>
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