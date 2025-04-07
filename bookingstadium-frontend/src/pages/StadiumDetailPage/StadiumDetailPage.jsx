import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faTag, faMoneyBillWave, faCheckCircle, 
         faTimesCircle, faFutbol, faCalendarAlt, faUser, faCommentAlt,
         faArrowLeft, faLocationArrow, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { stadiumAPI, locationAPI, typeAPI, imageAPI, bookingAPI, stadiumBookingDetailAPI, evaluationAPI, userAPI } from '../../services/apiService';
import '../StadiumDetailPage/StadiumDetailPage.css';

const StadiumDetailPage = () => {
  const { stadiumId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  const [stadium, setStadium] = useState(null);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stadiumImage, setStadiumImage] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [evaluationUsers, setEvaluationUsers] = useState({});
  
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
  
  // Form đánh giá
  const [evaluationForm, setEvaluationForm] = useState({
    content: '',
    rating: 5,
  });
  const [evaluationError, setEvaluationError] = useState(null);
  const [evaluationSuccess, setEvaluationSuccess] = useState(false);
  
  useEffect(() => {
    const fetchStadiumDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Lấy thông tin sân
        const stadiumResponse = await stadiumAPI.getStadiumById(stadiumId);
        const stadiumData = stadiumResponse.data?.result || stadiumResponse.data;
        if (!stadiumData) {
          throw new Error("Không thể lấy thông tin sân");
        }
        setStadium(stadiumData);
        
        // 2. Lấy thông tin địa điểm
        if (stadiumData.locationId) {
          try {
            const locationResponse = await locationAPI.getLocationById(stadiumData.locationId);
            const locationData = locationResponse.data?.result || locationResponse.data;
            if (locationData) {
              setLocation(locationData);
            }
          } catch (locationError) {
            console.error("Lỗi khi lấy thông tin địa điểm:", locationError);
            // Thử API thay thế
            try {
              const altLocationResponse = await locationAPI.getLocationByIdAlternative(stadiumData.locationId);
              const locationData = altLocationResponse.data?.result || altLocationResponse.data;
              if (locationData) {
                setLocation(locationData);
              }
            } catch (altLocationError) {
              console.error("Lỗi khi lấy thông tin địa điểm từ API thay thế:", altLocationError);
            }
          }
        }

        // 3. Lấy thông tin loại sân
        if (stadiumData.typeId) {
          try {
            const typeResponse = await typeAPI.getTypeById(stadiumData.typeId);
            const typeData = typeResponse.data?.result || typeResponse.data;
            if (typeData) {
              setType(typeData);
            }
          } catch (typeError) {
            console.error("Lỗi khi lấy thông tin loại sân:", typeError);
            // Thử API thay thế
            try {
              const altTypeResponse = await typeAPI.getTypesAlternative();
              const types = altTypeResponse.data?.result || altTypeResponse.data;
              if (Array.isArray(types)) {
                const matchedType = types.find(t => t.id === stadiumData.typeId);
                if (matchedType) {
                  setType(matchedType);
                }
              }
            } catch (altTypeError) {
              console.error("Lỗi khi lấy thông tin loại sân từ API thay thế:", altTypeError);
            }
          }
        }

        // 4. Lấy hình ảnh
        try {
          const imagesResponse = await imageAPI.getImagesByStadiumId(stadiumId);
          const images = imagesResponse.data?.result || imagesResponse.data;
          if (Array.isArray(images) && images.length > 0) {
            setStadiumImage(images[0]);
          }
        } catch (imageError) {
          console.error("Lỗi khi lấy hình ảnh sân:", imageError);
        }

        // 5. Lấy đánh giá
        try {
          const evaluationsResponse = await evaluationAPI.getEvaluationsByStadiumId(stadiumId);
          const evaluations = evaluationsResponse.data?.result || evaluationsResponse.data;
          if (Array.isArray(evaluations)) {
            setEvaluations(evaluations);
            
            // Lấy thông tin người dùng cho mỗi đánh giá
            const userIds = [...new Set(evaluations.map(e => e.userId))];
            const userDataMap = {};
            
            for (const userId of userIds) {
              try {
                const userResponse = await userAPI.getUserById(userId);
                const userData = userResponse.data?.result || userResponse.data;
                if (userData) {
                  userDataMap[userId] = userData;
                }
              } catch (userError) {
                console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, userError);
              }
            }
            
            setEvaluationUsers(userDataMap);
          }
        } catch (evaluationError) {
          console.error("Lỗi khi lấy đánh giá:", evaluationError);
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin chi tiết sân:", error);
        setError("Có lỗi xảy ra khi tải thông tin sân. Vui lòng thử lại sau.");
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

  // Hàm xử lý khi thay đổi rating
  const handleRatingChange = (rating) => {
    setEvaluationForm(prev => ({
      ...prev,
      rating
    }));
  };
  
  // Hàm xử lý khi thay đổi nội dung đánh giá
  const handleEvaluationContentChange = (e) => {
    setEvaluationForm(prev => ({
      ...prev,
      content: e.target.value
    }));
  };
  
  // Hàm xử lý khi submit đánh giá
  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setEvaluationError('Vui lòng đăng nhập để đánh giá.');
      return;
    }
    
    if (!evaluationForm.content.trim()) {
      setEvaluationError('Vui lòng nhập nội dung đánh giá.');
      return;
    }
    
    try {
      setEvaluationError(null);
      
      // Tạo đánh giá mới
      const evaluationResponse = await evaluationAPI.createEvaluation({
        userId: currentUser.user_id,
        stadiumId: stadiumId,
        content: evaluationForm.content,
        rating: evaluationForm.rating
      });
      
      if (evaluationResponse.data && evaluationResponse.data.result) {
        setEvaluationSuccess(true);
        
        // Thêm đánh giá mới vào danh sách
        const newEvaluation = evaluationResponse.data.result;
        setEvaluations(prev => [newEvaluation, ...prev]);
        
        // Reset form đánh giá
        setEvaluationForm({
          content: '',
          rating: 5
        });
        
        // Sau 3 giây, ẩn thông báo thành công
        setTimeout(() => {
          setEvaluationSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating evaluation:', error);
      setEvaluationError('Đánh giá thất bại. Vui lòng thử lại sau.');
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
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sân
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
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sân
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

  // Hàm tính rating trung bình
  const calculateAverageRating = () => {
    if (!evaluations || evaluations.length === 0) return 0;
    
    const validRatings = evaluations
      .map(e => getEvaluationRating(e))
      .filter(r => r > 0);
    
    if (validRatings.length === 0) return 0;
    
    const sum = validRatings.reduce((total, rating) => total + rating, 0);
    return (sum / validRatings.length).toFixed(1);
  };

  // Format ngày theo định dạng Việt Nam
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Tạo UI cho rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={faStar} 
          className={i <= rating ? 'star filled' : 'star empty'} 
        />
      );
    }
    return stars;
  };

  // Lấy URL hình ảnh sân
  const getStadiumImageUrl = () => {
    if (stadiumImage && stadiumImage.imageUrl) {
      return `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'}${stadiumImage.imageUrl}`;
    }
    return '/stadium-placeholder.jpg';
  };

  // Hàm lấy địa chỉ đầy đủ
  const getFullAddress = () => {
    if (!location) return "Đang cập nhật địa chỉ...";
    
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.district) parts.push(location.district);
    if (location.city) parts.push(location.city);
    if (location.province) parts.push(location.province);
    
    return parts.join(", ") || "Chưa có thông tin địa chỉ";
  };

  // Lấy tên người dùng đầy đủ
  const getUserFullName = (userId) => {
    const user = evaluationUsers[userId];
    if (!user) return 'Người dùng';
    
    const firstName = user.firstname || user.firstName || '';
    const lastName = user.lastname || user.lastName || '';
    const fullName = user.fullName || '';
    const username = user.username || '';
    
    if (fullName) return fullName;
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    if (username) return username;
    
    return 'Người dùng';
  };

  // Lấy giá trị đánh giá (rating)
  const getEvaluationRating = (evaluation) => {
    if (!evaluation) return 0;
    
    const rating = evaluation.rating || 
                  evaluation.ratingScore || 
                  evaluation.ratingValue || 
                  evaluation.score || 
                  evaluation.value || 
                  0;
    
    return Number(rating) || 0;
  };

  // Lấy nội dung đánh giá
  const getEvaluationContent = (evaluation) => {
    console.log('Evaluation data:', evaluation);  // Log để debug nội dung đánh giá
    
    // Hỗ trợ tất cả các định dạng trường có thể có từ API
    const content = evaluation.content || 
                   evaluation.evaluationContent || 
                   evaluation.comment || 
                   evaluation.text || 
                   evaluation.description || 
                   evaluation.message;
    
    // Nếu có phần data.data, kiểm tra xem có nội dung trong đó không
    if (evaluation.data && typeof evaluation.data === 'object') {
      const dataContent = evaluation.data.content || 
                         evaluation.data.evaluationContent || 
                         evaluation.data.comment || 
                         evaluation.data.text;
      if (dataContent) return dataContent;
    }
    
    // In toàn bộ các key của evaluation để debug
    console.log('Evaluation keys:', Object.keys(evaluation));
    
    // Trường hợp là chuỗi trực tiếp
    if (typeof evaluation === 'string') return evaluation;
    
    // Trả về nội dung nếu có, hoặc chuỗi rỗng nếu không có
    return content || '';
  };

  // Lấy ID người dùng từ đánh giá
  const getUserId = (evaluation) => {
    return evaluation.userId || evaluation.user_id;
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
            <div className="stadium-header">
              <h1 className="stadium-title">{stadium.stadiumName}</h1>
              <div className="stadium-rating">
                {renderRatingStars(calculateAverageRating())}
                <span className="rating-value">{calculateAverageRating()}</span>
                <span className="reviews-count">({evaluations.length} đánh giá)</span>
              </div>
              <div className="stadium-location-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                <span className="full-address">{getFullAddress()}</span>
              </div>
            </div>
            
            <div className="stadium-gallery">
              <div className="main-image">
                <img 
                  src={getStadiumImageUrl()} 
                  alt={stadium.stadiumName} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/stadium-placeholder.jpg';
                  }}
                />
                <div className="stadium-type">{type ? type.typeName : 'Không xác định'}</div>
              </div>
            </div>
            
            <div className="stadium-info-booking">
              <div className="stadium-info">
                <div className="stadium-meta">
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="meta-icon" />
                    <span className="full-address">{getFullAddress()}</span>
                  </div>
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faFutbol} className="meta-icon" />
                    <span>{type ? (type.typeName || type.name || 'Không xác định') : 'Không xác định'}</span>
                  </div>
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="meta-icon" />
                    <span>{stadium.price?.toLocaleString() || 0} VNĐ/giờ</span>
                  </div>
                  <div className="meta-item">
                    <FontAwesomeIcon icon={stadium.status === 'AVAILABLE' ? faCheckCircle : faTimesCircle} className="meta-icon" />
                    <span className={`status ${stadium.status?.toLowerCase() || 'available'}`}>
                      {stadium.status === 'AVAILABLE' ? 'Còn trống' : 
                       stadium.status === 'MAINTENANCE' ? 'Bảo trì' : 
                       stadium.status === 'BOOKED' ? 'Đã đặt' : 'Còn trống'}
                    </span>
                  </div>
                </div>
                
                <div className="stadium-description">
                  <h3>Giới thiệu sân</h3>
                  <p>{stadium.description || 'Không có mô tả cho sân bóng này.'}</p>
                </div>
                
                <div className="stadium-evaluations">
                  <h3>Đánh giá từ người dùng</h3>
                  
                  {isAuthenticated && (
                    <div className="evaluation-form-container">
                      <h4>Viết đánh giá của bạn</h4>
                      
                      {evaluationSuccess && (
                        <div className="evaluation-success">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          <p>Đánh giá của bạn đã được gửi thành công!</p>
                        </div>
                      )}
                      
                      {evaluationError && (
                        <div className="evaluation-error">
                          <FontAwesomeIcon icon={faTimesCircle} />
                          <p>{evaluationError}</p>
                        </div>
                      )}
                      
                      <form onSubmit={handleEvaluationSubmit} className="evaluation-form">
                        <div className="rating-selector">
                          <span>Đánh giá của bạn: </span>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                              <FontAwesomeIcon 
                                key={star}
                                icon={faStar} 
                                className={star <= evaluationForm.rating ? 'star filled clickable' : 'star empty clickable'} 
                                onClick={() => handleRatingChange(star)}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <textarea 
                          placeholder="Chia sẻ trải nghiệm của bạn..."
                          value={evaluationForm.content}
                          onChange={handleEvaluationContentChange}
                          className="evaluation-content"
                          rows={4}
                        />
                        
                        <button type="submit" className="submit-evaluation">
                          Gửi đánh giá
                        </button>
                      </form>
                    </div>
                  )}
                  
                  {!isAuthenticated && (
                    <div className="login-prompt">
                      <p>Vui lòng <a href="#" onClick={(e) => {
                        e.preventDefault();
                        // Sửa để mở modal đăng nhập thay vì đăng ký
                        document.querySelectorAll('.navbar-action-button')[1].click();
                      }}>đăng nhập</a> để viết đánh giá.</p>
                    </div>
                  )}
                  
                  <div className="evaluations-list">
                    {evaluations.length === 0 ? (
                      <p className="no-evaluations">Chưa có đánh giá nào cho sân này.</p>
                    ) : (
                      evaluations.map((evaluation, index) => (
                        <div key={evaluation.evaluationId || evaluation.id || index} className="evaluation-item">
                          <div className="evaluation-header">
                            <div className="user-name-field">
                              <FontAwesomeIcon icon={faUser} className="user-icon" />
                              <span className="user-name">
                                {getUserFullName(getUserId(evaluation))}
                              </span>
                            </div>
                            <div className="evaluation-rating">
                              {renderRatingStars(getEvaluationRating(evaluation))}
                            </div>
                          </div>
                          <div className="evaluation-content">
                            {getEvaluationContent(evaluation) ? (
                              <p>{getEvaluationContent(evaluation)}</p>
                            ) : null}
                          </div>
                          <div className="evaluation-date">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>{formatDate(evaluation.dateCreated || evaluation.date_created)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="booking-section">
                <h3>Đặt sân</h3>
                
                {bookingSuccess && (
                  <div className="booking-success">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <p>Đặt sân thành công! Đang chuyển hướng đến trang chi tiết đặt sân...</p>
                  </div>
                )}
                
                {bookingError && (
                  <div className="booking-error">
                    <FontAwesomeIcon icon={faTimesCircle} />
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