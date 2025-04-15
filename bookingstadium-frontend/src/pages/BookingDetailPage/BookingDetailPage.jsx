import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { bookingAPI, stadiumBookingDetailAPI, stadiumAPI, locationAPI, typeAPI, evaluationAPI, imageAPI, apiClient } from '../../services/apiService';
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
  
  // Thêm state chi tiết cho trạng thái tải
  const [loadingState, setLoadingState] = useState({
    booking: true,
    bookingDetail: false,
    stadium: false,
    location: false
  });
  
  // Thêm state để theo dõi lần thử lại
  const [retrying, setRetrying] = useState(false);
  
  // State cho modal đánh giá
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // Thêm state để quản lý debug mode
  const [showDebug, setShowDebug] = useState(false);
  
  // State progress bar
  const [progressPercent, setProgressPercent] = useState(0);
  
  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Debug thông tin định dạng ngày
      console.log('[formatDate] Xử lý ngày:', dateString, typeof dateString);
      
      // Nếu là timestamp số, chuyển thành string trước
      const dateValue = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
      
      // Kiểm tra tính hợp lệ của ngày
      if (isNaN(dateValue.getTime())) {
        console.error('[formatDate] Giá trị ngày không hợp lệ:', dateString);
        // Nếu là string dạng yyyy-MM-dd, trả về luôn
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          const [year, month, day] = dateString.split('-');
          return `${day}/${month}/${year}`;
        }
        
        return dateString || '';
      }
      
      return dateValue.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (error) {
      console.error('[formatDate] Lỗi khi định dạng ngày:', error, 'giá trị:', dateString);
      return dateString || '';
    }
  };
  
  // Format giờ
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Thêm xử lý cho nhiều định dạng giờ khác nhau
    try {
      // Kiểm tra nếu timeString có định dạng ISO
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
      }
    return timeString;
    } catch (error) {
      // console.error('[formatTime] Lỗi khi định dạng giờ:', error, 'giá trị:', timeString);
    return timeString;
    }
  };
  
  // Format giá tiền
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  
  // Lấy text hiển thị cho trạng thái
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
    
    // Thêm event listener để bật debug mode khi ấn Alt+D
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'd') {
        setShowDebug(prev => !prev);
        // console.log('[DEBUG] Debug mode:', !showDebug);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [bookingId, isAuthenticated, currentUser, navigate, retrying, showDebug]);
  
  // Thêm useEffect để debug loadingState và thông tin booking khi thay đổi
  useEffect(() => {
    if (booking) {
      // console.log('[DEBUG-BOOKING] THÔNG TIN ĐẶT SÂN:', {
      //   id: booking.id || booking.bookingId || booking.stadium_booking_id,
      //   dateOfBooking: booking.dateOfBooking,
      //   startTime: booking.startTime,
      //   endTime: booking.endTime,
      //   status: booking.status,
      //   dateCreated: booking.dateCreated || booking.created_at || booking.createdAt
      // });
    }
  }, [booking]);
  
  // Thêm useEffect để đảm bảo loadingState.location reset khi location thay đổi
  useEffect(() => {
    // Khi có location, đảm bảo loadingState.location là false
    if (location) {
      setLoadingState(prev => ({...prev, location: false}));
    }
  }, [location]);

  // Tương tự cho stadium
  useEffect(() => {
    if (stadium) {
      setLoadingState(prev => ({...prev, stadium: false}));
    }
  }, [stadium]);
  
  // Tương tự cho bookingDetail
  useEffect(() => {
    if (bookingDetail) {
      setLoadingState(prev => ({...prev, bookingDetail: false}));
    }
  }, [bookingDetail]);
  
  // Thêm useEffect để debug stadium state sau khi cập nhật
  useEffect(() => {
    if (stadium) {
      console.log('[DEBUG-STADIUM] Thông tin sân sau khi fetch API:', {
        id: stadium.stadiumId,
        name: stadium.stadiumName,
        price: stadium.price,
        locationId: stadium.locationId,
        imageUrl: stadium.imageUrl
      });
    }
  }, [stadium]);
  
  // Hàm fetchData tối ưu hóa
    const fetchData = async () => {
      if (!isAuthenticated || !bookingId) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
      // Cập nhật trạng thái tải
      setLoadingState({
        booking: true,
        bookingDetail: false,
        stadium: false,
        location: false
      });
        
      console.log('[fetchData] Lấy thông tin booking với ID:', bookingId);
      
      // 1. Lấy thông tin booking từ API chính thức
      const bookingResponse = await bookingAPI.getBookingById(bookingId);
      const bookingData = bookingResponse.data?.result || bookingResponse.data;
        
        if (!bookingData) {
          throw new Error('Không tìm thấy dữ liệu booking');
        }
        
      console.log('[DEBUG] Response từ API (original):', bookingResponse);
      console.log('[DEBUG] Các trường có trong bookingData:', Object.keys(bookingData));
      console.log('[DEBUG] Chi tiết booking từ API (raw):', JSON.stringify(bookingData, null, 2));
      
      // Chuẩn hóa dữ liệu booking
        const normalizedBooking = {
          ...bookingData,
          id: bookingData.id || bookingId,
          bookingId: bookingData.bookingId || bookingData.id || bookingId,
          dateOfBooking: bookingData.dateOfBooking || bookingData.date_of_booking || bookingData.booking_date,
          startTime: bookingData.startTime || bookingData.start_time,
          endTime: bookingData.endTime || bookingData.end_time,
          // Kiểm tra tất cả các trường có thể chứa status
          status: bookingData.status || bookingData.booking_status || bookingData.bookingStatus || bookingData.stadium_booking_status,
          dateCreated: bookingData.dateCreated || bookingData.date_created || bookingData.created_at || bookingData.createdAt
        };
        
        console.log('[DEBUG] Booking sau khi chuẩn hóa:', normalizedBooking);
        console.log('[DEBUG] Mã đặt sân hiện tại:', normalizedBooking.bookingId || normalizedBooking.id);
        console.log('[DEBUG] Trạng thái hiện tại:', normalizedBooking.status);
          
      // Kiểm tra quyền xem booking
        if (normalizedBooking.userId !== currentUser.user_id && normalizedBooking.user_id !== currentUser.user_id) {
            setError('Bạn không có quyền xem thông tin đặt sân này.');
            setLoading(false);
            return;
          }
        
        setBooking(normalizedBooking);
        setLoadingState(prev => ({...prev, booking: false, bookingDetail: true}));
          
        // Tính toán progress
        updateProgressBasedOnStatus(normalizedBooking.status);
      
      // 2. Lấy booking detail từ API endpoint mới
      try {
        const detailResponse = await stadiumBookingDetailAPI.getStadiumBookingDetailByBookingId(bookingId);
        const detailData = detailResponse.data?.result;
        
        if (detailData) {
          console.log('[DEBUG] Chi tiết booking detail từ API:', JSON.stringify(detailData, null, 2));
          setBookingDetail(detailData);
          
          // Lấy stadium_id từ booking detail
          const detailStadiumId = detailData.stadiumId || detailData.stadium_id;
          
          // Lấy thông tin loại sân nếu có typeId
          const typeId = detailData.typeId || detailData.type_id;
          if (typeId) {
            try {
              const typeResponse = await typeAPI.getTypeById(typeId);
              if (typeResponse.data?.result) {
                console.log("[DEBUG] Thông tin loại sân:", JSON.stringify(typeResponse.data.result, null, 2));
                setType(typeResponse.data.result);
              }
            } catch (typeError) {
              console.error("[ERROR] Lỗi khi lấy thông tin loại sân:", typeError);
            }
          }
          
          if (detailStadiumId) {
            // Nếu có stadium_id từ detail, ưu tiên dùng
            await fetchStadiumData(detailStadiumId);
          }
        } else {
          // Hiển thị lỗi nếu API không trả về dữ liệu
          console.error('[ERROR] API detail không trả về dữ liệu');
          setError('Không thể lấy thông tin chi tiết đặt sân từ hệ thống.');
          setLoadingState(prev => ({...prev, bookingDetail: false}));
          setLoading(false);
          return;
        }
      } catch (detailError) {
        console.error('[ERROR] Lỗi khi lấy booking detail:', detailError);
        setError('Không thể lấy thông tin chi tiết đặt sân. Vui lòng thử lại sau.');
        setLoadingState(prev => ({...prev, bookingDetail: false}));
        setLoading(false);
        return;
      }
      
      setLoadingState(prev => ({...prev, bookingDetail: false, stadium: true}));
      
      } catch (error) {
        console.error('[ERROR] Lỗi khi lấy thông tin booking:', error);
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
    
    // Tách hàm fetchStadiumData để có thể tái sử dụng
    const fetchStadiumData = async (stadiumId) => {
      if (!stadiumId) {
        console.error('[ERROR] Không có stadium ID để lấy thông tin sân');
        setLoadingState(prev => ({...prev, stadium: false}));
        return;
      }
      
      try {
        console.log("[DEBUG] Lấy thông tin sân với ID:", stadiumId);
        
        const stadiumResponse = await stadiumAPI.getStadiumById(stadiumId);
        if (stadiumResponse.data?.result) {
          const stadiumData = stadiumResponse.data.result;
          console.log("[DEBUG] Phản hồi từ API stadium:", JSON.stringify(stadiumData, null, 2));
          
          // Chuẩn hóa stadium data
          const normalizedStadium = {
            ...stadiumData,
            stadiumId: stadiumData.stadiumId || stadiumData.stadium_id,
            stadiumName: stadiumData.stadiumName || stadiumData.stadium_name,
            locationId: stadiumData.locationId || stadiumData.location_id,
            price: stadiumData.price || 0
          };
          
          setStadium(normalizedStadium);
          console.log("[DEBUG] Đã cập nhật stadium state:", JSON.stringify(normalizedStadium, null, 2));
          
          // Lấy hình ảnh sân
          await fetchStadiumImage(stadiumId);
          
          // Lấy thông tin địa điểm
          if (normalizedStadium.locationId) {
            await fetchLocationData(normalizedStadium.locationId);
          } else {
            setLoadingState(prev => ({...prev, stadium: false, location: false}));
          }
        } else {
          console.error("[ERROR] API sân trả về dữ liệu không hợp lệ");
          setLoadingState(prev => ({...prev, stadium: false, location: false}));
        }
      } catch (error) {
        console.error('[ERROR] Lỗi khi lấy thông tin sân:', error);
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
      console.error('[ERROR] Lỗi khi tính tổng giờ:', error);
      return null;
    }
  };
  
  // Tách riêng hàm lấy hình ảnh sân để đơn giản hóa logic
  const fetchStadiumImage = async (stadiumId) => {
    if (!stadiumId) return;
    
    try {
      console.log("[DEBUG] Lấy hình ảnh sân với ID:", stadiumId);
      
      // Thử lấy hình ảnh theo ID sân
      const imagesResponse = await imageAPI.getImagesByStadiumId(stadiumId);
      
      if (imagesResponse.data && imagesResponse.data.result && imagesResponse.data.result.length > 0) {
        // Có hình ảnh từ API, sử dụng hình ảnh đầu tiên
        const firstImage = imagesResponse.data.result[0];
        console.log("[DEBUG] API trả về hình ảnh:", JSON.stringify(firstImage, null, 2));
        
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
          console.log("[DEBUG] URL hình ảnh sân:", imageUrl);
          
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
      } else {
        console.log("[DEBUG] Không tìm thấy hình ảnh cho sân", stadiumId);
      }
      
      // Không lấy được hình ảnh từ API
    } catch (error) {
      // Lỗi khi lấy hình ảnh, hiển thị thông báo lỗi
      console.error('[fetchStadiumImage] Lỗi khi lấy hình ảnh sân:', error);
    }
  };
  
  // Tách riêng hàm lấy thông tin địa điểm
  const fetchLocationData = async (locationId) => {
    if (!locationId) {
      console.error("[ERROR] Không có location ID để lấy thông tin địa điểm");
      setLoadingState(prev => ({...prev, location: false}));
      return;
    }
    
    try {
      console.log("[DEBUG] Lấy thông tin địa điểm với ID:", locationId);
      
      const locationResponse = await locationAPI.getLocationById(locationId);
      
      if (locationResponse.data && locationResponse.data.result) {
        const locationData = locationResponse.data.result;
        console.log("[DEBUG] Phản hồi từ API location:", JSON.stringify(locationData, null, 2));
        
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
        console.log("[DEBUG] Đã cập nhật location state:", JSON.stringify(normalizedLocation, null, 2));
      } else {
        console.error("[ERROR] API location trả về dữ liệu không hợp lệ");
      }
      
      // Hoàn thành quá trình lấy thông tin địa điểm
      setLoadingState(prev => ({...prev, location: false}));
    } catch (locationError) {
      console.error('[fetchLocationData] Lỗi khi lấy thông tin địa điểm:', locationError);
      setLoadingState(prev => ({...prev, location: false}));
    }
  };
  
  // Tách riêng hàm lấy thông tin loại sân
  const fetchTypeData = async (typeId) => {
    if (!typeId) return;
    
    try {
      const typeResponse = await typeAPI.getTypeById(typeId);
      
          if (typeResponse.data && typeResponse.data.result) {
            setType(typeResponse.data.result);
          }
        } catch (typeError) {
      console.error('[fetchTypeData] Lỗi khi lấy thông tin loại sân:', typeError);
      }
    };
  
  // Xử lý thanh toán - đơn giản hóa
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
      
      const response = await bookingAPI.updateBooking(bookingId, {
        status: 'CANCELLED'
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
      // console.error('Lỗi khi hủy đặt sân:', error);
      setError('Không thể hủy đặt sân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Mở modal đánh giá
  const openFeedbackModal = () => {
    setShowFeedbackModal(true);
  };
  
  // Đóng modal đánh giá
  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setRating(0);
    setComment('');
  };
  
  // Xử lý đánh giá sao
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
      // console.error('Lỗi khi gửi đánh giá:', error);
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
    return booking && 
           (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && 
           new Date(booking.dateOfBooking) > new Date();
  };
  
  // Kiểm tra xem có thể đánh giá không
  const canLeaveFeedback = () => {
    return booking && 
           booking.status === 'CONFIRMED' &&
           new Date(booking.dateOfBooking) < new Date();
  };
  
  return (
    <div className={`booking-detail-page ${showDebug ? 'show-debug' : ''}`}>
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h1 className="page-title">Chi tiết đặt sân</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>
      
      <div className="booking-detail-content">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span className="separator">/</span>
            <Link to="/profile">Tài khoản</Link>
            <span className="separator">/</span>
            <span className="current">Chi tiết đặt sân</span>
          </div>
          
          {showDebug && (
            <div className="debug-panel">
              <h4>Debug Info</h4>
              {booking && (
                <div>
                  <p>BookingId: {booking.stadium_booking_id || booking.bookingId || booking.id || "Không có"}</p>
                  <p>Status: {booking.status || "Không có"}</p>
                  <pre>{JSON.stringify(booking, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
          
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
                  {/* Thông tin đặt sân */}
                  <div className="booking-detail-info">
                    {/* Chi tiết booking */}
                    <div className="detail-section">
                      <h3>Thông tin đặt sân</h3>
                      <div className="info-row booking-id-row">
                        <span className="label">Mã đặt sân:</span>
                        <span className="value highlight-id">{booking.id}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Ngày đặt:</span>
                        <span className="value">{formatDate(booking.dateOfBooking || booking.date_of_booking)}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Thời gian:</span>
                        <span className="value">{formatTime(booking.startTime || booking.start_time)} - {formatTime(booking.endTime || booking.end_time)}</span>
                      </div>
                      <div className="info-row status-row">
                        <span className="label">Trạng thái:</span>
                        <span 
                          className={`status-chip status-${booking.status ? booking.status.toLowerCase() : 'unknown'}`}
                        >
                          {booking.status === 'PENDING' ? 'CHỜ XÁC NHẬN' : 
                           booking.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : 
                           booking.status === 'CANCELLED' ? 'ĐÃ HỦY' : 
                           'Không xác định'}
                        </span>
                      </div>
                      {type && (
                        <div className="info-row">
                          <span className="label">Loại sân:</span>
                          <span className="value">{type.typeName || type.name || type.type_name || "Không xác định"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Thông tin sân */}
                  {stadium ? (
                    <div className="stadium-section">
                      <div className="stadium-info">
                        <div className="stadium-image">
                          {stadium.imageUrl ? (
                            <img 
                              src={stadium.imageUrl}
                              alt={stadium.stadiumName || 'Sân bóng'} 
                              onError={(e) => {
                                console.error('[Image] Lỗi tải hình ảnh sân');
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
                          <div className="info-rows">
                            <div className="stadium-name">
                              <strong>Tên sân:</strong> {stadium?.stadiumName ? (
                                <span>{stadium.stadiumName}</span>
                              ) : (
                                <span className="error-text">Không có dữ liệu</span>
                              )}
                            </div>
                            <div className="stadium-address">
                              <strong>Địa chỉ:</strong> {location ? (
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
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Thông tin giá */}
                      <div className="price-summary">
                        <div className="price-row">
                          <div>Giá sân:</div>
                          <div>
                            {stadium && stadium.price !== undefined ? (
                              <>{formatPrice(stadium.price)} VNĐ/giờ</>
                            ) : (
                              <span className="error-text">Không có dữ liệu</span>
                            )}
                          </div>
                        </div>
                        <div className="price-row">
                          <div>Thời gian:</div>
                          <div>
                            {booking.startTime && booking.endTime ? (
                              `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`
                            ) : (
                              <span className="error-text">Không có dữ liệu</span>
                            )}
                          </div>
                        </div>
                        <div className="price-row">
                          <div>Tổng thời gian:</div>
                          <div>
                            {bookingDetail && bookingDetail.totalHours !== undefined ? (
                              `${bookingDetail.totalHours} giờ`
                            ) : bookingDetail && bookingDetail.total_hours !== undefined ? (
                              `${bookingDetail.total_hours} giờ`
                            ) : booking.startTime && booking.endTime ? (
                              `${calculateTotalHours(booking.startTime, booking.endTime)} giờ`
                            ) : (
                              <span className="error-text">Không có dữ liệu</span>
                            )}
                          </div>
                        </div>
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
                    className="booking-action-button pay-button" 
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    <i className="fas fa-check-circle"></i> {loading ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                )}
                
                {canCancelBooking() && (
                  <button className="booking-action-button cancel-button" onClick={handleCancelBooking}>
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