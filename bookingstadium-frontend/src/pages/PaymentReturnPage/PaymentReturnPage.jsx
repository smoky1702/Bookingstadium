import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { billAPI, momoAPI } from '../../services/apiService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './PaymentReturnPage.css';

const PaymentReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [billInfo, setBillInfo] = useState(null);
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Lấy thông tin từ URL parameters
        const params = new URLSearchParams(location.search);
        const resultCode = params.get('resultCode');
        const orderId = params.get('orderId'); // orderId chính là billId
        const messageParam = params.get('message') || '';
        
        if (!orderId) {
          setStatus('failed');
          setMessage('Không tìm thấy thông tin hóa đơn. Vui lòng kiểm tra lại.');
          setCountdown(3);
          return;
        }
        
        // Lấy thông tin hóa đơn
        try {
          const billResponse = await billAPI.getBillById(orderId);
          const billData = billResponse.data?.result;
          
          if (!billData) {
            throw new Error('Không tìm thấy thông tin hóa đơn');
          }
          
          setBillInfo(billData);
          
          // Xử lý kết quả thanh toán
          if (resultCode === '0') { // Thanh toán thành công
            setStatus('success');
            setMessage('Thanh toán thành công! Đơn đặt sân của bạn đã được xác nhận.');
            
            // Nếu hóa đơn chưa cập nhật thành PAID, gửi yêu cầu cập nhật qua IPN
            if (billData.status !== 'PAID') {
              try {
                // Lấy tất cả dữ liệu từ URL params để gửi đến backend
                const momoParams = {};
                for (const [key, value] of params.entries()) {
                  momoParams[key] = value;
                }
                
                // Đảm bảo có đủ các trường cần thiết
                if (!momoParams.transId) {
                  momoParams.transId = params.get('transId') || params.get('requestId') || Date.now().toString();
                }
                
                // Gọi API để cập nhật thanh toán
                await momoAPI.simulateIPN(orderId, momoParams);
                console.log('Đã gửi yêu cầu cập nhật trạng thái hóa đơn thành công');
                
                // Cập nhật UI ngay lập tức không chờ backend
                setBillInfo({
                  ...billData,
                  status: 'PAID',
                  datePaid: new Date()
                });
              } catch (ipnError) {
                console.error('Không thể cập nhật trạng thái hóa đơn:', ipnError);
                // Vẫn hiển thị thành công cho người dùng vì thanh toán đã thành công
              }
            }
          } else { // Thanh toán thất bại hoặc bị hủy
            setStatus('failed');
            
            // Tùy chỉnh thông báo dựa trên mã lỗi
            let errorMessage = 'Thanh toán không thành công.';
            if (resultCode === '1003') {
              errorMessage = 'Bạn đã hủy giao dịch thanh toán.';
            } else if (resultCode === '1006') {
              errorMessage = 'Giao dịch bị từ chối bởi MoMo.';
            } else if (messageParam) {
              errorMessage = `Thanh toán không thành công: ${messageParam}`;
            }
            
            setMessage(errorMessage);
          }
        } catch (billError) {
          console.error('Lỗi khi lấy thông tin hóa đơn:', billError);
          setStatus('failed');
          setMessage('Không thể lấy thông tin hóa đơn. Bạn sẽ được chuyển về trang cá nhân.');
          setCountdown(3);
        }
      } catch (error) {
        console.error('Lỗi khi xử lý kết quả thanh toán:', error);
        setStatus('failed');
        setMessage('Có lỗi xảy ra khi xử lý thanh toán. Bạn sẽ được chuyển về trang cá nhân.');
        setCountdown(3);
      }
    };
    
    handlePaymentReturn();
  }, [location]);
  
  // Đếm ngược và chuyển hướng
  useEffect(() => {
    if (status === 'processing' || countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, status]);
  
  // Xử lý chuyển hướng khi countdown kết thúc
  useEffect(() => {
    if (countdown !== 0) return;
    
    if (billInfo?.stadiumBookingId) {
      navigate(`/booking/${billInfo.stadiumBookingId}`);
    } else {
      navigate('/profile');
    }
  }, [countdown, billInfo, navigate]);
  
  // Render status icon dựa trên trạng thái
  const renderStatusIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="processing-icon">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        );
      case 'success':
        return (
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
        );
      case 'failed':
        return (
          <div className="failed-icon">
            <i className="fas fa-times-circle"></i>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="payment-return-page">
      <Navbar />
      
      <div className="payment-return-container">
        <div className={`payment-result ${status}`}>
          {renderStatusIcon()}
          
          <h2 className="result-title">
            {status === 'processing' ? 'Đang xử lý thanh toán' :
             status === 'success' ? 'Thanh toán thành công' :
             'Thanh toán thất bại'}
          </h2>
          
          <p className="result-message">{message}</p>
          
          {status !== 'processing' && billInfo && (
            <div className="bill-summary">
              <div className="bill-info-item">
                <span className="bill-label">Mã hóa đơn:</span>
                <span className="bill-value">{billInfo.billId}</span>
              </div>
              
              <div className="bill-info-item">
                <span className="bill-label">Số tiền:</span>
                <span className="bill-value">{new Intl.NumberFormat('vi-VN').format(billInfo.finalPrice)} VNĐ</span>
              </div>
              
              <div className="bill-info-item">
                <span className="bill-label">Trạng thái:</span>
                <span className={`bill-status ${billInfo.status?.toLowerCase()}`}>
                  {billInfo.status === 'PAID' ? 'Đã thanh toán' : 
                   billInfo.status === 'UNPAID' ? 'Chưa thanh toán' : 
                   'Đã hủy'}
                </span>
              </div>
            </div>
          )}
          
          <div className="countdown">
            Tự động chuyển hướng sau {countdown} giây
          </div>
          
          <div className="action-buttons">
            {status === 'failed' && billInfo?.stadiumBookingId && (
              <button 
                className="retry-button"
                onClick={() => navigate(`/booking/${billInfo.stadiumBookingId}`)}
              >
                Thử lại
              </button>
            )}
            
            <Link to="/" className="home-button">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentReturnPage; 