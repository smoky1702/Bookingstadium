import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CAlert,
  CCol,
  CRow,
  CInputGroup,
  CBadge,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilInfo, cilTrash, cilX } from '@coreui/icons';
import { billAPI, userAPI, bookingAPI } from '../services/adminApi';

const BillManagement = () => {
  const [bills, setBills] = useState([]);
  const [users, setUsers] = useState({}); // Lưu trữ thông tin người dùng theo ID
  const [bookings, setBookings] = useState({}); // Lưu trữ thông tin đặt sân theo ID
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ show: false, color: 'success', message: '' });
  
  // Thêm state cho sắp xếp
  const [sortField, setSortField] = useState('dateCreated');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' hoặc 'desc'
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchBills();
    fetchAllUsers();
  }, []);

  // Fetch tất cả người dùng
  const fetchAllUsers = async () => {
    try {
      setUserLoading(true);
      const response = await userAPI.getAllUsers();
    //   console.log("All users response:", response);
      
      if (response.data && Array.isArray(response.data.result)) {
        const usersData = response.data.result;
        
        // Chuyển đổi mảng thành object với key là userId
        const usersMap = {};
        usersData.forEach(user => {
          if (user.userId) {
            usersMap[user.userId] = user;
          }
        });
        
    //     console.log("Users map created:", usersMap);
        setUsers(usersMap);
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await billAPI.getAllBills();
      const billsData = response.data?.result || [];
    //   console.log('Bills data:', billsData);
      
      // Extract unique userIds và bookingIds
      const userIds = [...new Set(billsData.map(bill => bill.userId))].filter(Boolean);
      const bookingIds = [...new Set(billsData.map(bill => bill.stadiumBookingId))].filter(Boolean);
      
    //   console.log('Unique userIds from bills:', userIds);
    //   console.log('Unique bookingIds from bills:', bookingIds);
      
      setBills(billsData);
      setError(null);
      
      // Tải thông tin người dùng và booking nếu chưa có
      fetchMissingUsers(userIds);
      fetchMissingBookings(bookingIds);
    } catch (err) {
        console.error('Error fetching bills:', err);
      setError('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };
  
  // Tải thông tin người dùng còn thiếu
  const fetchMissingUsers = async (userIds) => {
    if (!userIds || userIds.length === 0) return;
    
    try {
      setUserLoading(true);
      for (const userId of userIds) {
        // Chỉ tải nếu chưa có trong state
        if (!users[userId]) {
          try {
            //   console.log(`Fetching missing user data for ${userId}`);
            const response = await userAPI.getUserById(userId);
            
            if (response.data && response.data.result) {
              const userData = response.data.result;
            //   console.log(`User data for ${userId}:`, userData);
              
              setUsers(prev => ({
                ...prev,
                [userId]: userData
              }));
            }
          } catch (error) {
            // console.error(`Error fetching user ${userId}:`, error);
          }
        }
      }
    } catch (err) {
      // console.error('Error in fetchMissingUsers:', err);
    } finally {
      setUserLoading(false);
    }
  };
  
  // Tải thông tin đặt sân còn thiếu
  const fetchMissingBookings = async (bookingIds) => {
    if (!bookingIds || bookingIds.length === 0) return;
    
    try {
      for (const bookingId of bookingIds) {
        // Chỉ tải nếu chưa có trong state
        if (!bookings[bookingId]) {
          try {
            //   console.log(`Fetching booking data for ${bookingId}`);
            const response = await bookingAPI.getBookingById(bookingId);
            
            if (response.data && response.data.result) {
              const bookingData = response.data.result;
            //   console.log(`Booking data for ${bookingId}:`, bookingData);
              
              setBookings(prev => ({
                ...prev,
                [bookingId]: bookingData
              }));
            }
          } catch (error) {
            // console.error(`Error fetching booking ${bookingId}:`, error);
          }
        }
      }
    } catch (err) {
      // console.error('Error in fetchMissingBookings:', err);
    }
  };
  
  // Lấy thông tin người dùng từ userId
  const getUserInfo = (userId) => {
    if (!userId) return 'N/A';
    
    const user = users[userId];
    // console.log(`Getting user info for ${userId}:`, user);
    
    if (user) {
      // Kiểm tra các trường thông tin người dùng có thể có
      if (user.fullName) return user.fullName;
      if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
      if (user.firstname && user.lastname) return `${user.firstname} ${user.lastname}`;
      if (user.username) return user.username;
      if (user.email) return user.email;
    }
    
    return `Người dùng ${userId.substring(0, 8)}`;
  };

  const showBillDetail = async (bill) => {
    setSelectedBill(bill);
    
    // Tải thông tin người dùng nếu chưa có
    if (bill.userId && !users[bill.userId]) {
      try {
        const response = await userAPI.getUserById(bill.userId);
        
        if (response.data && response.data.result) {
          setUsers(prev => ({
            ...prev,
            [bill.userId]: response.data.result
          }));
        }
      } catch (error) {
        console.error(`Error fetching user detail for ${bill.userId}:`, error);
      }
    }
    
    // Tải thông tin đặt sân nếu chưa có
    if (bill.stadiumBookingId && !bookings[bill.stadiumBookingId]) {
      try {
        const response = await bookingAPI.getBookingById(bill.stadiumBookingId);
        
        if (response.data && response.data.result) {
          const bookingData = response.data.result;
          
          setBookings(prev => ({
            ...prev,
            [bill.stadiumBookingId]: bookingData
          }));
        }
      } catch (error) {
        console.error(`Error fetching booking detail for ${bill.stadiumBookingId}:`, error);
      }
    }
    
    setShowDetailModal(true);
  };

  const showDeleteBillModal = (bill) => {
    setSelectedBill(bill);
    setShowDeleteModal(true);
  };

  const handleDeleteBill = async () => {
    if (!selectedBill) return;
    
    try {
      setLoading(true);
      await billAPI.deleteBill(selectedBill.billId);
      
      // Tải lại danh sách sau khi xóa
      await fetchBills();
      
      // Đóng modal và hiển thị thông báo
      setShowDeleteModal(false);
      setAlert({
        show: true,
        color: 'success',
        message: 'Xóa hóa đơn thành công'
      });
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 3000);
    } catch (err) {
      // console.error('Error deleting bill:', err);
      setAlert({
        show: true,
        color: 'danger',
        message: 'Không thể xóa hóa đơn. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format ngày theo định dạng "DD-MM-YYYY"
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Lấy tên trạng thái từ mã
  const getStatusName = (status) => {
    if (!status) return 'N/A';
    
    // Nếu status đã là text tiếng Việt thì trả về luôn
    if (status === 'Chờ thanh toán' || status === 'Đã thanh toán' || status === 'Đã hủy') {
      return status;
    }
    
    switch (status) {
      case 'UNPAID':
        return 'Chờ thanh toán';
      case 'PAID':
        return 'Đã thanh toán';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Lấy màu cho badge trạng thái
  const getStatusColor = (status) => {
    if (!status) return 'secondary';
    
    // Xử lý theo text tiếng Việt
    if (status === 'Chờ thanh toán') return 'warning';
    if (status === 'Đã thanh toán') return 'success';
    if (status === 'Đã hủy') return 'danger';
    
    // Xử lý theo mã
    switch (status) {
      case 'UNPAID':
        return 'warning';
      case 'PAID':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Lấy tên trường hiển thị cho việc sắp xếp
  const getSortFieldName = (field) => {
    switch (field) {
      case 'billId':
        return 'ID hóa đơn';
      case 'userId':
        return 'Người dùng';
      case 'stadiumBookingId':
        return 'ID đặt sân';
      case 'dateCreated':
        return 'Ngày tạo';
      case 'finalPrice':
        return 'Tổng tiền';
      case 'status':
        return 'Trạng thái';
      default:
        return field;
    }
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredBills = bills.filter(bill => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Tìm kiếm theo ID, tên người dùng, trạng thái, email
    return (
      String(bill.billId || '').toLowerCase().includes(searchLower) ||
      String(bill.userId || '').toLowerCase().includes(searchLower) ||
      String(bill.stadiumBookingId || '').toLowerCase().includes(searchLower) ||
      getStatusName(bill.status).toLowerCase().includes(searchLower)
    );
  });
  
  // Hàm sắp xếp dữ liệu
  const handleSort = (field) => {
    // Nếu click vào field đang sắp xếp, đảo ngược hướng sắp xếp
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nếu click vào field mới, đặt field đó làm sortField và hướng sắp xếp là desc
      setSortField(field);
      setSortDirection('desc');
    }
    
    // Reset về trang đầu tiên khi thay đổi sắp xếp
    setCurrentPage(1);
  };
  
  // Sắp xếp dữ liệu sau khi lọc
  const sortedBills = [...filteredBills].sort((a, b) => {
    let aValue, bValue;
    
    // Xác định giá trị để sắp xếp dựa vào field
    switch (sortField) {
      case 'dateCreated':
        aValue = new Date(a.dateCreated || a.date_created || 0).getTime();
        bValue = new Date(b.dateCreated || b.date_created || 0).getTime();
        break;
      case 'finalPrice':
        aValue = Number(a.finalPrice || a.totalPrice || 0);
        bValue = Number(b.finalPrice || b.totalPrice || 0);
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'userId':
        aValue = getUserInfo(a.userId) || '';
        bValue = getUserInfo(b.userId) || '';
        break;
      default:
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
    }
    
    // So sánh và sắp xếp
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
  
  // Tính toán chỉ số cho phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = sortedBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedBills.length / itemsPerPage);

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Tạo mảng các trang
  const renderPaginationItems = () => {
    const items = [];
    
    // Luôn hiển thị nút trang đầu tiên
    items.push(
      <CPaginationItem 
        key="first" 
        active={currentPage === 1} 
        onClick={() => handlePageChange(1)}
      >
        1
      </CPaginationItem>
    );
    
    // Hiển thị dấu '...' nếu trang hiện tại > 3
    if (currentPage > 3) {
      items.push(<CPaginationItem key="ellipsis1">...</CPaginationItem>);
    }
    
    // Hiển thị các trang xung quanh trang hiện tại
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue;
      items.push(
        <CPaginationItem 
          key={i} 
          active={currentPage === i}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </CPaginationItem>
      );
    }
    
    // Hiển thị dấu '...' nếu trang hiện tại < totalPages - 2
    if (currentPage < totalPages - 2) {
      items.push(<CPaginationItem key="ellipsis2">...</CPaginationItem>);
    }
    
    // Hiển thị nút trang cuối cùng nếu có nhiều hơn 1 trang
    if (totalPages > 1) {
      items.push(
        <CPaginationItem 
          key="last" 
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </CPaginationItem>
      );
    }
    
    return items;
  };

  // Hàm kiểm tra role hiện tại
  const getCurrentRole = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Có thể là 'role' hoặc 'authorities' hoặc 'scope' tùy backend
      if (payload.role) return payload.role;
      if (payload.authorities && Array.isArray(payload.authorities)) return payload.authorities[0];
      if (payload.scope) return payload.scope;
      return null;
    } catch {
      return null;
    }
  };

  const currentRole = getCurrentRole();

  // Lấy biểu tượng sắp xếp
  const getSortIcon = (field) => {
    if (field !== sortField) return null;
    
    return (
      <span className={`ms-1 text-${sortDirection === 'asc' ? 'primary' : 'danger'}`}>
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  // Lấy kiểu cho header sắp xếp
  const getSortHeaderStyle = (field) => {
    return { 
      cursor: 'pointer',
      backgroundColor: sortField === field ? '#f8f9fa' : 'inherit',
      transition: 'background-color 0.2s',
      userSelect: 'none'
    };
  };

  return (
    <>
      {alert.show && (
        <CAlert color={alert.color} dismissible className="fade show">
          {alert.message}
        </CAlert>
      )}
      
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Quản lý hóa đơn</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CFormInput
                  placeholder="Tìm kiếm theo ID, người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
                />
                {searchTerm && (
                  <CButton 
                    color="secondary" 
                    onClick={() => setSearchTerm('')}
                    title="Xóa tìm kiếm"
                  >
                    <CIcon icon={cilX} />
                  </CButton>
                )}
                <CButton color="primary" type="button" onClick={() => setCurrentPage(1)}>
                  <CIcon icon={cilSearch} />
                </CButton>
              </CInputGroup>
            </CCol>
            <CCol md={6} className="text-end">
              <small className="text-muted me-3">
                {filteredBills.length > 0 ? (
                  <>Hiển thị {Math.min(filteredBills.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredBills.length)} của {filteredBills.length} mục</>
                ) : (
                  <>Không có dữ liệu</>
                )}
              </small>
              {sortField && (
                <small className="text-muted me-3">
                  Sắp xếp theo: {getSortFieldName(sortField)} ({sortDirection === 'asc' ? 'tăng dần' : 'giảm dần'})
                </small>
              )}
              <CButton 
                color="primary" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setSortField('dateCreated');
                  setSortDirection('desc');
                  setCurrentPage(1);
                  fetchBills();
                }}
              >
                Làm mới
              </CButton>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center p-3">
              <CSpinner />
            </div>
          ) : error ? (
            <div className="text-danger p-3">{error}</div>
          ) : (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell 
                      onClick={() => handleSort('billId')} 
                      style={getSortHeaderStyle('billId')}
                    >
                      ID hóa đơn {getSortIcon('billId')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('userId')} 
                      style={getSortHeaderStyle('userId')}
                    >
                      Người dùng {getSortIcon('userId')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('stadiumBookingId')} 
                      style={getSortHeaderStyle('stadiumBookingId')}
                    >
                      ID đặt sân {getSortIcon('stadiumBookingId')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('dateCreated')} 
                      style={getSortHeaderStyle('dateCreated')}
                    >
                      Ngày tạo {getSortIcon('dateCreated')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('finalPrice')} 
                      style={getSortHeaderStyle('finalPrice')}
                    >
                      Tổng tiền {getSortIcon('finalPrice')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('status')} 
                      style={getSortHeaderStyle('status')}
                    >
                      Trạng thái {getSortIcon('status')}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentBills.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={7} className="text-center">
                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Không có hóa đơn nào.'}
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    currentBills.map((bill) => (
                      <CTableRow key={bill.billId}>
                        <CTableDataCell>{bill.billId}</CTableDataCell>
                        <CTableDataCell>{getUserInfo(bill.userId)}</CTableDataCell>
                        <CTableDataCell>
                          {bill.stadiumBookingId ? (
                            <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {bill.stadiumBookingId}
                            </div>
                          ) : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{formatDateTime(bill.dateCreated)}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(bill.finalPrice || bill.totalPrice || 0)}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getStatusColor(bill.status)}>
                            {getStatusName(bill.status)}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton color="info" size="sm" className="me-1" onClick={() => showBillDetail(bill)}>
                            <CIcon icon={cilInfo} />
                          </CButton>
                          {currentRole === 'ADMIN' && (
                            <CButton color="danger" size="sm" onClick={() => showDeleteBillModal(bill)}>
                              <CIcon icon={cilTrash} />
                            </CButton>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>

              {/* Hiển thị phân trang nếu có nhiều hơn 1 trang */}
              {totalPages > 1 && (
                <CPagination className="justify-content-center" aria-label="Page navigation">
                  <CPaginationItem 
                    aria-label="Previous" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </CPaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <CPaginationItem 
                    aria-label="Next" 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </CPaginationItem>
                </CPagination>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Modal xem chi tiết hóa đơn */}
      <CModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Chi tiết hóa đơn</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedBill && (
            <div>
              <CRow className="mb-3">
                <CCol md={4}><strong>ID:</strong></CCol>
                <CCol md={8}>{selectedBill?.billId}</CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}><strong>Người dùng:</strong></CCol>
                <CCol md={8}>{getUserInfo(selectedBill?.userId)}</CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}><strong>Ngày tạo:</strong></CCol>
                <CCol md={8}>{formatDateTime(selectedBill?.dateCreated)}</CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}><strong>Tổng tiền:</strong></CCol>
                <CCol md={8}>{formatCurrency(selectedBill?.finalPrice)}</CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}><strong>Phương thức thanh toán:</strong></CCol>
                <CCol md={8}>ID: {selectedBill?.paymentMethodId || 'N/A'}</CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}><strong>Trạng thái:</strong></CCol>
                <CCol md={8}>
                  <CBadge color={getStatusColor(selectedBill?.status)}>
                    {getStatusName(selectedBill?.status)}
                  </CBadge>
                </CCol>
              </CRow>
              
              {selectedBill?.stadiumBookingId && (
                <>
                  <hr />
                  <h5>Chi tiết đặt sân</h5>
                  <CRow className="mb-3">
                    <CCol md={4}><strong>ID đặt sân:</strong></CCol>
                    <CCol md={8}>{selectedBill?.stadiumBookingId}</CCol>
                  </CRow>
                  
                  <CTable small>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Ngày đặt</CTableHeaderCell>
                        <CTableHeaderCell>Thời gian</CTableHeaderCell>
                        <CTableHeaderCell>Giá</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      <CTableRow>
                        <CTableDataCell>
                          {bookings[selectedBill.stadiumBookingId]?.dateOfBooking 
                            ? formatDateTime(bookings[selectedBill.stadiumBookingId].dateOfBooking).split(',')[0]
                            : bookings[selectedBill.stadiumBookingId]?.date_of_booking
                            ? formatDateTime(bookings[selectedBill.stadiumBookingId].date_of_booking).split(',')[0]
                            : formatDateTime(selectedBill.dateCreated).split(',')[0]}
                        </CTableDataCell>
                        <CTableDataCell>
                          {(bookings[selectedBill.stadiumBookingId]?.startTime || bookings[selectedBill.stadiumBookingId]?.start_time || 'N/A')} 
                          - 
                          {(bookings[selectedBill.stadiumBookingId]?.endTime || bookings[selectedBill.stadiumBookingId]?.end_time || 'N/A')}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatCurrency(selectedBill.finalPrice)}
                        </CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal xóa hóa đơn */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa hóa đơn này?
          <p className="text-danger mt-2">
            <strong>Lưu ý:</strong> Thao tác này không thể hoàn tác và có thể ảnh hưởng đến dữ liệu đặt sân.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteBill} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Xóa'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default BillManagement; 