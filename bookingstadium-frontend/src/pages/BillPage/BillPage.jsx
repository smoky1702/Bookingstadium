import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { billAPI, paymentMethodAPI } from '../../services/apiService';
import '../BillPage/BillPage.css';

const BillPage = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State cho modal thanh toán
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  
  // State cho tab
  const [activeTab, setActiveTab] = useState('all');
  
  // Format ngày giờ
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Lấy danh sách hóa đơn
        const billsResponse = await billAPI.getBills();
        if (billsResponse.data && billsResponse.data.result) {
          // Lọc hóa đơn của người dùng hiện tại
          const userBills = billsResponse.data.result.filter(bill => 
            bill.userId === currentUser.user_id);
          setBills(userBills);
        }
        
        // Lấy danh sách phương thức thanh toán
        const paymentMethodsResponse = await paymentMethodAPI.getPaymentMethods();
        if (paymentMethodsResponse.data && paymentMethodsResponse.data.result) {
          setPaymentMethods(paymentMethodsResponse.data.result);
        }
      } catch (error) {
        console.error('Error fetching bills data:', error);
        setError('Không thể tải dữ liệu hóa đơn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, currentUser]);
  
  // Lọc hóa đơn theo tab
  const getFilteredBills = () => {
    if (activeTab === 'all') return bills;
    return bills.filter(bill => bill.status.toLowerCase() === activeTab);
  };
  
  // Xử lý mở modal thanh toán
  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
    setSelectedPaymentMethod(bill.paymentMethodId || null);
  };
  
  // Xử lý đóng modal thanh toán
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBill(null);
    setSelectedPaymentMethod(null);
  };
  
  // Xử lý chọn phương thức thanh toán
  const handleSelectPaymentMethod = (paymentMethodId) => {
    setSelectedPaymentMethod(paymentMethodId);
  };
  
  // Xử lý thanh toán hóa đơn
  const handlePayBill = async () => {
    if (!selectedBill || !selectedPaymentMethod) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Cập nhật phương thức thanh toán nếu khác với hiện tại
      if (selectedBill.paymentMethodId !== selectedPaymentMethod) {
        await billAPI.updateBill(selectedBill.billId, {
          payment_method_id: selectedPaymentMethod
        });
      }
      
      // Thanh toán hóa đơn
      const response = await billAPI.payBill(selectedBill.billId, {
        status: 'PAID',
        date_paid: new Date().toISOString()
      });
      
      if (response.data && response.data.result) {
        // Cập nhật danh sách hóa đơn
        setBills(bills.map(bill => 
          bill.billId === selectedBill.billId 
            ? { ...bill, status: 'PAID', datePaid: new Date().toISOString() } 
            : bill
        ));
        
        setSuccess('Thanh toán hóa đơn thành công!');
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
      
      handleClosePaymentModal();
    } catch (error) {
      console.error('Error paying bill:', error);
      setError('Thanh toán hóa đơn thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Lấy tên phương thức thanh toán
  const getPaymentMethodName = (paymentMethodId) => {
    const method = paymentMethods.find(m => m.paymentMethodId === paymentMethodId);
    return method ? method.paymentMethodName : 'Không xác định';
  };
  
  return (
    <div className="bill-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <h1 className="page-title">Quản lý hóa đơn</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>
      
      <div className="bill-content">
        <div className="container">
          {!isAuthenticated ? (
            <div className="login-required">
              <p>Vui lòng đăng nhập để xem hóa đơn của bạn.</p>
              <button className="bill-button pay-button" onClick={() => document.querySelector('.navbar-action-button').click()}>
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
              
              <div className="bill-tabs">
                <div 
                  className={`bill-tab ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  Tất cả
                </div>
                <div 
                  className={`bill-tab ${activeTab === 'unpaid' ? 'active' : ''}`}
                  onClick={() => setActiveTab('unpaid')}
                >
                  Chưa thanh toán
                </div>
                <div 
                  className={`bill-tab ${activeTab === 'paid' ? 'active' : ''}`}
                  onClick={() => setActiveTab('paid')}
                >
                  Đã thanh toán
                </div>
                <div 
                  className={`bill-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cancelled')}
                >
                  Đã hủy
                </div>
              </div>
              
              {loading ? (
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : getFilteredBills().length === 0 ? (
                <div className="no-bills">
                  <i className="fas fa-file-invoice"></i>
                  <p>Không có hóa đơn nào.</p>
                </div>
              ) : (
                <div className="bill-list">
                  {getFilteredBills().map(bill => (
                    <div key={bill.billId} className="bill-card">
                      <div className="bill-header">
                        <div className="bill-id">Mã hóa đơn: #{bill.billId}</div>
                        <div className={`bill-status ${bill.status.toLowerCase()}`}>
                          {bill.status === 'PAID' ? 'Đã thanh toán' :
                           bill.status === 'UNPAID' ? 'Chưa thanh toán' :
                           'Đã hủy'}
                        </div>
                      </div>
                      <div className="bill-body">
                        <div className="bill-info">
                          <div className="bill-row">
                            <div className="bill-label">Mã đặt sân:</div>
                            <div className="bill-value">{bill.stadiumBookingId}</div>
                          </div>
                          <div className="bill-row">
                            <div className="bill-label">Ngày tạo:</div>
                            <div className="bill-value">{formatDateTime(bill.dateCreated)}</div>
                          </div>
                          {bill.status === 'PAID' && (
                            <div className="bill-row">
                              <div className="bill-label">Ngày thanh toán:</div>
                              <div className="bill-value">{formatDateTime(bill.datePaid)}</div>
                            </div>
                          )}
                          <div className="bill-row">
                            <div className="bill-label">Phương thức thanh toán:</div>
                            <div className="bill-value">
                              {getPaymentMethodName(bill.paymentMethodId)}
                            </div>
                          </div>
                          <div className="bill-price">
                            Tổng tiền: {bill.finalPrice.toLocaleString()} VNĐ
                          </div>
                        </div>
                      </div>
                      <div className="bill-actions">
                        <Link to={`/booking/${bill.stadiumBookingId}`} className="bill-button detail-button">
                          Xem chi tiết
                        </Link>
                        {bill.status === 'UNPAID' && (
                          <button 
                            className="bill-button pay-button"
                            onClick={() => handlePayment(bill)}
                          >
                            Thanh toán
                          </button>
                        )}
                        {bill.status === 'UNPAID' && (
                          <button className="bill-button cancel-button">
                            Hủy hóa đơn
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modal thanh toán */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h2>Thanh toán hóa đơn</h2>
              <button className="modal-close" onClick={handleClosePaymentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="payment-modal-body">
              <div className="payment-summary">
                <div className="payment-row">
                  <div>Mã hóa đơn:</div>
                  <div>#{selectedBill?.billId}</div>
                </div>
                <div className="payment-row">
                  <div>Mã đặt sân:</div>
                  <div>{selectedBill?.stadiumBookingId}</div>
                </div>
                <div className="payment-row total">
                  <div>Tổng tiền:</div>
                  <div>{selectedBill?.finalPrice.toLocaleString()} VNĐ</div>
                </div>
              </div>
              
              <div className="payment-methods">
                <h3>Chọn phương thức thanh toán</h3>
                <div className="payment-method-options">
                  {paymentMethods.map(method => (
                    <div 
                      key={method.paymentMethodId}
                      className={`payment-method-option ${selectedPaymentMethod === method.paymentMethodId ? 'selected' : ''}`}
                      onClick={() => handleSelectPaymentMethod(method.paymentMethodId)}
                    >
                      <input 
                        type="radio"
                        checked={selectedPaymentMethod === method.paymentMethodId}
                        onChange={() => {}}
                      />
                      <span className="payment-method-name">{method.paymentMethodName}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="payment-button"
                onClick={handlePayBill}
                disabled={!selectedPaymentMethod}
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default BillPage;