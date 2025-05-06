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
  CInputGroup,
  CFormInput,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilSearch, 
  cilOptions, 
  cilMap,
  cilX
} from '@coreui/icons';
import { locationAPI, userAPI, stadiumAPI } from '../services/adminApi';
import GoongMap from '../../components/GoongMap/GoongMap';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [owners, setOwners] = useState({});
  const [stadiumsCount, setStadiumsCount] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách địa điểm
      const locationResponse = await locationAPI.getAllLocations();
      console.log("Location API response:", locationResponse);
      
      let locationData = [];
      if (locationResponse.data?.result && Array.isArray(locationResponse.data.result)) {
        locationData = locationResponse.data.result;
      } else if (locationResponse.data && Array.isArray(locationResponse.data)) {
        locationData = locationResponse.data;
      }
      
      // Lấy danh sách người dùng (chủ sân)
      try {
        const userResponse = await userAPI.getAllUsers();
        const userData = userResponse.data?.result || [];
        
        const ownerMap = {};
        userData.forEach(user => {
          const userId = user.user_id || user.userId;
          if (userId) {
            ownerMap[userId] = `${user.firstname || ''} ${user.lastname || ''}`.trim();
          }
        });
        
        setOwners(ownerMap);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
      
      // Lấy số sân tại mỗi địa điểm
      try {
        const stadiumResponse = await stadiumAPI.getAllStadiums();
        const stadiumData = stadiumResponse.data?.result || [];
        
        const countMap = {};
        stadiumData.forEach(stadium => {
          const locationId = stadium.locationId || stadium.location_id;
          if (locationId) {
            countMap[locationId] = (countMap[locationId] || 0) + 1;
          }
        });
        
        setStadiumsCount(countMap);
      } catch (err) {
        console.error('Error fetching stadiums:', err);
      }
      
      setLocations(locationData);
      setError(null);
    } catch (err) {
      console.error('Error fetching location data:', err);
      setError('Không thể tải danh sách địa điểm');
    } finally {
      setLoading(false);
    }
  };

  const viewLocationDetails = (location) => {
    setSelectedLocation(location);
    setShowViewModal(true);
  };

  const getOwnerName = (userId) => {
    return owners[userId] || 'Không xác định';
  };

  const getStadiumCount = (locationId) => {
    return stadiumsCount[locationId] || 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };
  
  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredLocations = locations.filter(location => {
    return !searchTerm || 
      (location.locationName && location.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (location.city && location.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (location.district && location.district.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  
  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLocations = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  
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
    
    // Nếu hiện tại không phải trang 1 và không phải trang 2, hiển thị dấu ...
    if (currentPage > 3) {
      items.push(<CPaginationItem key="ellipsis1">...</CPaginationItem>);
    }
    
    // Hiển thị trang trước trang hiện tại
    if (currentPage > 2) {
      items.push(
        <CPaginationItem 
          key={currentPage - 1} 
          onClick={() => handlePageChange(currentPage - 1)}
        >
          {currentPage - 1}
        </CPaginationItem>
      );
    }
    
    // Hiển thị trang hiện tại (nếu không phải trang 1)
    if (currentPage !== 1 && currentPage !== totalPages) {
      items.push(
        <CPaginationItem 
          key={currentPage} 
          active
        >
          {currentPage}
        </CPaginationItem>
      );
    }
    
    // Hiển thị trang sau trang hiện tại
    if (currentPage < totalPages - 1) {
      items.push(
        <CPaginationItem 
          key={currentPage + 1} 
          onClick={() => handlePageChange(currentPage + 1)}
        >
          {currentPage + 1}
        </CPaginationItem>
      );
    }
    
    // Nếu hiện tại không gần trang cuối, hiển thị dấu ...
    if (currentPage < totalPages - 2) {
      items.push(<CPaginationItem key="ellipsis2">...</CPaginationItem>);
    }
    
    // Luôn hiển thị nút trang cuối cùng (nếu có nhiều hơn 1 trang)
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

  // Reset bản đồ khi đóng modal
  const handleCloseModal = () => {
    setShowViewModal(false);
    // Đảm bảo rằng không có bản đồ nào ở chế độ toàn màn hình
    const fullscreenOverlays = document.querySelectorAll('.fullscreen-overlay');
    fullscreenOverlays.forEach(overlay => {
      overlay.remove();
    });
  };

  if (error) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Quản lý địa điểm</strong>
            </CCardHeader>
            <CCardBody>
              <div className="alert alert-danger">{error}</div>
              <CButton color="primary" onClick={fetchData}>Thử lại</CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản lý địa điểm</strong>
          </CCardHeader>
          <CCardBody>
            {/* Thanh tìm kiếm */}
            <CRow className="mb-3">
              <CCol md={6} className="mb-2 mb-md-0">
                <CInputGroup>
                  <CFormInput
                    placeholder="Tìm kiếm theo tên, địa chỉ, thành phố, quận/huyện..."
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
                  <CButton type="button" color="primary" onClick={() => setCurrentPage(1)}>
                    <CIcon icon={cilSearch} />
                  </CButton>
                </CInputGroup>
              </CCol>
              <CCol md={6} className="text-end">
                <small className="text-muted me-3">
                  {filteredLocations.length > 0 ? (
                    <>Hiển thị {Math.min(filteredLocations.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredLocations.length)} của {filteredLocations.length} mục</>
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
                    fetchData();
                  }}
                >
                  Làm mới
                </CButton>
              </CCol>
            </CRow>

            {loading ? (
              <div className="text-center my-5">
                <CSpinner color="primary" />
                <div className="mt-2">Đang tải dữ liệu...</div>
              </div>
            ) : (
              <>
                <CTable striped responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Tên địa điểm</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Địa chỉ</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Khu vực</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Chủ sân</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Số sân</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentLocations.length > 0 ? (
                      currentLocations.map((location, index) => (
                        <CTableRow key={location.locationId}>
                          <CTableHeaderCell scope="row">{indexOfFirstItem + index + 1}</CTableHeaderCell>
                          <CTableDataCell>{location.locationName}</CTableDataCell>
                          <CTableDataCell>{location.address}</CTableDataCell>
                          <CTableDataCell>{location.district && location.city ? `${location.district}, ${location.city}` : (location.district || location.city || 'N/A')}</CTableDataCell>
                          <CTableDataCell>{getOwnerName(location.userId || location.user_id)}</CTableDataCell>
                          <CTableDataCell>{getStadiumCount(location.locationId)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton 
                              color="info" 
                              size="sm" 
                              className="me-2"
                              onClick={() => viewLocationDetails(location)}
                            >
                              <CIcon icon={cilOptions} /> Xem
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center">
                          Không có dữ liệu địa điểm
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>

                {/* Phân trang */}
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
      </CCol>

      {/* Modal xem chi tiết địa điểm */}
      <CModal 
        visible={showViewModal} 
        onClose={handleCloseModal} 
        size="lg"
        backdrop="static"
      >
        <CModalHeader closeButton>
          <CModalTitle>Chi tiết địa điểm</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedLocation && (
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <h5>Thông tin chung</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th style={{ width: '35%' }}>ID:</th>
                        <td>{selectedLocation.locationId}</td>
                      </tr>
                      <tr>
                        <th>Tên địa điểm:</th>
                        <td>{selectedLocation.locationName}</td>
                      </tr>
                      <tr>
                        <th>Chủ sân:</th>
                        <td>{getOwnerName(selectedLocation.userId || selectedLocation.user_id)}</td>
                      </tr>
                      <tr>
                        <th>Số sân:</th>
                        <td>{getStadiumCount(selectedLocation.locationId)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <h5>Địa chỉ</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th style={{ width: '35%' }}>Địa chỉ:</th>
                        <td>{selectedLocation.address}</td>
                      </tr>
                      <tr>
                        <th>Quận/Huyện:</th>
                        <td>{selectedLocation.district || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Thành phố:</th>
                        <td>{selectedLocation.city || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Tọa độ:</th>
                        <td>
                          {selectedLocation.longitude && selectedLocation.latitude 
                            ? `${selectedLocation.longitude}, ${selectedLocation.latitude}` 
                            : 'Không có thông tin'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CCol>
              <CCol xs={12} className="mt-3">
                <div>
                  <h5>Bản đồ</h5>
                  {selectedLocation.longitude && selectedLocation.latitude ? (
                    <div style={{ height: '300px', overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
                      <GoongMap
                        latitude={selectedLocation.latitude}
                        longitude={selectedLocation.longitude}
                        address={selectedLocation.address || `${selectedLocation.district || ''}, ${selectedLocation.city || ''}`}
                        locationName={selectedLocation.locationName}
                        height="300px"
                      />
                    </div>
                  ) : (
                    <p>Không có thông tin tọa độ để hiển thị bản đồ</p>
                  )}
                </div>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default LocationManagement; 