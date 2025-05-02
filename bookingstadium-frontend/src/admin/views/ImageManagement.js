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
import { imageAPI, stadiumAPI } from '../services/adminApi';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilX } from '@coreui/icons';

const ImageManagement = () => {
  // State
  const [images, setImages] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Tạo URL đầy đủ từ đường dẫn tương đối
  const getFullImageUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    
    // Nếu là URL đầy đủ (bắt đầu bằng http hoặc https), trả về nguyên bản
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    
    // Thêm base URL của backend nếu là đường dẫn tương đối
    const path = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    return `http://localhost:8080${path}`;
  };

  // Lấy danh sách hình ảnh và sân
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách sân
      let stadiumsData = [];
      let stadiumsById = {};
      
      try {
        const stadiumResponse = await stadiumAPI.getAllStadiums();
        if (stadiumResponse.data) {
          if (stadiumResponse.data.result && Array.isArray(stadiumResponse.data.result)) {
            stadiumsData = stadiumResponse.data.result;
          } else if (Array.isArray(stadiumResponse.data)) {
            stadiumsData = stadiumResponse.data;
          }
        }
        
        // Tạo map ánh xạ ID -> stadium để tìm kiếm nhanh
        stadiumsData.forEach(stadium => {
          if (stadium && stadium.id) {
            stadiumsById[String(stadium.id).trim()] = stadium;
          }
        });
      } catch (err) {
        console.error('Không thể lấy danh sách sân:', err);
      }
      
      setStadiums(stadiumsData);
      
      // Lấy danh sách hình ảnh
      let imagesList = [];
      
      try {
        const imagesResponse = await imageAPI.getImages();
        if (imagesResponse.data) {
          if (imagesResponse.data.result && Array.isArray(imagesResponse.data.result)) {
            imagesList = imagesResponse.data.result;
          } else if (Array.isArray(imagesResponse.data)) {
            imagesList = imagesResponse.data;
          }
        }
      } catch (err) {
        console.error('Không thể lấy danh sách hình ảnh:', err);
        setError('Không thể tải dữ liệu hình ảnh. Vui lòng thử lại sau.');
      }
      
      // Xử lý dữ liệu hình ảnh
      const processedImages = imagesList.map((img, index) => {
        const imageUrl = img.imageUrl || img.url || img.image;
        const stadiumId = img.stadiumId ? String(img.stadiumId).trim() : '';
        
        // Tìm tên stadium chỉ từ API
        let stadiumName = null;
        if (stadiumId && stadiumsById[stadiumId]) {
          const stadium = stadiumsById[stadiumId];
          stadiumName = stadium.name || null;
        }
        
        return {
          id: img.id || `img-${index}`,
          stadiumId,
          imageUrl,
          url: imageUrl,
          fullUrl: getFullImageUrl(imageUrl),
          stadiumName
        };
      });
      
      setImages(processedImages);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setStadiums([]); 
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredImages = images.filter(image => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      String(image.id || '').toLowerCase().includes(searchLower) ||
      String(image.stadiumId || '').toLowerCase().includes(searchLower) ||
      String(image.url || '').toLowerCase().includes(searchLower) ||
      (image.stadiumName && image.stadiumName.toLowerCase().includes(searchLower))
    );
  });
  
  // Tính toán chỉ số cho phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentImages = filteredImages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

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
    fetchData();
  }, []);

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Danh sách hình ảnh</strong>
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
                  placeholder="Tìm kiếm theo ID, stadium ID, URL..."
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
                {filteredImages.length > 0 ? (
                  <>Hiển thị {Math.min(filteredImages.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredImages.length)} của {filteredImages.length} mục</>
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
            <div className="text-center">
              <CSpinner />
            </div>
          ) : (
            <>
              {stadiums.length === 0 && (
                <CAlert color="warning" className="mb-3">
                  Chưa có dữ liệu sân.
                </CAlert>
              )}
              
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Hình ảnh</CTableHeaderCell>
                    <CTableHeaderCell style={{width: '180px'}}>Stadium ID</CTableHeaderCell>
                    <CTableHeaderCell>URL</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentImages.length > 0 ? (
                    currentImages.map((image) => (
                      <CTableRow key={`image-row-${image.id}`}>
                        <CTableDataCell>{image.id}</CTableDataCell>
                        <CTableDataCell>
                          {image.fullUrl ? (
                            <div className="image-thumbnail-container">
                              <img 
                                src={image.fullUrl} 
                                alt="Stadium" 
                                className="stadium-image-thumbnail"
                                style={{ width: '100px', height: '60px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px' }} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/100x60?text=No+Image';
                                }}
                              />
                            </div>
                          ) : (
                            <div 
                              className="no-image-placeholder" 
                              style={{ 
                                width: '100px', 
                                height: '60px', 
                                background: '#f0f0f0', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#888',
                                fontSize: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                              }}
                            >
                              Không có ảnh
                            </div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <small style={{ wordBreak: 'break-all', fontSize: '11px' }}>
                            {image.stadiumId || 'N/A'}
                          </small>
                        </CTableDataCell>
                        <CTableDataCell>
                          {image.url ? (
                            <a href={image.fullUrl} target="_blank" rel="noreferrer">
                              {image.url.length > 30 ? image.url.substring(0, 30) + '...' : image.url}
                            </a>
                          ) : (
                            <span className="text-muted">Không có URL</span>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="4" className="text-center">
                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Không có dữ liệu'}
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

              <div className="mt-3">
                <p className="text-muted">
                  <small>
                    Lưu ý: Chức năng thêm và xóa hình ảnh chỉ khả dụng trong trang quản lý của chủ sân (Owner).
                  </small>
                </p>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default ImageManagement;