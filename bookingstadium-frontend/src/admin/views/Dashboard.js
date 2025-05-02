import React, { useState, useEffect } from 'react';
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CAlert,
} from '@coreui/react';
// Import chart.js và react-chartjs-2
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
// Loại bỏ import biểu đồ tạm thời
import CIcon from '@coreui/icons-react';
import {
  cilPeople,
  cilUserFollow,
  cilBasket,
  cilChartPie,
  cilSpeedometer,
  cilCreditCard
} from '@coreui/icons';
import { userAPI, bookingAPI, billAPI, paymentMethodAPI } from '../services/adminApi';

// Đăng ký các component cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyBookings, setMonthlyBookings] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [bookingStatusData, setBookingStatusData] = useState({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách người dùng
        const userResponse = await userAPI.getAllUsers();
        const users = userResponse.data?.result || [];
        setUserCount(users.length);
        
        // Lấy danh sách đặt sân
        const bookingResponse = await bookingAPI.getAllBookings();
        const bookings = bookingResponse.data?.result || [];
        setBookingCount(bookings.length);
        
        // Lấy 5 đơn đặt sân gần nhất
        const sortedBookings = [...bookings].sort((a, b) => {
          return new Date(b.dateCreated) - new Date(a.dateCreated);
        }).slice(0, 5);
        setRecentBookings(sortedBookings);
        
        // Tính toán dữ liệu cho biểu đồ theo tháng
        const monthlyData = Array(12).fill(0);
        let pendingCount = 0;
        let confirmedCount = 0;
        let cancelledCount = 0;
        let completedCount = 0;
        
        bookings.forEach(booking => {
          const bookingDate = new Date(booking.dateCreated || booking.dateOfBooking);
          if (!isNaN(bookingDate.getTime())) {
            // Cập nhật đặt sân theo tháng
            const month = bookingDate.getMonth();
            monthlyData[month]++;
            
            // Cập nhật trạng thái đặt sân
            switch(booking.status) {
              case 'PENDING':
                pendingCount++;
                break;
              case 'CONFIRMED':
                confirmedCount++;
                break;
              case 'CANCELLED':
                cancelledCount++;
                break;
              case 'COMPLETED':
                completedCount++;
                break;
              default:
                break;
            }
          }
        });
        
        setMonthlyBookings(monthlyData);
        setBookingStatusData({
          pending: pendingCount,
          confirmed: confirmedCount,
          cancelled: cancelledCount,
          completed: completedCount
        });
        
        // Lấy dữ liệu hóa đơn
        try {
          const billResponse = await billAPI.getAllBills();
          const bills = billResponse.data?.result || [];
          
          // Tính tổng doanh thu
          const totalRev = bills.reduce((sum, bill) => sum + (bill.totalPrice || 0), 0);
          setTotalRevenue(totalRev);
        } catch (err) {
          console.error('Error fetching bills:', err);
        }
        
        // Lấy phương thức thanh toán
        try {
          const paymentResponse = await paymentMethodAPI.getPaymentMethods();
          const methods = paymentResponse.data?.result || [];
          setPaymentMethods(methods);
        } catch (err) {
          console.error('Error fetching payment methods:', err);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Hàm định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Ánh xạ trạng thái đặt sân sang tiếng Việt và màu sắc
  const bookingStatusMap = {
    'PENDING': { text: 'Chờ xác nhận', color: 'warning' },
    'CONFIRMED': { text: 'Đã xác nhận', color: 'success' },
    'CANCELLED': { text: 'Đã hủy', color: 'danger' },
    'COMPLETED': { text: 'Hoàn thành', color: 'info' }
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Dashboard</strong> <small>Tổng quan hệ thống</small>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center p-3">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="text-danger p-3">{error}</div>
          ) : (
            <>
              <CRow>
                <CCol sm={6} lg={3}>
                  <CCard className="mb-4 text-white bg-primary">
                    <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fs-4 fw-semibold">
                          {userCount}
                          <span className="fs-6 fw-normal ms-2">
                            người dùng
                          </span>
                        </div>
                        <div>Tổng số người dùng</div>
                      </div>
                      <div className="dropdown">
                        <CIcon icon={cilPeople} size="xl" />
                      </div>
                    </CCardBody>
                    <CCardFooter className="pb-3">
                      <CButton color="light" size="sm" className="w-100" href="/admin/users">
                        Quản lý người dùng
                      </CButton>
                    </CCardFooter>
                  </CCard>
                </CCol>
                
                <CCol sm={6} lg={3}>
                  <CCard className="mb-4 text-white bg-info">
                    <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fs-4 fw-semibold">
                          {bookingCount}
                          <span className="fs-6 fw-normal ms-2">
                            lượt đặt
                          </span>
                        </div>
                        <div>Tổng số đơn đặt sân</div>
                      </div>
                      <div className="dropdown">
                        <CIcon icon={cilBasket} size="xl" />
                      </div>
                    </CCardBody>
                    <CCardFooter className="pb-3">
                      <CButton color="light" size="sm" className="w-100" href="/admin/bookings">
                        Quản lý đặt sân
                      </CButton>
                    </CCardFooter>
                  </CCard>
                </CCol>
                
                <CCol sm={6} lg={3}>
                  <CCard className="mb-4 text-white bg-warning">
                    <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fs-4 fw-semibold">
                          {formatCurrency(totalRevenue)}
                        </div>
                        <div>Doanh thu tháng này</div>
                      </div>
                      <div className="dropdown">
                        <CIcon icon={cilChartPie} size="xl" />
                      </div>
                    </CCardBody>
                    <CCardFooter className="pb-3">
                      <CButton color="light" size="sm" className="w-100" href="/admin/bills">
                        Xem báo cáo
                      </CButton>
                    </CCardFooter>
                  </CCard>
                </CCol>
                
                <CCol sm={6} lg={3}>
                  <CCard className="mb-4 text-white bg-danger">
                    <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fs-4 fw-semibold">
                          {paymentMethods.length}
                          <span className="fs-6 fw-normal ms-2">
                            phương thức
                          </span>
                        </div>
                        <div>Phương thức thanh toán</div>
                      </div>
                      <div className="dropdown">
                        <CIcon icon={cilCreditCard} size="xl" />
                      </div>
                    </CCardBody>
                    <CCardFooter className="pb-3">
                      <CButton color="light" size="sm" className="w-100" href="/admin/payment-methods">
                        Quản lý thanh toán
                      </CButton>
                    </CCardFooter>
                  </CCard>
                </CCol>
              </CRow>

              {/* Biểu đồ thống kê */}
              <CRow className="mb-4">
                <CCol sm={6}>
                  <CCard className="mb-4">
                    <CCardHeader>Số lượng đặt sân theo tháng</CCardHeader>
                    <CCardBody>
                      <div style={{ height: '300px', position: 'relative' }}>
                        <Bar
                          data={{
                            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                            datasets: [
                              {
                                label: 'Lượt đặt sân',
                                backgroundColor: '#3399ff',
                                data: monthlyBookings,
                                borderRadius: 5,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false,
                              },
                              title: {
                                display: false,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  precision: 0
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol sm={6}>
                  <CCard className="mb-4">
                    <CCardHeader>Phân bố trạng thái đặt sân</CCardHeader>
                    <CCardBody>
                      <div style={{ height: '300px', position: 'relative' }}>
                        <Doughnut
                          data={{
                            labels: ['Chờ xác nhận', 'Đã xác nhận', 'Đã hủy', 'Hoàn thành'],
                            datasets: [
                              {
                                backgroundColor: ['#f9b115', '#2eb85c', '#e55353', '#3399ff'],
                                data: [
                                  bookingStatusData.pending, 
                                  bookingStatusData.confirmed, 
                                  bookingStatusData.cancelled,
                                  bookingStatusData.completed
                                ],
                                borderWidth: 1,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                              },
                            },
                            cutout: '70%',
                          }}
                        />
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              
              {/* Bảng đơn đặt sân gần đây */}
              <CCard className="mb-4">
                <CCardHeader>
                  Đơn đặt sân gần đây
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>ID</CTableHeaderCell>
                        <CTableHeaderCell>Ngày đặt</CTableHeaderCell>
                        <CTableHeaderCell>Người đặt</CTableHeaderCell>
                        <CTableHeaderCell>Thời gian</CTableHeaderCell>
                        <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {recentBookings.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={5} className="text-center">
                            Không có đơn đặt sân nào gần đây.
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        recentBookings.map((booking) => (
                          <CTableRow key={booking.bookingId}>
                            <CTableDataCell>{booking.bookingId}</CTableDataCell>
                            <CTableDataCell>
                              {formatDateTime(booking.dateCreated)}
                            </CTableDataCell>
                            <CTableDataCell>{booking.userId}</CTableDataCell>
                            <CTableDataCell>
                              {booking.startTime} - {booking.endTime}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButton
                                color={bookingStatusMap[booking.status]?.color || 'secondary'}
                                size="sm"
                                className="px-3"
                              >
                                {bookingStatusMap[booking.status]?.text || booking.status}
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>
                </CCardBody>
                <CCardFooter>
                  <CButton color="primary" href="/admin/bookings">
                    Xem tất cả đơn đặt sân
                  </CButton>
                </CCardFooter>
              </CCard>
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default Dashboard; 