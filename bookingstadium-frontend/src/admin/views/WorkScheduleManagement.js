import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
  CRow,
  CCol,
  CInputGroup,
  CFormInput,
  CButton,
} from '@coreui/react';
import { workScheduleAPI, locationAPI } from '../services/adminApi';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilX } from '@coreui/icons';

const WorkScheduleManagement = () => {
  // State
  const [workSchedules, setWorkSchedules] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Danh sách các ngày trong tuần
  const daysOfWeek = [
    { value: 'MONDAY', label: 'Thứ Hai' },
    { value: 'TUESDAY', label: 'Thứ Ba' },
    { value: 'WEDNESDAY', label: 'Thứ Tư' },
    { value: 'THURSDAY', label: 'Thứ Năm' },
    { value: 'FRIDAY', label: 'Thứ Sáu' },
    { value: 'SATURDAY', label: 'Thứ Bảy' },
    { value: 'SUNDAY', label: 'Chủ Nhật' },
  ];

  // Lấy danh sách lịch làm việc
  const fetchWorkSchedules = async () => {
    setLoading(true);
    try {
      const response = await workScheduleAPI.getAllWorkSchedules();
      
      let scheduleList = [];
      
      if (response.data) {
        if (response.data.result && Array.isArray(response.data.result)) {
          scheduleList = response.data.result;
        } else if (Array.isArray(response.data)) {
          scheduleList = response.data;
        }
      }
      
      setWorkSchedules(scheduleList);
      
      // Lấy thông tin về các địa điểm
      await fetchLocations();
      
    } catch (err) {
      setError('Không thể tải dữ liệu lịch làm việc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách địa điểm
  const fetchLocations = async () => {
    try {
      const response = await locationAPI.getAllLocations();
      const locationList = response.data.result || response.data || [];
      
      const locationMap = {};
      locationList.forEach(location => {
        if (location && location.id) {
          locationMap[location.id] = location;
        }
      });
      
      setLocations(locationMap);
    } catch (err) {
      // Xử lý lỗi im lặng
    }
  };

  // Lấy tên địa điểm từ ID
  const getLocationName = (locationId) => {
    if (!locationId) return 'N/A';
    const location = locations[locationId];
    return location ? location.name || locationId : locationId;
  };

  // Định dạng thời gian
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    // Nếu đã ở dạng HH:MM:SS, trả về dạng HH:MM
    if (timeStr.includes(':')) {
      return timeStr.substring(0, 5);
    }
    return timeStr;
  };

  // Hiển thị các ngày trong tuần
  const formatDays = (days) => {
    if (!days || !Array.isArray(days)) return 'N/A';
    
    const dayNames = days.map(day => {
      const foundDay = daysOfWeek.find(d => d.value === day);
      return foundDay ? foundDay.label : day;
    });
    
    return dayNames.join(', ');
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredSchedules = workSchedules.filter(schedule => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      String(schedule.workScheduleId || '').toLowerCase().includes(searchLower) ||
      getLocationName(schedule.locationId).toLowerCase().includes(searchLower) ||
      formatDays(schedule.dayOfTheWeek).toLowerCase().includes(searchLower)
    );
  });
  
  // Tính toán chỉ số cho phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchedules = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);

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

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchWorkSchedules();
  }, []);

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Quản lý lịch làm việc</strong>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
              {error}
            </CAlert>
          )}

          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CFormInput
                  placeholder="Tìm kiếm theo ID, địa điểm, ngày làm việc..."
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
                {filteredSchedules.length > 0 ? (
                  <>Hiển thị {Math.min(filteredSchedules.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredSchedules.length)} của {filteredSchedules.length} mục</>
                ) : (
                  <>Không có dữ liệu</>
                )}
              </small>
              <CButton 
                color="primary" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                  fetchWorkSchedules();
                }}
              >
                Làm mới
              </CButton>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center">
              <CSpinner />
            </div>
          ) : (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Địa điểm</CTableHeaderCell>
                    <CTableHeaderCell>Ngày làm việc</CTableHeaderCell>
                    <CTableHeaderCell>Giờ mở cửa</CTableHeaderCell>
                    <CTableHeaderCell>Giờ đóng cửa</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentSchedules.length > 0 ? (
                    currentSchedules.map((schedule, index) => (
                      <CTableRow key={`schedule-${schedule.workScheduleId || index}`}>
                        <CTableDataCell>
                          <small>{schedule.workScheduleId || 'N/A'}</small>
                        </CTableDataCell>
                        <CTableDataCell>{getLocationName(schedule.locationId)}</CTableDataCell>
                        <CTableDataCell>{formatDays(schedule.dayOfTheWeek)}</CTableDataCell>
                        <CTableDataCell>{formatTime(schedule.openingHours)}</CTableDataCell>
                        <CTableDataCell>{formatTime(schedule.closingHours)}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center">
                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Không có dữ liệu lịch làm việc'}
                      </CTableDataCell>
                    </CTableRow>
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
    </>
  );
};

export default WorkScheduleManagement; 