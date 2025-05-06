import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormSelect,
  CInputGroup,
  CFormInput,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilOptions, cilSearch, cilFilter, cilX } from '@coreui/icons';
import { bookingAPI, userAPI, stadiumAPI, locationAPI, bookingDetailAPI, typeAPI } from '../services/adminApi';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({});
  const [users, setUsers] = useState({});
  const [stadiums, setStadiums] = useState({});
  const [locations, setLocations] = useState({});
  const [types, setTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Thêm state cho sắp xếp
  const [sortField, setSortField] = useState('dateCreated');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' hoặc 'desc'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách đặt sân
      const bookingResponse = await bookingAPI.getAllBookings();
      const bookingData = bookingResponse.data?.result || [];
      
      // Khởi tạo bookingDetailMap
      let bookingDetailMap = {};
      
      // Lấy danh sách loại sân
      try {
        const typeResponse = await typeAPI.getTypes();
        const typeData = typeResponse.data?.result || [];
        
        // Tạo map loại sân
        const typeMap = {};
        typeData.forEach(type => {
          typeMap[type.typeId] = type;
        });
        
        setTypes(typeMap);
      } catch (err) {
        console.error('Error fetching types:', err);
      }
      
      // Lấy chi tiết đặt sân
      try {
        const bookingDetailResponse = await bookingDetailAPI.getAllBookingDetails();
        const bookingDetailData = bookingDetailResponse.data?.result || [];
        
        // Tạo map với key là bookingId và value là chi tiết booking
        bookingDetailMap = {};
        bookingDetailData.forEach(detail => {
          if (detail.bookingId) {
            // Đảm bảo không ghi đè dữ liệu nếu detail đã tồn tại
            bookingDetailMap[detail.bookingId] = detail;
          }
        });
        
        setBookingDetails(bookingDetailMap);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        // Giữ bookingDetailMap là object rỗng nếu có lỗi
      }
      
      // Lấy danh sách người dùng
      try {
        const userResponse = await userAPI.getAllUsers();
        const userData = userResponse.data?.result || [];
        
        // Tạo object ánh xạ từ user_id sang thông tin user
        const userMap = {};
        userData.forEach(user => {
          userMap[user.user_id] = user;
        });
        setUsers(userMap);
      } catch (err) {
        console.error('Error fetching users:', err);
      }

      // Lấy thông tin sân và địa điểm từ API
      try {
        // Lấy danh sách địa điểm sân
        const locationResponse = await locationAPI.getAllLocations();
        const locationData = locationResponse.data?.result || [];
        
        // Tạo map địa điểm
        const locationMap = {};
        locationData.forEach(location => {
          locationMap[location.locationId] = location.locationName;
        });
        
        setLocations(locationMap);
        
        // Lấy thông tin chi tiết từng sân
        const stadiumResponse = await stadiumAPI.getAllStadiums();
        const stadiumData = stadiumResponse.data?.result || [];
        
        // Tạo map sân chi tiết
        const stadiumDetailMap = {};
        stadiumData.forEach(stadium => {
          stadiumDetailMap[stadium.stadiumId] = stadium;
        });
        
        // Tạo map tên sân và giá tiền
        const stadiumMap = {};
        
        setStadiums(stadiumMap);
        
        // Kết hợp dữ liệu từ bookings và booking details
        const combinedBookings = bookingData.map(booking => {
          const bookingDetail = bookingDetailMap[booking.bookingId] || {};
          
          // Ưu tiên sử dụng dữ liệu từ bookingDetail nếu có
          const stadiumId = bookingDetail.stadiumId || booking.stadiumId;
          const totalPrice = bookingDetail.price || booking.totalPrice;
          
          return { 
            ...booking,
            ...bookingDetail,
            stadiumId: stadiumId,
            totalPrice: totalPrice
          };
        });
        
        setBookings(combinedBookings);
        
      } catch (err) {
        console.error('Error fetching stadium/location data:', err);
        
        // Fallback: Kết hợp bookings và booking details nếu không lấy được thông tin sân
        const combinedBookings = bookingData.map(booking => {
          const bookingDetail = bookingDetailMap[booking.bookingId] || {};
          
          return { 
            ...booking,
            ...bookingDetail,
          };
        });
        
        setBookings(combinedBookings);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải danh sách đặt sân');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateBooking(bookingId, { status: newStatus });
      
      // Cập nhật state
      setBookings(bookings.map(booking => 
        booking.bookingId === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      // Đóng modal
      setShowConfirmModal(false);
      setShowCancelModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Không thể cập nhật trạng thái đặt sân');
    }
  };

  const confirmBooking = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  const cancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  // Lấy tên người dùng
  const getUserName = (userId) => {
    if (!userId) return 'N/A';
    const user = users[userId];
    if (!user) return userId;
    
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    } else if (user.email) {
      return user.email;
    }
    
    return userId;
  };

  // Lấy tên sân
  const getStadiumName = (stadiumId) => {
    if (!stadiumId) return 'N/A';
    const stadiumName = stadiums[stadiumId];
    if (stadiumName) {
      return stadiumName;
    }
    
    // Nếu không tìm thấy, hiển thị id rút gọn để dễ nhận biết
    if (stadiumId?.length > 8) {
      return `Sân ${stadiumId.substring(0, 8)}...`;
    }
    return 'Sân không xác định';
  };

  // Lấy tên loại sân
  const getTypeName = (typeId) => {
    if (!typeId) return 'Loại sân không xác định';
    
    const type = types[typeId];
    if (type && type.typeName) {
      return type.typeName;
    }
    
    return 'Loại sân không xác định';
  };
  
  // Lấy tên địa điểm
  const getLocationName = (locationId) => {
    if (!locationId) return 'Địa điểm không xác định';
    
    const locationName = locations[locationId];
    if (locationName) {
      return locationName;
    }
    
    return 'Địa điểm không xác định';
  };
  
  // Lấy tên đầy đủ của sân
  const getFullStadiumName = (booking) => {
    if (!booking) return 'N/A';
    
    // Ưu tiên lấy từ stadium map đã có
    if (booking.stadiumId && stadiums[booking.stadiumId]) {
      return stadiums[booking.stadiumId];
    }
    
    // Nếu không có trong map, tạo tên từ chi tiết
    let locationName = 'công chúa';
    if (booking.locationId) {
      locationName = getLocationName(booking.locationId);
    }
    
    let typeName = 'Loại sân không xác định';
    if (booking.typeId) {
      typeName = getTypeName(booking.typeId);
    }
    
    return `${locationName} - ${typeName}`;
  };

  // Hàm định dạng ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'N/A';
    }
  };

  // Hàm định dạng thời gian (HH:MM)
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    
    // Nếu là full datetime, extract thời gian
    if (timeStr.includes('T')) {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return 'N/A';
      
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
    
    // Nếu chỉ là format "HH:MM:SS", chỉ lấy HH:MM
    try {
      const [hour, minute] = timeStr.split(':');
      return `${hour}:${minute}`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return timeStr;
    }
  };

  // Hàm định dạng ngày giờ đầy đủ cho dateCreated
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return 'N/A';
      
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      console.error('Error formatting datetime:', e);
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

  // Lấy màu và text cho trạng thái đặt sân
  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return { color: 'warning', text: 'Chờ xác nhận' };
      case 'CONFIRMED':
        return { color: 'success', text: 'Đã xác nhận' };
      case 'CANCELLED':
        return { color: 'danger', text: 'Đã hủy' };
      case 'COMPLETED':
        return { color: 'info', text: 'Hoàn thành' };
      default:
        return { color: 'secondary', text: status || 'N/A' };
    }
  };

  // Lấy tên trường hiển thị cho việc sắp xếp
  const getSortFieldName = (field) => {
    switch (field) {
      case 'bookingId':
        return 'ID';
      case 'userId':
        return 'Người đặt';
      case 'stadiumId':
        return 'Tên sân';
      case 'dateOfBooking':
        return 'Ngày đặt';
      case 'dateCreated':
        return 'Ngày tạo';
      case 'startTime':
        return 'Thời gian sử dụng';
      case 'totalPrice':
        return 'Giá tiền';
      case 'status':
        return 'Trạng thái';
      default:
        return field;
    }
  };

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

  // Lọc đặt sân theo trạng thái
  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'ALL') return true;
    return booking.status === filterStatus;
  }).filter(booking => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.bookingId?.toString().includes(searchLower) ||
      booking.userId?.toString().includes(searchLower) ||
      (booking.user?.email || '').toLowerCase().includes(searchLower) ||
      getUserName(booking.userId).toLowerCase().includes(searchLower) ||
      getFullStadiumName(booking).toLowerCase().includes(searchLower) ||
      (booking.note || '').toLowerCase().includes(searchLower)
    );
  });
  
  // Sắp xếp dữ liệu sau khi lọc
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let aValue, bValue;
    
    // Xác định giá trị để sắp xếp dựa vào field
    switch (sortField) {
      case 'bookingId':
        aValue = a.bookingId || '';
        bValue = b.bookingId || '';
        break;
      case 'userId':
        aValue = getUserName(a.userId).toLowerCase();
        bValue = getUserName(b.userId).toLowerCase();
        break;
      case 'stadiumId':
        aValue = getFullStadiumName(a).toLowerCase();
        bValue = getFullStadiumName(b).toLowerCase();
        break;
      case 'dateOfBooking':
        aValue = new Date(a.dateOfBooking || 0).getTime();
        bValue = new Date(b.dateOfBooking || 0).getTime();
        break;
      case 'dateCreated':
        aValue = new Date(a.dateCreated || 0).getTime();
        bValue = new Date(b.dateCreated || 0).getTime();
        break;
      case 'startTime':
        aValue = a.startTime || '';
        bValue = b.startTime || '';
        break;
      case 'totalPrice':
        aValue = Number(a.totalPrice || a.price || 0);
        bValue = Number(b.totalPrice || b.price || 0);
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
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
  const currentBookings = sortedBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);

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

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol>
              <strong>Quản lý đặt sân</strong>
            </CCol>
            <CCol xs="auto">
              <CButton color="primary" size="sm" onClick={() => {
                setSearchTerm('');
                setFilterStatus('ALL');
                setSortField('dateCreated');
                setSortDirection('desc');
                setCurrentPage(1);
                fetchData();
              }}>
                Làm mới
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CFormInput
                  placeholder="Tìm kiếm..."
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
            <CCol md={6} className="d-flex justify-content-end">
              <CFormSelect
                style={{ width: '200px' }}
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="COMPLETED">Hoàn thành</option>
              </CFormSelect>
            </CCol>
          </CRow>
          
          <CRow className="mb-2">
            <CCol>
              <small className="text-muted">
                {filteredBookings.length > 0 ? (
                  <>Hiển thị {Math.min(filteredBookings.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredBookings.length)} của {filteredBookings.length} mục</>
                ) : (
                  <>Không có dữ liệu</>
                )}
              </small>
              {sortField && (
                <small className="text-muted ms-3">
                  Sắp xếp theo: {getSortFieldName(sortField)} ({sortDirection === 'asc' ? 'tăng dần' : 'giảm dần'})
                </small>
              )}
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
                      onClick={() => handleSort('bookingId')} 
                      style={getSortHeaderStyle('bookingId')}
                    >
                      ID {getSortIcon('bookingId')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('userId')} 
                      style={getSortHeaderStyle('userId')}
                    >
                      Người đặt {getSortIcon('userId')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('stadiumId')} 
                      style={getSortHeaderStyle('stadiumId')}
                    >
                      Tên sân {getSortIcon('stadiumId')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('dateOfBooking')} 
                      style={getSortHeaderStyle('dateOfBooking')}
                    >
                      Ngày đặt {getSortIcon('dateOfBooking')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('startTime')} 
                      style={getSortHeaderStyle('startTime')}
                    >
                      Thời gian sử dụng {getSortIcon('startTime')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('totalPrice')} 
                      style={getSortHeaderStyle('totalPrice')}
                    >
                      Giá tiền {getSortIcon('totalPrice')}
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
                  {currentBookings.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center">
                        {searchTerm || filterStatus !== 'ALL' ? 'Không tìm thấy kết quả phù hợp.' : 'Không có đơn đặt sân nào.'}
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    currentBookings.map((booking) => (
                      <CTableRow key={booking.bookingId}>
                        <CTableDataCell>{booking.bookingId.substring(0, 8)}...</CTableDataCell>
                        <CTableDataCell>
                          {getUserName(booking.userId)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {getFullStadiumName(booking)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {booking.dateCreated ? formatDateTime(booking.dateCreated) : formatDate(booking.dateOfBooking)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatCurrency(booking.totalPrice || booking.price)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getStatusBadge(booking.status).color}>
                            {getStatusBadge(booking.status).text}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CDropdown variant="btn-group">
                            <CButton 
                              color="primary"
                              size="sm"
                              onClick={() => viewBookingDetails(booking)}
                            >
                              Chi tiết
                            </CButton>
                            <CDropdownToggle 
                              color="primary"
                              size="sm"
                              split
                            />
                            <CDropdownMenu>
                              {booking.status === 'PENDING' && (
                                <CDropdownItem onClick={() => confirmBooking(booking)}>
                                  Xác nhận đặt sân
                                </CDropdownItem>
                              )}
                              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                <CDropdownItem onClick={() => cancelBooking(booking)}>
                                  Hủy đặt sân
                                </CDropdownItem>
                              )}
                              {booking.status === 'CANCELLED' && (
                                <CDropdownItem disabled>
                                  Đã hủy đặt sân
                                </CDropdownItem>
                              )}
                              {booking.status === 'COMPLETED' && (
                                <CDropdownItem disabled>
                                  Đã hoàn thành
                                </CDropdownItem>
                              )}
                              <CDropdownItem onClick={() => viewBookingDetails(booking)}>
                                Xem chi tiết
                              </CDropdownItem>
                            </CDropdownMenu>
                          </CDropdown>
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

      {/* Modal xem chi tiết */}
      <CModal visible={showViewModal} onClose={() => setShowViewModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Chi tiết đặt sân</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedBooking && (
            <CRow>
              <CCol md={6}>
                <p><strong>ID đặt sân:</strong> {selectedBooking.bookingId}</p>
                <p><strong>Người đặt:</strong> {getUserName(selectedBooking.userId)}</p>
                <p><strong>Tên sân:</strong> {getFullStadiumName(selectedBooking)}</p>
                <p><strong>Mã sân:</strong> {selectedBooking.stadiumId || 'N/A'}</p>
                {selectedBooking.typeId && (
                  <p><strong>Loại sân:</strong> {getTypeName(selectedBooking.typeId)}</p>
                )}
                {selectedBooking.typeId && (
                  <p><strong>Mã loại sân:</strong> {selectedBooking.typeId}</p>
                )}
              </CCol>
              <CCol md={6}>
                <p><strong>Ngày đặt:</strong> {formatDate(selectedBooking.dateOfBooking)}</p>
                <p><strong>Thời gian:</strong> {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
                <p><strong>Tổng tiền:</strong> {formatCurrency(selectedBooking.totalPrice || selectedBooking.price)}</p>
                <p><strong>Trạng thái:</strong> 
                  <CBadge color={getStatusBadge(selectedBooking.status).color} className="ms-2">
                    {getStatusBadge(selectedBooking.status).text}
                  </CBadge>
                </p>
                <p><strong>Ghi chú:</strong> {selectedBooking.note || 'Không có'}</p>
                {selectedBooking.totalHours && (
                  <p><strong>Tổng giờ:</strong> {selectedBooking.totalHours} giờ</p>
                )}
              </CCol>
              {selectedBooking.stadiumBookingDetailId && (
                <CCol xs={12} className="mt-3">
                  <p><strong>ID chi tiết đặt sân:</strong> {selectedBooking.stadiumBookingDetailId}</p>
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          {selectedBooking && selectedBooking.status === 'PENDING' && (
            <CButton color="success" onClick={() => confirmBooking(selectedBooking)}>
              Xác nhận đặt sân
            </CButton>
          )}
          {selectedBooking && (selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
            <CButton color="danger" onClick={() => cancelBooking(selectedBooking)}>
              Hủy đặt sân
            </CButton>
          )}
          <CButton color="secondary" onClick={() => setShowViewModal(false)}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal xác nhận đặt sân */}
      <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận đặt sân</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xác nhận đơn đặt sân này?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </CButton>
          <CButton color="success" onClick={() => handleUpdateStatus(selectedBooking?.bookingId, 'CONFIRMED')}>
            Xác nhận
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal hủy đặt sân */}
      <CModal visible={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <CModalHeader>
          <CModalTitle>Hủy đặt sân</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn hủy đơn đặt sân này?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCancelModal(false)}>
            Không
          </CButton>
          <CButton color="danger" onClick={() => handleUpdateStatus(selectedBooking?.bookingId, 'CANCELLED')}>
            Hủy đặt sân
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default BookingManagement; 