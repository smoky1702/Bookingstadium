import React, { useState, useEffect } from 'react';
import '../BookingConfirmModal/BookingConfirmModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faCheckCircle, faCalendarAlt, faClock, faUser, faMapMarkerAlt, faPhone, faEnvelope, faFutbol, faCreditCard, faIdCard, faBirthdayCake, faTag, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { userAPI } from '../../services/apiService';

const BookingConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  stadium, 
  location, 
  type, 
  bookingData, 
  currentUser,
  calculateTotalHours,
  formatDate,
  isLoading
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUserDetails();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (userDetails?.phone) {
      setPhoneNumber(userDetails.phone);
      validatePhoneNumber(userDetails.phone);
    } else if (currentUser?.phone) {
      setPhoneNumber(currentUser.phone);
      validatePhoneNumber(currentUser.phone);
    }
  }, [userDetails, currentUser]);

  const fetchUserDetails = async () => {
    try {
      const response = await userAPI.getCurrentUser();
      
      if (response && response.data) {
        let userData = null;
        
        if (response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
          const foundUser = response.data.result.find(
            user => user.email === currentUser?.email
          );
          
          if (foundUser) {
            userData = foundUser;
          } else {
            const foundUserById = response.data.result.find(
              user => user.user_id === currentUser?.user_id
            );
            
            if (foundUserById) {
              userData = foundUserById;
            }
          }
        } else if (response.data.result) {
          userData = response.data.result;
        } else {
          userData = response.data;
        }
        
        if (userData) {
          setUserDetails(userData);
          if (userData.phone) {
            setPhoneNumber(userData.phone);
            validatePhoneNumber(userData.phone);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }
    
    if (termsAccepted) {
      onConfirm(phoneNumber);
    }
  };

  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') {
      setPhoneError('Vui lòng nhập số điện thoại');
      return false;
    }
    
    const cleanPhone = phone.replace(/\s+|-|\./g, '');
    
    if (!/^\d+$/.test(cleanPhone)) {
      setPhoneError('Số điện thoại chỉ được chứa số');
      return false;
    }
    
    if (cleanPhone.length !== 10) {
      setPhoneError('Số điện thoại phải có ít nhất 10 số');
      return false;
    }
    
    // const validPrefixes = ['03', '05', '07', '08', '09'];
    // if (!validPrefixes.some(prefix => cleanPhone.startsWith(prefix))) {
    //   setPhoneError('Số điện thoại không hợp lệ');
    //   return false;
    // }
    
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const newPhone = value.replace(/[^\d]/g, '').slice(0, 10);
    setPhoneNumber(newPhone);
    validatePhoneNumber(newPhone);
  };

  const calculateTotalPrice = () => {
    if (!stadium || !calculateTotalHours) return 0;
    return stadium.price * calculateTotalHours();
  };

  const getFullAddress = () => {
    if (!location) return "Đang cập nhật địa chỉ...";
    
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.ward) parts.push(location.ward);
    if (location.district) parts.push(location.district);
    if (location.city) parts.push(location.city);
    if (location.province) parts.push(location.province);
    
    return parts.join(", ") || "Chưa có thông tin địa chỉ";
  };

  const getDisplayName = () => {
    if (userDetails?.firstname && userDetails?.lastname) {
      return `${userDetails.firstname} ${userDetails.lastname}`;
    } else if (userDetails?.firstname) {
      return userDetails.firstname;
    } else if (userDetails?.lastname) {
      return userDetails.lastname;
    } else if (currentUser?.firstname && currentUser?.lastname) {
      return `${currentUser.firstname} ${currentUser.lastname}`;
    } else if (currentUser?.firstname) {
      return currentUser.firstname;
    } else if (currentUser?.lastname) {
      return currentUser.lastname;
    } else if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    } else {
      return 'Người dùng';
    }
  };

  const formatBirthDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Chưa cập nhật';
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Chưa cập nhật';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="booking-confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="booking-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Xác nhận đặt sân</h2>
          <button 
            className="close-button" 
            onClick={() => !loading && onClose()}
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {/* Thông tin sân */}
          <div className="confirm-section">
            <h3><FontAwesomeIcon icon={faFutbol} /> Thông tin sân</h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Tên sân:</span>
                <span className="info-value">{stadium?.stadiumName || 'Không có thông tin'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Loại sân:</span>
                <span className="info-value">{type?.typeName || type?.name || 'Không có thông tin'}</span>
              </div>
              <div className="info-row address-row">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value" title={getFullAddress()}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon" />
                  {getFullAddress()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Thông tin đặt sân */}
          <div className="confirm-section">
            <h3><FontAwesomeIcon icon={faCalendarAlt} /> Thông tin đặt sân</h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Ngày đặt:</span>
                <span className="info-value">{formatDate(bookingData?.dateOfBooking) || 'Chưa chọn'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Giờ bắt đầu:</span>
                <span className="info-value">{bookingData?.startTime || 'Chưa chọn'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Giờ kết thúc:</span>
                <span className="info-value">{bookingData?.endTime || 'Chưa chọn'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tổng số giờ:</span>
                <span className="info-value">{calculateTotalHours ? calculateTotalHours() : 0} giờ</span>
              </div>
              <div className="info-row price-row">
                <span className="info-label">Giá sân/giờ:</span>
                <span className="info-value">{stadium?.price?.toLocaleString() || 0} VND</span>
              </div>
              <div className="info-row total-price">
                <span className="info-label">Tổng tiền (tạm tính):</span>
                <span className="info-value">{calculateTotalPrice().toLocaleString()} VND</span>
              </div>
            </div>
          </div>
          
          {/* Thông tin người đặt */}
          <div className="confirm-section">
            <h3><FontAwesomeIcon icon={faUser} /> Thông tin người đặt</h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">
                  <FontAwesomeIcon icon={faIdCard} className="info-icon" />
                  Họ tên:
                </span>
                <span className="info-value" title={getDisplayName()}>{getDisplayName()}</span>
              </div>
              <div className="info-row email-row">
                <span className="info-label">
                  <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                  Email:
                </span>
                <span className="info-value email-value" title={userDetails?.email || currentUser?.email || 'Chưa có thông tin'}>
                  {userDetails?.email || currentUser?.email || 'Chưa có thông tin'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <FontAwesomeIcon icon={faPhone} className="info-icon" />
                  Số điện thoại:
                </span>
                <div className="editable-phone">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Nhập số điện thoại"
                    className={`phone-input ${phoneError ? 'error' : ''}`}
                    disabled={loading}
                    maxLength={11}
                  />
                  {phoneError ? (
                    <p className="phone-error">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> {phoneError}
                    </p>
                  ) : (
                    <p className="phone-note">* Bạn có thể sửa số điện thoại</p>
                  )}
                </div>
              </div>
              {currentUser?.day_of_birth && (
                <div className="info-row">
                  <span className="info-label">
                    <FontAwesomeIcon icon={faBirthdayCake} className="info-icon" />
                    Ngày sinh:
                  </span>
                  <span className="info-value">{formatBirthDate(currentUser.day_of_birth)}</span>
                </div>
              )}
              {currentUser?.address && (
                <div className="info-row address-row">
                  <span className="info-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon" />
                    Địa chỉ:
                  </span>
                  <span className="info-value" title={currentUser.address}>{currentUser.address}</span>
                </div>
              )}
              {currentUser?.user_id && (
                <div className="info-row">
                  <span className="info-label">
                    <FontAwesomeIcon icon={faIdCard} className="info-icon" />
                    Mã người dùng:
                  </span>
                  <span className="info-value user-id">{currentUser.user_id}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Điều khoản */}
          <div className="terms-section">
            <label className="terms-checkbox">
              <input 
                type="checkbox" 
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                disabled={loading}
              />
              <span>
                Tôi đã đọc và đồng ý với <a href="/terms" target="_blank">Điều khoản dịch vụ</a> và <a href="/privacy" target="_blank">Chính sách bảo mật</a> của Mi24/7
              </span>
            </label>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={() => !loading && onClose()} 
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            className="confirm-button" 
            onClick={handleConfirm} 
            disabled={!termsAccepted || !phoneNumber || phoneError || loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <span>Đặt sân</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmModal;