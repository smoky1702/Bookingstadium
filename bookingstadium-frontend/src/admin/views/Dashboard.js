import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

/**
 * Dashboard Component - Hiển thị tổng quan hệ thống
 */
const Dashboard = () => {
  // States
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyBookings, setMonthlyBookings] = useState(Array(12).fill(0));
  const [bookingStatusData, setBookingStatusData] = useState({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  // Lấy tháng hiện tại để hiển thị mặc định
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2025); // Mặc định là năm 2025

  // Constants
  const MONTHS = useMemo(() => ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                               'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'], []);
  const YEARS = useMemo(() => [2025, 2026], []);
  
  // Ánh xạ trạng thái đặt sân sang tiếng Việt và màu sắc
  const bookingStatusMap = useMemo(() => ({
    'PENDING': { text: 'Chờ xác nhận', color: 'warning' },
    'CONFIRMED': { text: 'Đã xác nhận', color: 'success' },
    'CANCELLED': { text: 'Đã hủy', color: 'danger' },
    'COMPLETED': { text: 'Hoàn thành', color: 'info' }
  }), []);

  /**
   * Hàm xử lý khi thay đổi tháng
   */
  const handleMonthChange = useCallback((newMonth) => {
    setSelectedMonth(newMonth);
  }, []);

  /**
   * Hàm xử lý khi thay đổi năm
   */
  const handleYearChange = useCallback((newYear) => {
    setSelectedYear(newYear);
  }, []);

  /**
   * Hàm định dạng ngày giờ
   */
  const formatDateTime = useCallback((dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, []);
  
  /**
   * Hàm định dạng tiền tệ
   */
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  }, []);

  /**
   * Hàm lấy doanh thu và thống kê trạng thái theo tháng/năm đã chọn
   */
  const fetchRevenueAndStatusData = useCallback(async () => {
    try {
      // Lấy dữ liệu hóa đơn
      const billResponse = await billAPI.getAllBills();
      const bills = billResponse.data?.result || [];
      
      // Lọc hóa đơn theo tháng đã chọn
      const paidBillsThisMonth = bills.filter(bill => {
        // Kiểm tra trạng thái thanh toán
        const isPaid = bill.status === 'PAID';
        
        // Kiểm tra tháng thanh toán
        let billDate;
        if (bill.datePaid) {
          billDate = new Date(bill.datePaid);
        } else if (bill.date_paid) {
          billDate = new Date(bill.date_paid);
        } else {
          billDate = new Date(bill.dateCreated || bill.date_created);
        }
        
        const isSameMonth = billDate.getMonth() === selectedMonth && 
                           billDate.getFullYear() === selectedYear;
        
        return isPaid && isSameMonth;
      });
      
      // Tính tổng doanh thu (admin lấy 20% từ mỗi đơn hàng)
      const totalRev = paidBillsThisMonth.reduce((sum, bill) => {
        const billValue = bill.finalPrice || bill.final_price || bill.amount || bill.total || 0;
        const adminCommission = billValue * 0.2; // Admin lấy 20%
        return sum + adminCommission;
      }, 0);
      
      setTotalRevenue(totalRev);

      // Lấy danh sách đặt sân
      const bookingResponse = await bookingAPI.getAllBookings();
      const bookings = bookingResponse.data?.result || [];
      
      // Lọc bookings theo tháng đã chọn
      const bookingsThisMonth = bookings.filter(booking => {
        const bookingDate = new Date(booking.dateCreated || booking.dateOfBooking);
        return bookingDate.getMonth() === selectedMonth && 
               bookingDate.getFullYear() === selectedYear;
      });
      
      // Đếm số lượng theo trạng thái
      const statusCounts = bookingsThisMonth.reduce((counts, booking) => {
        const status = booking.status || 'PENDING';
        counts[status.toLowerCase()] = (counts[status.toLowerCase()] || 0) + 1;
        return counts;
      }, { pending: 0, confirmed: 0, cancelled: 0, completed: 0 });
      
      setBookingStatusData(statusCounts);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
    }
  }, [selectedMonth, selectedYear]);

  /**
   * Lấy dữ liệu dashboard khi component mount hoặc khi thay đổi năm
   */
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
        
        // Tính toán dữ liệu cho biểu đồ theo tháng cho năm được chọn
        const monthlyData = Array(12).fill(0);
        const bookingsInSelectedYear = bookings.filter(booking => {
          const bookingDate = new Date(booking.dateCreated || booking.dateOfBooking);
          return bookingDate.getFullYear() === selectedYear;
        });
        
        // Tổng số đặt sân trong năm được chọn
        setBookingCount(bookingsInSelectedYear.length);
        
        bookingsInSelectedYear.forEach(booking => {
          const bookingDate = new Date(booking.dateCreated || booking.dateOfBooking);
          if (!isNaN(bookingDate.getTime())) {
            // Cập nhật đặt sân theo tháng
            const month = bookingDate.getMonth();
            monthlyData[month]++;
          }
        });
        
        setMonthlyBookings(monthlyData);
        
        // Lấy 5 đơn đặt sân gần nhất
        const sortedBookings = [...bookings]
          .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
          .slice(0, 5);
        setRecentBookings(sortedBookings);
        
        // Lấy phương thức thanh toán
        try {
          const paymentResponse = await paymentMethodAPI.getPaymentMethods();
          const methods = paymentResponse.data?.result || [];
          setPaymentMethods(methods);
        } catch (err) {
          console.error('Error fetching payment methods:', err);
        }
        
        // Cập nhật dữ liệu theo tháng đã chọn
        await fetchRevenueAndStatusData();
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [selectedYear, fetchRevenueAndStatusData]);

  /**
   * Cập nhật dữ liệu theo tháng được chọn
   */
  useEffect(() => {
    if (!loading) {
      fetchRevenueAndStatusData();
    }
  }, [selectedMonth, loading, fetchRevenueAndStatusData]);

  /**
   * Component chọn tháng và năm
   */
  const TimeSelector = () => (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div>
        <CButtonGroup>
          {MONTHS.map((_, index) => (
            <CButton 
              key={index}
              color={selectedMonth === index ? 'primary' : 'outline-primary'} 
              onClick={() => handleMonthChange(index)}
              size="sm"
            >
              {index + 1}
            </CButton>
          ))}
        </CButtonGroup>
      </div>
      <div>
        <CButtonGroup>
          {YEARS.map(year => (
            <CButton 
              key={year}
              color={selectedYear === year ? 'primary' : 'outline-primary'} 
              onClick={() => handleYearChange(year)}
              size="sm"
            >
              {year}
            </CButton>
          ))}
        </CButtonGroup>
      </div>
    </div>
  );

  /**
   * Component hiển thị biểu đồ số lượng đặt sân theo tháng
   */
  const MonthlyBookingsChart = () => (
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
                  display: true,
                  text: `Thống kê năm ${selectedYear}`,
                  font: {
                    weight: 'bold',
                    size: 16
                  }
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
  );

  /**
   * Component hiển thị biểu đồ phân bố trạng thái đặt sân
   */
  const BookingStatusChart = () => (
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
                title: {
                  display: true,
                  text: `Thống kê tháng ${selectedMonth + 1}/${selectedYear}`,
                  font: {
                    weight: 'bold',
                    size: 16
                  }
                },
              },
              cutout: '70%',
            }}
          />
        </div>
      </CCardBody>
    </CCard>
  );

  /**
   * Component hiển thị bảng đơn đặt sân gần đây
   */
  const RecentBookingsTable = () => (
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
  );

  /**
   * Component thẻ thông tin
   */
  const InfoCard = ({ color, icon, value, label, link, linkLabel }) => (
    <CCol sm={6} lg={3}>
      <CCard className={`mb-4 text-white bg-${color}`}>
        <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
          <div>
            <div className="fs-4 fw-semibold">
              {value}
              {typeof value === 'number' && (
                <span className="fs-6 fw-normal ms-2">{label}</span>
              )}
            </div>
            <div>{typeof value === 'number' ? `Tổng số ${label}` : label}</div>
          </div>
          <div className="dropdown">
            <CIcon icon={icon} size="xl" />
          </div>
        </CCardBody>
        <CCardFooter className="pb-3">
          <CButton color="light" size="sm" className="w-100" href={link}>
            {linkLabel}
          </CButton>
        </CCardFooter>
      </CCard>
    </CCol>
  );

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Dashboard</strong> <small>Tổng quan hệ thống</small>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <>
              <CRow>
                <InfoCard 
                  color="primary"
                  icon={cilPeople}
                  value={userCount}
                  label="người dùng"
                  link="/admin/users"
                  linkLabel="Quản lý người dùng"
                />
                
                <InfoCard 
                  color="info"
                  icon={cilBasket}
                  value={bookingCount}
                  label="lượt đặt"
                  link="/admin/bookings"
                  linkLabel="Quản lý đặt sân"
                />
                
                <InfoCard 
                  color="warning"
                  icon={cilChartPie}
                  value={formatCurrency(totalRevenue)}
                  label={`Doanh thu tháng ${selectedMonth + 1}/${selectedYear}`}
                  link="/admin/bills"
                  linkLabel="Xem báo cáo"
                />
                
                <InfoCard 
                  color="danger"
                  icon={cilCreditCard}
                  value={paymentMethods.length}
                  label="phương thức"
                  link="/admin/payment-methods"
                  linkLabel="Quản lý thanh toán"
                />
              </CRow>

              {/* Bộ chọn tháng/năm */}
              <TimeSelector />
              
              {/* Biểu đồ thống kê */}
              <CRow className="mb-4">
                <CCol sm={6}>
                  <MonthlyBookingsChart />
                </CCol>
                <CCol sm={6}>
                  <BookingStatusChart />
                </CCol>
              </CRow>
              
              {/* Bảng đơn đặt sân gần đây */}
              <RecentBookingsTable />
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default Dashboard; 