import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext';
import { bookingAPI, stadiumBookingDetailAPI, stadiumAPI, locationAPI, typeAPI, billAPI, evaluationAPI } from '../services/apiService';
import './BookingDetailPage.css';

const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  const [booking, setBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [stadium, setStadium] = useState(null);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(null);
  const [bill, setBill] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State cho modal đánh giá
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // State progress bar
  const [progressPercent, setProgressPercent] = useState(0);
  
  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Format giờ
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !bookingId) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Lấy thông tin đặt sân
        const bookingResponse = await bookingAPI.getBookingById(bookingId);
        if (bookingResponse.data && bookingResponse.data.result) {
          const bookingData = bookingResponse.data.result;
          
          // Kiểm tra nếu bookingData là của người dùng hiện tại
          if (bookingData.userId !== currentUser.user_id) {
            setError('Bạn không có quyền xem thông tin đặt sân này.');
            setLoading(false);
            return;
          }
          
          setBooking(bookingData);
          
          // Tính toán progress
          if (bookingData.status === 'PENDING') {
            setProgressPercent(33);
          } else if (bookingData.status === 'CONFIRMED') {
            setProgressPercent(66);
          } else if (bookingData.status === 'COMPLETED') {
            setProgressPercent(100);
          }
          
          // Lấy thông tin chi tiết đặt sân
          const bookingDetailResponse = await stadiumBookingDetailAPI.getStadiumBookingDetailById(bookingId);
          if (bookingDetailResponse.data && bookingDetailResponse.data.result) {
            setBookingDetail(bookingDetailResponse.data.result);
            
            // Lấy thông tin sân
            const stadiumResponse = await stadiumAPI.getStadiumById(bookingDetailResponse.data.result.stadiumId);
            if (stadiumResponse.data && stadiumResponse.data.result) {
              setStadium(stadiumResponse.data.result);
              
              // Lấy thông tin địa điểm
              const locationResponse = await locationAPI.getLocationById(stadiumResponse.data.result.locationId);
              if (locationResponse.data && locationResponse.data.result) {
                setLocation(locationResponse.data.result);
              }
            }
            
            // Lấy thông tin loại sân
            const typeResponse = await typeAPI.getTypeById(bookingDetailResponse.data.result.typeId);
            if (typeResponse.data && typeResponse.data.result) {
              setType(typeResponse.data.result);
            }
          }
          
          // Lấy thông tin hóa đơn
          try {
            const billsResponse = await billAPI.getBills();
            if (billsResponse.data && billsResponse.data.result) {
              const billData = billsResponse.data.result.find(b => b.stadiumBookingId === bookingId);
              if (billData) {
                setBill(billData);
              }
            }
          } catch (error) {
            console.error('Lỗi khi lấy thông tin hóa đơn:', error);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin đặt sân:', error);
        setError('Không thể tải thông tin đặt sân. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [bookingId, isAuthenticated, currentUser, navigate]);
  
  // Xử lý thanh toán
  const handlePayment = () => {
    if (bill) {
      navigate(`/bills/${bill.billId}`);
    } else {
      setError('Không tìm thấy hóa đơn cho đơn đặt sân này.');
    }
  };
  
  // Xử lý hủy đặt sân
  const handleCancelBooking = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt sân này không?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await bookingAPI.updateBooking(bookingId, {
        ...booking,
        status: 'CANCELLED'
      });
      
      if (response.data && response.data.result) {
        setBooking({
          ...booking,
          status: 'CANCELLED'
        });
        
        setSuccess('Hủy đặt sân thành công.');
        
        // Cập nhật bill nếu có
        if (bill) {
          await billAPI.updateBill(bill.billId, {
            status: 'CANCELLED'
          });
          
          setBill({
            ...bill,
            status: 'CANCELLED'
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi hủy đặt sân:', error);
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
      
      const response = await evaluationAPI.createEvaluation({
        user_id: currentUser.user_id,
        location_id: location.locationId,
        rating_score: rating,
        comment: comment
      });
      
      if (response.data && response.data.result) {
        setSuccess('Gửi đánh giá thành công!');
        closeFeedbackModal();
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      setError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Tính tổng thời gian
  const calculateTotalHours = () => {
    if (!booking || !booking.startTime || !booking.endTime) return 0;
    
    const startTime = new Date(`2023-01-01T${booking.startTime}`);
    const endTime = new Date(`2023-01-01T${booking.endTime}`);
    
    const diff = endTime - startTime;
    return diff / (1000 * 60 * 60); // Chuyển từ ms sang giờ
  };
  
  // Tính tổng tiền
  const calculateTotalPrice = () => {
    if (!bookingDetail) return 0;
    return bookingDetail.price;
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
           booking.status === 'COMPLETED' &&
           new Date(booking.dateOfBooking) < new Date();
  };
  
  return (
    <div className="booking-detail-page">
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
          
          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : booking ? (
            <>
              {success && <div className="success">{success}</div>}
              
              {/* Thanh trạng thái */}
              <div className="booking-status-bar">
                <div className="booking-progress">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                
                <div className="status-step">
                  <div className={`status-icon ${booking.status !== 'CANCELLED' ? 'active' : 'cancelled'}`}>
                    <i className="fas fa-edit"></i>
                  </div>
                  <div className={`status-text ${booking.status !== 'CANCELLED' ? 'active' : ''}`}>Đã đặt</div>
                </div>
                
                <div className="status-step">
                  <div className={`status-icon ${booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'active' : ''} ${booking.status === 'CANCELLED' ? 'cancelled' : ''}`}>
                    <i className="fas fa-check"></i>
                  </div>
                  <div className={`status-text ${booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'active' : ''}`}>Xác nhận</div>
                </div>
                
                <div className="status-step">
                  <div className={`status-icon ${booking.status === 'COMPLETED' ? 'completed' : ''} ${booking.status === 'CANCELLED' ? 'cancelled' : ''}`}>
                    <i className="fas fa-flag-checkered"></i>
                  </div>
                  <div className={`status-text ${booking.status === 'COMPLETED' ? 'active' : ''}`}>Hoàn thành</div>
                </div>
              </div>
              
              {/* Thông tin đặt sân */}
              <div className="booking-card">
                <div className="booking-card-header">
                  <h2 className="booking-card-title">Thông tin đặt sân</h2>
                </div>
                <div className="booking-card-body">
                  <div className="booking-info-section">
                    <div className="booking-info-row">
                      <div className="booking-info-label">Mã đặt sân:</div>
                      <div className="booking-info-value">{booking.bookingId}</div>
                    </div>
                    <div className="booking-info-row">
                      <div className="booking-info-label">Ngày đặt:</div>
                      <div className="booking-info-value">{formatDate(booking.dateOfBooking)}</div>
                    </div>
                    <div className="booking-info-row">
                      <div className="booking-info-label">Thời gian:</div>
                      <div className="booking-info-value">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                    </div>
                    <div className="booking-info-row">
                      <div className="booking-info-label">Trạng thái:</div>
                      <div className="booking-info-value">
                        {booking.status === 'PENDING' ? 'Chờ xác nhận' :
                         booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                         booking.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
                      </div>
                    </div>
                    <div className="booking-info-row">
                      <div className="booking-info-label">Ngày tạo:</div>
                      <div className="booking-info-value">{booking.dateCreated ? formatDate(booking.dateCreated) : 'N/A'}</div>
                    </div>
                  </div>
                  
                  {stadium && (
                    <div className="stadium-section">
                      <div className="stadium-info">
                        <div className="stadium-image">
                          <img src="/stadium-placeholder.jpg" alt={stadium.stadiumName} />
                        </div>
                        <div className="stadium-details">
                          <div className="stadium-name">{stadium.stadiumName}</div>
                          <div className="stadium-type">{type ? type.typeName : 'Không xác định'}</div>
                          <div className="stadium-address">
                            {location ? `${location.address}, ${location.district}, ${location.city}` : 'Không xác định'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="price-summary">
                        <div className="price-row">
                          <div>Giá sân:</div>
                          <div>{stadium.price.toLocaleString()} VNĐ/giờ</div>
                        </div>
                        <div className="price-row">
                          <div>Thời gian:</div>
                          <div>{calculateTotalHours()} giờ</div>
                        </div>
                        <div className="price-row total">
                          <div>Tổng tiền:</div>
                          <div>{calculateTotalPrice().toLocaleString()} VNĐ</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Các nút hành động */}
              <div className="booking-actions">
                {bill && bill.status === 'UNPAID' && (
                  <button className="booking-action-button pay-button" onClick={handlePayment}>
                    Thanh toán
                  </button>
                )}
                
                {canCancelBooking() && (
                  <button className="booking-action-button cancel-button" onClick={handleCancelBooking}>
                    Hủy đặt sân
                  </button>
                )}
                
                {canLeaveFeedback() && (
                  <button className="booking-action-button feedback-button" onClick={openFeedbackModal}>
                    Đánh giá
                  </button>
                )}
                
                <button className="booking-action-button contact-button">
                  Liên hệ hỗ trợ
                </button>
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