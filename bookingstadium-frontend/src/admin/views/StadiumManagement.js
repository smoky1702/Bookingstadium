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
  CFormSelect,
  CInputGroup,
  CFormInput,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilSearch, 
  cilPencil, 
  cilTrash, 
  cilOptions, 
  cilFilter,
  cilX
} from '@coreui/icons';
import { stadiumAPI, typeAPI, locationAPI, imageAPI, userAPI } from '../services/adminApi';

const StadiumManagement = () => {
  const [stadiums, setStadiums] = useState([]);
  const [types, setTypes] = useState({});
  const [locations, setLocations] = useState({});
  const [images, setImages] = useState({});
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách sân
      const stadiumResponse = await stadiumAPI.getAllStadiums();
      const stadiumData = stadiumResponse.data?.result || [];
      
      // Lấy danh sách loại sân
      const typeResponse = await typeAPI.getTypes();
      const typeData = typeResponse.data?.result || [];
      const typeMap = {};
      typeData.forEach(type => {
        const typeId = type.typeId || type.type_id;
        typeMap[typeId] = type.typeName || type.type_name;
      });
      setTypes(typeMap);
      
      // Lấy danh sách địa điểm
      const locationResponse = await locationAPI.getAllLocations();
      const locationData = locationResponse.data?.result || [];
      const locationMap = {};
      locationData.forEach(location => {
        const locationId = location.locationId || location.location_id;
        locationMap[locationId] = location.locationName || location.location_name;
      });
      setLocations(locationMap);
      
      // Lấy danh sách người dùng (chủ sân)
      try {
        const userResponse = await userAPI.getAllUsers();
        const userData = userResponse.data?.result || [];
        const ownerMap = {};
        userData.forEach(user => {
          const userId = user.user_id || user.userId;
          if (userId) {
            ownerMap[userId] = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'Không xác định';
          }
        });
        setOwners(ownerMap);
        console.log('Owner map:', ownerMap);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
      
      // Lấy danh sách hình ảnh
      try {
        const imageResponse = await imageAPI.getImages();
        console.log("Image API response:", imageResponse); // Log để debug
        
        let imageData = [];
        if (imageResponse.data?.result && Array.isArray(imageResponse.data.result)) {
          imageData = imageResponse.data.result;
        } else if (imageResponse.data && Array.isArray(imageResponse.data)) {
          imageData = imageResponse.data;
        }
        
        const imageMap = {};
        imageData.forEach(image => {
          // Xác định stadiumId từ dữ liệu trả về
          const stadiumId = image.stadiumId || image.stadium_id;
          if (!stadiumId) return; // Bỏ qua nếu không có stadiumId
          
          if (!imageMap[stadiumId]) {
            imageMap[stadiumId] = [];
          }
          
          // Xử lý URL hình ảnh
          const imageUrl = image.imageUrl || image.image_url || image.url;
          if (imageUrl) {
            imageMap[stadiumId].push(imageUrl);
          }
        });
        
        console.log("Processed image map:", imageMap); // Log để debug
        setImages(imageMap);
      } catch (err) {
        console.error('Error fetching images:', err);
      }
      
      setStadiums(stadiumData);
      setError(null);
    } catch (err) {
      console.error('Error fetching stadium data:', err);
      setError('Không thể tải danh sách sân');
    } finally {
      setLoading(false);
    }
  };

  const viewStadiumDetails = (stadium) => {
    setSelectedStadium(stadium);
    setShowViewModal(true);
  };

  const getTypeName = (typeId) => {
    return types[typeId] || 'Không xác định';
  };

  const getLocationName = (locationId) => {
    return locations[locationId] || 'Không xác định';
  };

  const getOwnerName = (userId) => {
    return owners[userId] || 'Không xác định';
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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

  const getStatusBadge = (status) => {
    if (!status) return <CBadge color="secondary">Không xác định</CBadge>;
    
    switch(status) {
      case 'AVAILABLE':
        return <CBadge color="success">Có sẵn</CBadge>;
      case 'MAINTENANCE':
        return <CBadge color="warning">Bảo trì</CBadge>;
      case 'BOOKED':
        return <CBadge color="danger">Đã đặt</CBadge>;
      default:
        return <CBadge color="secondary">{status}</CBadge>;
    }
  };
  
  // Lọc dữ liệu theo từ khóa tìm kiếm và loại sân
  const filteredStadiums = stadiums.filter(stadium => {
    // Lọc theo từ khóa tìm kiếm
    const searchMatch = !searchTerm || 
      (stadium.stadiumName && stadium.stadiumName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (getLocationName(stadium.locationId).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (getTypeName(stadium.typeId).toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Lọc theo loại sân
    const typeMatch = !filterType || stadium.typeId == filterType;
    
    return searchMatch && typeMatch;
  });
  
  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStadiums = filteredStadiums.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStadiums.length / itemsPerPage);
  
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

  if (error) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Quản lý sân</strong>
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
            <strong>Quản lý sân</strong>
          </CCardHeader>
          <CCardBody>
            {/* Thanh tìm kiếm và lọc */}
            <CRow className="mb-3">
              <CCol md={6} className="mb-2 mb-md-0">
                <CInputGroup>
                  <CFormInput
                    placeholder="Tìm kiếm theo tên sân, địa điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <CButton type="button" color="primary">
                    <CIcon icon={cilSearch} />
                  </CButton>
                </CInputGroup>
              </CCol>
              <CCol md={6}>
                <CRow>
                  <CCol>
                    <CFormSelect
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="">Tất cả loại sân</option>
                      {Object.entries(types).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol xs="auto">
                    <CButton color="primary" size="sm" onClick={() => {
                      setSearchTerm('');
                      setFilterType('');
                      fetchData();
                    }}>
                      Làm mới
                    </CButton>
                  </CCol>
                </CRow>
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
                      <CTableHeaderCell scope="col">Tên sân</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Loại sân</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Địa điểm</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Giá</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Trạng thái</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Ngày tạo</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentStadiums.length > 0 ? (
                      currentStadiums.map((stadium, index) => (
                        <CTableRow key={stadium.stadiumId}>
                          <CTableHeaderCell scope="row">{indexOfFirstItem + index + 1}</CTableHeaderCell>
                          <CTableDataCell>{stadium.stadiumName}</CTableDataCell>
                          <CTableDataCell>{getTypeName(stadium.typeId)}</CTableDataCell>
                          <CTableDataCell>{getLocationName(stadium.locationId)}</CTableDataCell>
                          <CTableDataCell>{formatCurrency(stadium.price)}</CTableDataCell>
                          <CTableDataCell>{getStatusBadge(stadium.status)}</CTableDataCell>
                          <CTableDataCell>{formatDate(stadium.dateCreated)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton 
                              color="info" 
                              size="sm" 
                              className="me-2"
                              onClick={() => viewStadiumDetails(stadium)}
                            >
                              <CIcon icon={cilOptions} /> Xem
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center">
                          Không có dữ liệu sân
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <CPagination align="center" aria-label="Page navigation example">
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

      {/* Modal xem chi tiết sân */}
      <CModal 
        visible={showViewModal} 
        onClose={() => setShowViewModal(false)} 
        size="lg"
        backdrop="static"
      >
        <CModalHeader closeButton>
          <CModalTitle>Chi tiết sân</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedStadium && (
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <h5>Thông tin chung</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th style={{ width: '35%' }}>ID:</th>
                        <td>{selectedStadium.stadiumId}</td>
                      </tr>
                      <tr>
                        <th>Tên sân:</th>
                        <td>{selectedStadium.stadiumName}</td>
                      </tr>
                      <tr>
                        <th>Loại sân:</th>
                        <td>{getTypeName(selectedStadium.typeId)}</td>
                      </tr>
                      <tr>
                        <th>Địa điểm:</th>
                        <td>{getLocationName(selectedStadium.locationId || selectedStadium.location_id)}</td>
                      </tr>
                      <tr>
                        <th>Chủ sân:</th>
                        <td>
                          {selectedStadium.ownerId || selectedStadium.owner_id ? 
                            getOwnerName(selectedStadium.ownerId || selectedStadium.owner_id) : 
                            (selectedStadium.location && (selectedStadium.location.userId || selectedStadium.location.user_id) ? 
                              getOwnerName(selectedStadium.location.userId || selectedStadium.location.user_id) : 
                              'Không có thông tin')}
                        </td>
                      </tr>
                      <tr>
                        <th>Giá:</th>
                        <td>{formatCurrency(selectedStadium.price)}</td>
                      </tr>
                      <tr>
                        <th>Trạng thái:</th>
                        <td>{getStatusBadge(selectedStadium.status)}</td>
                      </tr>
                      <tr>
                        <th>Ngày tạo:</th>
                        <td>{formatDate(selectedStadium.dateCreated)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <h5>Mô tả</h5>
                  <p>{selectedStadium.description || 'Không có mô tả'}</p>
                </div>
                <div>
                  <h5>Hình ảnh</h5>
                  {images[selectedStadium.stadiumId] && images[selectedStadium.stadiumId].length > 0 ? (
                    <div className="image-gallery">
                      {images[selectedStadium.stadiumId].map((imageUrl, index) => {
                        // Xử lý URL hình ảnh
                        let fullImageUrl = imageUrl;
                        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                          fullImageUrl = `/${imageUrl}`;
                        }
                        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.includes('localhost')) {
                          fullImageUrl = `http://localhost:8080${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                        }
                        
                        return (
                          <div key={index} className="mb-2">
                            <img 
                              src={fullImageUrl} 
                              alt={`Sân ${selectedStadium.stadiumName} - ${index + 1}`} 
                              className="img-fluid rounded" 
                              style={{ maxHeight: '200px' }}
                              onError={(e) => {
                                console.error("Error loading image:", fullImageUrl);
                                e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>Không có hình ảnh</p>
                  )}
                </div>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowViewModal(false)}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default StadiumManagement; 