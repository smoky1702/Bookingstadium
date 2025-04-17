import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { bookingAPI, stadiumBookingDetailAPI, stadiumAPI, locationAPI, typeAPI, evaluationAPI, imageAPI } from '../../services/apiService';
import '../BookingDetailPage/BookingDetailPage.css';

const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  const [booking, setBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [stadium, setStadium] = useState(null);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadingState, setLoadingState] = useState({
    booking: true,
    bookingDetail: false,
    stadium: false,
    location: false
  });
  const [retrying, setRetrying] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  
  // Hàm tiện ích
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const dateValue = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
      
      if (isNaN(dateValue.getTime())) {
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          const [year, month, day] = dateString.split('-');
          return `${day}/${month}/${year}`;
        }
        return dateString || '';
      }
      
      return dateValue.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (error) {
      return dateString || '';
    }
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
      }
    return timeString;
    } catch (error) {
    return timeString;
    }
  };
  
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  
  const getStatusText = (status) => {
    if (!status) return 'Không xác định';
    
    const statusUpper = status.toUpperCase();
    switch(statusUpper) {
      case 'PENDING': return 'CHỜ XÁC NHẬN';
      case 'CONFIRMED': return 'ĐÃ XÁC NHẬN';
      case 'CANCELLED': return 'ĐÃ HỦY';
      default: return statusUpper;
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [bookingId, isAuthenticated, currentUser, navigate, retrying]);
  
  useEffect(() => {
    if (location) {
      setLoadingState(prev => ({...prev, location: false}));
    }
  }, [location]);

  useEffect(() => {
    if (stadium) {
      setLoadingState(prev => ({...prev, stadium: false}));
    }
  }, [stadium]);
  
  useEffect(() => {
    if (bookingDetail) {
      setLoadingState(prev => ({...prev, bookingDetail: false}));
    }
  }, [bookingDetail]);
  
  // Hàm fetch dữ liệu
    const fetchData = async () => {
      if (!isAuthenticated || !bookingId) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
      setLoadingState({
        booking: true,
        bookingDetail: false,
        stadium: false,
        location: false
      });
        
      // 1. Lấy thông tin booking
      const bookingResponse = await bookingAPI.getBookingById(bookingId);
      const bookingData = bookingResponse.data?.result || bookingResponse.data;
        
        if (!bookingData) {
          throw new Error('Không tìm thấy dữ liệu booking');
        }
        
      // Chuẩn hóa dữ liệu booking
        const normalizedBooking = {
          ...bookingData,
        id: bookingData.id || bookingId,
        bookingId: bookingData.bookingId || bookingData.id || bookingId,
          dateOfBooking: bookingData.dateOfBooking || bookingData.date_of_booking || bookingData.booking_date,
          startTime: bookingData.startTime || bookingData.start_time,
          endTime: bookingData.endTime || bookingData.end_time,
        status: bookingData.status || bookingData.booking_status || bookingData.bookingStatus || bookingData.stadium_booking_status,
          dateCreated: bookingData.dateCreated || bookingData.date_created || bookingData.created_at || bookingData.createdAt
        };
          
      // Kiểm tra quyền xem booking
        if (normalizedBooking.userId !== currentUser.user_id && normalizedBooking.user_id !== currentUser.user_id) {
            setError('Bạn không có quyền xem thông tin đặt sân này.');
            setLoading(false);
            return;
          }
        
        setBooking(normalizedBooking);
        setLoadingState(prev => ({...prev, booking: false, bookingDetail: true}));
          
      // Cập nhật progress
      updateProgressBasedOnStatus(normalizedBooking.status);
    
      // 2. Lấy booking detail
      try {
        const detailResponse = await stadiumBookingDetailAPI.getStadiumBookingDetailByBookingId(bookingId);
        const detailData = detailResponse.data?.result;
        
        if (detailData) {
          setBookingDetail(detailData);
          
          // Lấy stadium_id từ booking detail
          const detailStadiumId = detailData.stadiumId || detailData.stadium_id;
          
          // Lấy thông tin loại sân nếu có typeId
          const typeId = detailData.typeId || detailData.type_id;
          if (typeId) {
            try {
              const typeResponse = await typeAPI.getTypeById(typeId);
              if (typeResponse.data?.result) {
                setType(typeResponse.data.result);
              }
            } catch (typeError) {
              // Xử lý lỗi im lặng
            }
          }
          
          if (detailStadiumId) {
            // Nếu có stadium_id từ detail, ưu tiên dùng
            await fetchStadiumData(detailStadiumId);
          }
        } else {
          setError('Không thể lấy thông tin chi tiết đặt sân từ hệ thống.');
          setLoadingState(prev => ({...prev, bookingDetail: false}));
          setLoading(false);
          return;
          }
        } catch (detailError) {
        setError('Không thể lấy thông tin chi tiết đặt sân. Vui lòng thử lại sau.');
        setLoadingState(prev => ({...prev, bookingDetail: false}));
        setLoading(false);
        return;
      }
      
      setLoadingState(prev => ({...prev, bookingDetail: false, stadium: true}));
      
      } catch (error) {
        setError('Không thể tải thông tin đặt sân. Vui lòng thử lại sau.');
      setLoadingState({
        booking: false,
        bookingDetail: false,
        stadium: false,
        location: false
      });
      } finally {
        setLoading(false);
      }
    };
    
  // Tách hàm fetchStadiumData
  const fetchStadiumData = async (stadiumId) => {
    if (!stadiumId) {
      setLoadingState(prev => ({...prev, stadium: false}));
        return;
      }
      
    try {
      const stadiumResponse = await stadiumAPI.getStadiumById(stadiumId);
      if (stadiumResponse.data?.result) {
        const stadiumData = stadiumResponse.data.result;
        
        // Chuẩn hóa stadium data
        const normalizedStadium = {
          ...stadiumData,
          stadiumId: stadiumData.stadiumId || stadiumData.stadium_id,
          stadiumName: stadiumData.stadiumName || stadiumData.stadium_name,
          locationId: stadiumData.locationId || stadiumData.location_id,
          price: stadiumData.price || 0
        };
        
        setStadium(normalizedStadium);
        
        // Lấy hình ảnh sân
        await fetchStadiumImage(stadiumId);
          
          // Lấy thông tin địa điểm
        if (normalizedStadium.locationId) {
          await fetchLocationData(normalizedStadium.locationId);
        } else {
          setLoadingState(prev => ({...prev, stadium: false, location: false}));
        }
      } else {
        setLoadingState(prev => ({...prev, stadium: false, location: false}));
        }
    } catch (error) {
      setLoadingState(prev => ({...prev, stadium: false, location: false}));
    }
  };
  
  // Hàm cập nhật progress bar
  const updateProgressBasedOnStatus = (status) => {
    if (status === 'PENDING') {
      setProgressPercent(33);
    } else if (status === 'CONFIRMED') {
      setProgressPercent(66);
    } else if (status === 'CANCELLED') {
      setProgressPercent(0);
    }
  };
  
  // Hàm tính tổng giờ từ startTime và endTime
  const calculateTotalHours = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    
    try {
      // Chuyển đổi thành phút
      const getMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const startMinutes = getMinutes(startTime);
      const endMinutes = getMinutes(endTime);
      
      // Tính số phút và chuyển thành giờ
      const diffMinutes = endMinutes - startMinutes;
      return (diffMinutes / 60).toFixed(2);
      } catch (error) {
      return null;
    }
  };
  
  // Tách riêng hàm lấy hình ảnh sân
  const fetchStadiumImage = async (stadiumId) => {
    if (!stadiumId) return;
    
    try {
      // Thử lấy hình ảnh theo ID sân
      const imagesResponse = await imageAPI.getImagesByStadiumId(stadiumId);
      
      if (imagesResponse.data && imagesResponse.data.result && imagesResponse.data.result.length > 0) {
        // Có hình ảnh từ API, sử dụng hình ảnh đầu tiên
        const firstImage = imagesResponse.data.result[0];
        
        // Xử lý các trường hợp khác nhau của URL hình ảnh
        let imageUrl;
        if (firstImage.imageUrl) {
          imageUrl = firstImage.imageUrl;
        } else if (firstImage.image_url) {
          imageUrl = firstImage.image_url;
        } else if (firstImage.url) {
          imageUrl = firstImage.url;
        } else if (firstImage.image_data) {
          // Nếu có dữ liệu base64
          imageUrl = `data:image/jpeg;base64,${firstImage.image_data}`;
        }
        
        if (imageUrl) {
          // Kiểm tra nếu URL không có http/https, thêm tiền tố
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
            imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }
          
          // Cập nhật URL hình ảnh vào state stadium
        setStadium(prev => ({
          ...prev,
          imageUrl: imageUrl
        }));
          return;
        }
      }
    } catch (error) {
      // Xử lý lỗi im lặng
    }
  };
  
  // Tách riêng hàm lấy thông tin địa điểm
  const fetchLocationData = async (locationId) => {
    if (!locationId) {
      setLoadingState(prev => ({...prev, location: false}));
      return;
    }
    
    try {
      const locationResponse = await locationAPI.getLocationById(locationId);
      
      if (locationResponse.data && locationResponse.data.result) {
        const locationData = locationResponse.data.result;
        
        // Chuẩn hóa dữ liệu địa điểm
        const normalizedLocation = {
          ...locationData,
          locationId: locationData.locationId || locationData.location_id,
          locationName: locationData.locationName || locationData.location_name,
          address: locationData.address,
          district: locationData.district || locationData.district_name,
          city: locationData.city || locationData.city_name
        };
        
        setLocation(normalizedLocation);
      }
      
      // Hoàn thành quá trình lấy thông tin địa điểm
      setLoadingState(prev => ({...prev, location: false}));
    } catch (locationError) {
      setLoadingState(prev => ({...prev, location: false}));
    }
  };
  
  // Xử lý thanh toán
  const handlePayment = async () => {
    alert('Chức năng thanh toán sẽ được cập nhật sau!');
  };
  
  // Xử lý hủy đặt sân
  const handleCancelBooking = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt sân này không?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Sửa đổi object gửi đi với các trường cần thiết, bao gồm cả định dạng snake_case
      const response = await bookingAPI.updateBooking(bookingId, {
        status: 'CANCELLED',
        date_of_booking: booking.dateOfBooking,
        start_time: booking.startTime,
        end_time: booking.endTime
      });
      
      if (response.data && response.data.result) {
        setBooking({
          ...booking,
          status: 'CANCELLED'
        });
        
        setProgressPercent(0);
        setSuccess('Hủy đặt sân thành công.');
      } else {
        setError('Không thể hủy đặt sân. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error("Lỗi khi hủy đặt sân:", error);
      setError('Không thể hủy đặt sân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Modal đánh giá
  const openFeedbackModal = () => {
    setShowFeedbackModal(true);
  };
  
  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setRating(0);
    setComment('');
  };
  
  const handleRatingClick = (value) => {
    setRating(value);
  };
  
  // Xử lý gửi đánh giá
  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá.');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!location) {
        alert('Không tìm thấy thông tin địa điểm để đánh giá.');
        return;
      }
      
      const response = await evaluationAPI.createEvaluation({
        user_id: currentUser.user_id,
        location_id: location.locationId,
        rating_score: rating,
        comment: comment
      });
      
      if (response.data && response.data.result) {
        setSuccess('Gửi đánh giá thành công!');
        closeFeedbackModal();
      } else {
        setError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
      }
    } catch (error) {
      setError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Tính tổng tiền
  const calculateTotalPrice = () => {
    // Lấy từ bookingDetail nếu có
    if (bookingDetail && (bookingDetail.price || bookingDetail.price === 0)) {
      return bookingDetail.price;
    }
    
    // Tính toán dựa trên giá sân và số giờ
    if (stadium && stadium.price) {
      const hours = calculateTotalHours();
      if (hours !== null) {
        return stadium.price * hours;
      }
    }
    
    return null;
  };
  
  // Kiểm tra xem có thể hủy đặt sân không
  const canCancelBooking = () => {
    if (!booking || booking.status !== 'PENDING') {
      return false;
    }
    
    // Lấy ngày hiện tại
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Chuyển đổi dateOfBooking từ string sang Date object
    const bookingDate = new Date(booking.dateOfBooking);
    bookingDate.setHours(0, 0, 0, 0);
    
    // Cho phép hủy nếu ngày đặt sân là ngày hiện tại hoặc trong tương lai
    return bookingDate >= currentDate;
  };
  
  // Kiểm tra xem có thể đánh giá không
  const canLeaveFeedback = () => {
    return booking && 
           booking.status === 'CONFIRMED' &&
           new Date(booking.dateOfBooking) < new Date();
  };
  
  return (
    <div className="booking-detail-page">
      <Navbar />
      
      <div className="booking-detail-content">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span className="separator">/</span>
            <Link to="/profile">Tài khoản</Link>
            <span className="separator">/</span>
            <span className="current">Chi tiết đặt sân</span>
          </div>
          
          {loading && !booking ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Đang tải dữ liệu booking...</p>
            </div>
          ) : (loadingState.bookingDetail || loadingState.stadium || loadingState.location) && (!bookingDetail || !stadium || (loadingState.location && !location)) ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>
                Đang tải {loadingState.bookingDetail ? 'chi tiết đặt sân' : 
                          loadingState.stadium ? 'thông tin sân' :
                          loadingState.location ? 'thông tin địa điểm' : 'dữ liệu'}...
              </p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-message">{error}</div>
              <button 
                className="retry-button" 
                onClick={() => setRetrying(prev => !prev)}
                disabled={loading}
              >
                {loading ? 'Đang thử lại...' : 'Thử lại'} <i className="fas fa-sync"></i>
              </button>
            </div>
          ) : booking ? (
            <>
              {success && <div className="success">{success}</div>}
              
              {/* Thanh trạng thái */}
              <div className="booking-status-bar">
                <div className="booking-progress">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${progressPercent}%`,
                      '--progress-width': `${progressPercent}%` 
                    }}
                  ></div>
                </div>
                
                <div className="status-step">
                  <div className={`status-icon ${booking.status !== 'CANCELLED' ? 'active' : 'cancelled'}`}>
                    <i className="fas fa-edit"></i>
                  </div>
                  <div className={`status-text ${booking.status !== 'CANCELLED' ? 'active' : ''}`}>Đã đặt</div>
                </div>
                
                <div className="status-step">
                  <div className={`status-icon ${booking.status === 'CONFIRMED' ? 'active' : ''} ${booking.status === 'CANCELLED' ? 'cancelled' : ''}`}>
                    <i className="fas fa-check"></i>
                  </div>
                  <div className={`status-text ${booking.status === 'CONFIRMED' ? 'active' : ''}`}>Xác nhận</div>
                </div>
              </div>
              
              {/* Thông tin đặt sân */}
              <div className="booking-card">
                <div className="booking-card-header">
                  <h2 className="booking-card-title">Thông tin đặt sân</h2>
                </div>
                <div className="booking-card-body">
                  <div className="booking-detail-info">
                    <div className="detail-section">
                      <div className="info-grid">
                        <div className="info-row booking-id-row full-width">
                          <span className="label">
                            <i className="fas fa-fingerprint icon-label"></i> Mã đặt sân:
                          </span>
                          <span className="value highlight-id">{booking.id}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">
                            <i className="fas fa-calendar-alt icon-label"></i> Ngày đặt:
                          </span>
                          <span className="value">{formatDate(booking.dateOfBooking || booking.date_of_booking)}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">
                            <i className="fas fa-clock icon-label"></i> Thời gian:
                          </span>
                          <span className="value">{formatTime(booking.startTime || booking.start_time)} - {formatTime(booking.endTime || booking.end_time)}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">
                            <i className="fas fa-info-circle icon-label"></i> Trạng thái:
                          </span>
                          <span className="value booking-status-container">
                            <span className={`booking-status status-${booking.status ? booking.status.toLowerCase() : 'unknown'}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </span>
                        </div>
                        {type && (
                          <div className="info-row">
                            <span className="label">
                              <i className="fas fa-futbol icon-label"></i> Loại sân:
                            </span>
                            <span className="value">{type.typeName || type.name || type.type_name || "Không xác định"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Thông tin sân */}
                  {stadium ? (
                    <div className="stadium-section">
                      <div className="section-header">
                        <h3 className="section-title">
                          <i className="fas fa-map-marker-alt icon-label"></i> Thông tin sân bóng
                        </h3>
                      </div>
                      <div className="stadium-info">
                        <div className="stadium-image">
                          {stadium.imageUrl ? (
                            <img 
                              src={stadium.imageUrl}
                              alt={stadium.stadiumName || 'Sân bóng'} 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'image-error error-text';
                                errorDiv.textContent = 'Không thể tải hình ảnh';
                                e.target.parentNode.appendChild(errorDiv);
                              }}
                            />
                          ) : (
                            <div className="no-image-message no-image-container">Không có hình ảnh</div>
                          )}
                        </div>
                        <div className="stadium-details">
                          <div className="info-grid">
                            <div className="info-row">
                              <span className="label">Tên sân:</span>
                              <span className="value">{stadium?.stadiumName ? stadium.stadiumName : 'Không có dữ liệu'}</span>
                            </div>
                            <div className="info-row">
                              <span className="label">Địa chỉ:</span>
                              <span className="value">{location ? (
                                <span>
                                  {location.address ? location.address : ''}
                                  {location.address && (location.district || location.city) ? ', ' : ''}
                                  {location.district ? location.district : ''}
                                  {location.district && location.city ? ', ' : ''}
                                  {location.city ? location.city : ''}
                                  {!location.address && !location.district && !location.city && <span className="error-text">Không có dữ liệu địa chỉ</span>}
                                </span>
                              ) : (
                                <span className="error-text">Không có dữ liệu địa chỉ</span>
                              )}</span>
                            </div>
                            <div className="info-row">
                              <span className="label">Giá sân:</span>
                              <span className="value">{stadium.price !== undefined ? `${formatPrice(stadium.price)} VNĐ/giờ` : 'Không có dữ liệu'}</span>
                            </div>
                            <div className="info-row">
                              <span className="label">Tổng thời gian:</span>
                              <span className="value">
                                {bookingDetail && bookingDetail.totalHours !== undefined ? (
                                  `${bookingDetail.totalHours} giờ`
                                ) : bookingDetail && bookingDetail.total_hours !== undefined ? (
                                  `${bookingDetail.total_hours} giờ`
                                ) : booking.startTime && booking.endTime ? (
                                  `${calculateTotalHours(booking.startTime, booking.endTime)} giờ`
                                ) : (
                                  <span className="error-text">Không có dữ liệu</span>
                                )}
                              </span>
                            </div>
                          </div>
                      
                          {/* Thông tin giá */}
                          <div className="price-summary">
                            <div className="price-row total">
                              <div>Tổng tiền:</div>
                              <div>
                                {bookingDetail && bookingDetail.price !== undefined ? (
                                  `${formatPrice(bookingDetail.price)} VNĐ`
                                ) : (
                                  <span className="error-text">Không có dữ liệu</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="stadium-section error-loading-container">
                      <p>Không thể tải thông tin sân bóng.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Các nút hành động */}
              <div className="booking-actions">
                {booking.status === 'PENDING' && (
                  <button 
                    className="booking-action-button booking-confirm-button" 
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    <i className="fas fa-check-circle"></i> {loading ? 'Đang xử lý...' : 'Tiếp Tục'}
                  </button>
                )}
                
                {booking && booking.status === 'PENDING' && (
                  <button className="booking-action-button hehecancel-button" onClick={handleCancelBooking}>
                    <i className="fas fa-times-circle"></i> Hủy đặt sân
                  </button>
                )}
                
                {canLeaveFeedback() && (
                  <button className="booking-action-button feedback-button" onClick={openFeedbackModal}>
                    <i className="fas fa-star"></i> Đánh giá
                  </button>
                )}
                
                <button 
                  className="booking-action-button share-button"
                  onClick={() => {
                    const shareText = `Tôi đã đặt sân ${stadium?.stadiumName || 'bóng đá'} vào lúc ${formatTime(booking.startTime)} ngày ${formatDate(booking.dateOfBooking)}. Mã đặt sân: ${booking.id}`;
                    navigator.clipboard.writeText(shareText);
                    alert('Đã sao chép thông tin đặt sân!');
                  }}
                >
                  <i className="fas fa-share-alt"></i> Chia sẻ
                </button>
                
                <button className="booking-action-button contact-button">
                  <i className="fas fa-headset"></i> Liên hệ hỗ trợ
                </button>
                
                <Link to="/" className="booking-action-button home-button">
                  <i className="fas fa-home"></i> Về trang chủ
                </Link>
              </div>
            </>
          ) : (
            <div className="not-found">
              <p>Không tìm thấy thông tin đặt sân.</p>
              <Link to="/profile" className="booking-action-button pay-button">
                Quay lại tài khoản
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal đánh giá */}
      {showFeedbackModal && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="feedback-modal-header">
              <h2>Đánh giá trải nghiệm</h2>
              <button className="modal-close" onClick={closeFeedbackModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="feedback-modal-body">
              <div className="rating-section">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div 
                      key={value}
                      className={`star-icon interactive ${value <= rating ? 'active' : ''}`}
                      onClick={() => handleRatingClick(value)}
                    >
                      <i className="fas fa-star"></i>
                    </div>
                  ))}
                </div>
                <div className="rating-label">
                  {rating === 1 ? 'Kém' :
                   rating === 2 ? 'Trung bình' :
                   rating === 3 ? 'Khá' :
                   rating === 4 ? 'Tốt' :
                   rating === 5 ? 'Rất tốt' : 'Chọn đánh giá của bạn'}
                </div>
              </div>
              
              <div className="comment-section">
                <label htmlFor="feedback-comment">Nhận xét của bạn:</label>
                <textarea 
                  id="feedback-comment"
                  className="comment-textarea"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
              
              <button 
                className="submit-feedback-button"
                onClick={handleSubmitFeedback}
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default BookingDetailPage;