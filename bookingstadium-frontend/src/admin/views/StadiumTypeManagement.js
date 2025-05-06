import React, { useState, useEffect, useCallback } from 'react';
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
  CSpinner,
  CAlert,
  CCol,
  CRow,
  CInputGroup,
  CPagination,
  CPaginationItem,
  CFormSelect
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSearch, cilX } from '@coreui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { typeAPI } from '../services/adminApi';
import { 
  availableIcons, 
  availableColors,
  getTypeStyleSettings, 
  saveTypeStyleSettings, 
  getTypeIcon, 
  getTypeColor 
} from '../../utils/typeStyleUtils';

const StadiumTypeManagement = () => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    typeName: '',
    iconType: 'Bóng đá',
    customColor: getTypeColor('Bóng đá')
  });
  const [alert, setAlert] = useState({ show: false, color: 'success', message: '' });
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Thêm state lưu cài đặt giao diện
  const [typeStyleSettings, setTypeStyleSettings] = useState({});

  // Thêm dưới khai báo state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchIconTerm, setSearchIconTerm] = useState('');
  const [showAllIcons, setShowAllIcons] = useState(false);

  // Load cài đặt từ localStorage khi component mount
  useEffect(() => {
    const settings = getTypeStyleSettings();
    setTypeStyleSettings(settings);
  }, []);

  useEffect(() => {
    fetchTypes();
  }, []);

  // Tạo hàm fetchTypes sử dụng useCallback để có thể tái sử dụng
  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await typeAPI.getTypes();
      const typesData = response.data?.result || [];
      console.log('Stadium types data:', typesData);
      setTypes(typesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching stadium types:', err);
      setError('Không thể tải danh sách loại sân');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      typeName: '',
      iconType: 'Bóng đá',
      customColor: getTypeColor('Bóng đá')
    });
  };

  const showAddNewTypeModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const showEditTypeModal = (type) => {
    setSelectedType(type);
    
    // Đoán loại icon dựa vào tên hoặc cài đặt đã lưu
    let iconType = 'Bóng đá';
    
    // Kiểm tra trong cài đặt trước
    if (typeStyleSettings[type.typeName] && typeStyleSettings[type.typeName].iconName) {
      iconType = typeStyleSettings[type.typeName].iconName;
    } else {
      // Nếu không có, dùng quy tắc dựa trên tên
      const foundIcon = availableIcons.find(item => 
        type.typeName && type.typeName.toLowerCase().includes(item.name.toLowerCase())
      );
      if (foundIcon) {
        iconType = foundIcon.name;
      }
    }
    
    setFormData({
      typeName: type.typeName || '',
      iconType: iconType,
      customColor: typeStyleSettings[type.typeName]?.color || getTypeColor(iconType)
    });
    setShowEditModal(true);
  };

  const showDeleteTypeModal = (type) => {
    setSelectedType(type);
    setShowDeleteModal(true);
  };

  // Hiện thông báo với thời gian tự ẩn
  const showAlert = (color, message, duration = 3000) => {
    setAlert({
      show: true,
      color,
      message
    });
    
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, duration);
  };

  const handleAddType = async () => {
    // Kiểm tra form trước khi gửi
    if (!formData.typeName.trim()) {
      showAlert('danger', 'Vui lòng nhập tên loại sân');
      return;
    }
    
    // Kiểm tra trùng tên
    const isDuplicate = types.some(type => 
      type.typeName.toLowerCase() === formData.typeName.trim().toLowerCase()
    );

    if (isDuplicate) {
      showAlert('danger', 'Tên loại sân đã tồn tại. Vui lòng chọn tên khác.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Đảm bảo gửi đúng format dữ liệu mà server mong đợi - chỉ gửi type_name
      const typeData = {
        type_name: formData.typeName.trim()
      };
      
      console.log('Sending data:', typeData);
      const response = await typeAPI.createType(typeData);
      
      // Lưu cài đặt icon cho loại sân mới
      if (response && response.data && response.data.result) {
        const newType = response.data.result;
        // Lưu cài đặt cho loại sân mới
        updateTypeStyle(formData.typeName.trim(), formData.iconType, formData.customColor);
      }
      
      // Tải lại danh sách sau khi thêm
      await fetchTypes();
      
      // Đóng modal và hiển thị thông báo
      setShowAddModal(false);
      showAlert('success', 'Thêm loại sân thành công');
      
    } catch (err) {
      console.error('Error adding stadium type:', err);
      let errorMessage = 'Không thể thêm loại sân';
      
      // Kiểm tra lỗi trùng tên từ API
      if (err.response && err.response.data && err.response.data.message === 'Type of stadium existed') {
        errorMessage = 'Tên loại sân đã tồn tại trong hệ thống';
      }
      
      showAlert('danger', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditType = async () => {
    if (!selectedType) return;
    
    // Kiểm tra form trước khi gửi
    if (!formData.typeName.trim()) {
      showAlert('danger', 'Vui lòng nhập tên loại sân');
      return;
    }
    
    // Nếu tên không thay đổi, chỉ đóng modal và không cập nhật gì cả
    if (formData.typeName.trim() === selectedType.typeName) {
      console.log('No changes detected in type name, skipping API call');
      setShowEditModal(false);
      return;
    }
    
    // Kiểm tra trùng tên
    const isDuplicate = types.some(type => 
      type.typeId !== selectedType.typeId && 
      type.typeName.toLowerCase() === formData.typeName.trim().toLowerCase()
    );

    if (isDuplicate) {
      showAlert('danger', 'Tên loại sân đã tồn tại. Vui lòng chọn tên khác.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Chỉ gửi tên loại sân về BE (không gửi loại icon)
      const typeData = {
        type_name: formData.typeName.trim()
      };
      
      console.log('Updating type with data:', typeData);
      
      await typeAPI.updateType(selectedType.typeId, typeData);
      
      // Tải lại danh sách sau khi cập nhật
      await fetchTypes();
      
      // Đóng modal và hiển thị thông báo
      setShowEditModal(false);
      showAlert('success', 'Cập nhật loại sân thành công');
      
    } catch (err) {
      console.error('Error updating stadium type:', err);
      let errorMessage = 'Không thể cập nhật loại sân';
      
      // Kiểm tra lỗi trùng tên từ API
      if (err.response && err.response.data && err.response.data.message === 'Type of stadium existed') {
        errorMessage = 'Tên loại sân đã tồn tại trong hệ thống';
      }
      
      showAlert('danger', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteType = async () => {
    if (!selectedType) return;
    
    try {
      setLoading(true);
      await typeAPI.deleteType(selectedType.typeId);
      
      // Tải lại danh sách sau khi xóa
      await fetchTypes();
      
      // Đóng modal và hiển thị thông báo
      setShowDeleteModal(false);
      showAlert('success', 'Xóa loại sân thành công');
      
    } catch (err) {
      console.error('Error deleting stadium type:', err);
      showAlert('danger', 'Không thể xóa loại sân. Loại sân này có thể đang được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredTypes = types.filter(type => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (type.typeId || '').toString().toLowerCase().includes(searchLower) ||
      (type.typeName || '').toLowerCase().includes(searchLower)
    );
  });
  
  // Tính toán chỉ số cho phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTypes = filteredTypes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);

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

  // Thêm hàm xử lý màu sắc
  const handleColorSelect = (colorName, colorValue) => {
    setSelectedColor(colorName);
    setFormData({...formData, customColor: colorValue});
    
    if (selectedType) {
      updateTypeStyle(selectedType.typeName, formData.iconType, colorValue);
    }
  };

  // Lọc icon theo từ khóa tìm kiếm
  const filteredIcons = availableIcons.filter(icon => 
    icon.name.toLowerCase().includes(searchIconTerm.toLowerCase())
  );

  // Cập nhật hàm updateTypeStyle để lưu cả màu tùy chỉnh
  const updateTypeStyle = (typeName, iconName, color) => {
    const newSettings = {
      ...typeStyleSettings,
      [typeName]: {
        iconName,
        color: color
      }
    };
    
    setTypeStyleSettings(newSettings);
    saveTypeStyleSettings(newSettings);
  };

  // Render phần chọn màu sắc
  const renderColorPicker = () => {
    return (
      <div className="color-picker-container mt-3 mb-3">
        <CFormLabel>Chọn màu sắc</CFormLabel>
        <div className="color-grid d-flex flex-wrap" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {availableColors.map(colorInfo => (
            <div
              key={colorInfo.name}
              title={colorInfo.name}
              className="color-item m-1"
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: colorInfo.color,
                borderRadius: '4px',
                cursor: 'pointer',
                border: formData.customColor === colorInfo.color ? '2px solid #000' : '1px solid #ccc'
              }}
              onClick={() => handleColorSelect(colorInfo.name, colorInfo.color)}
            />
          ))}
        </div>
        <div className="color-preview mt-2 d-flex align-items-center">
          <div 
            style={{
              width: '30px', 
              height: '30px', 
              backgroundColor: formData.customColor,
              marginRight: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <small className="text-muted">{formData.customColor}</small>
        </div>
      </div>
    );
  };

  // Cập nhật phần chọn icon trong modal thêm mới và sửa
  const renderIconSelector = () => {
    return (
      <div className="icon-selector mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <CFormLabel htmlFor="iconType">Chọn icon</CFormLabel>
          <CFormInput
            placeholder="Tìm icon..."
            size="sm"
            style={{ width: '150px' }}
            value={searchIconTerm}
            onChange={(e) => setSearchIconTerm(e.target.value)}
          />
        </div>
        
        <div className="icon-grid d-flex flex-wrap" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {filteredIcons.map(icon => 
            renderIconButton(icon, formData.iconType === icon.name, handleIconSelect)
          )}
        </div>
        
        {filteredIcons.length === 0 && (
          <div className="text-center py-3">
            <small className="text-muted">Không tìm thấy icon phù hợp</small>
          </div>
        )}
        
        {!showAllIcons && filteredIcons.length > 8 && (
          <div className="text-center mt-2">
            <CButton 
              color="link" 
              size="sm"
              onClick={() => setShowAllIcons(true)}
            >
              Xem tất cả ({filteredIcons.length}) icon
            </CButton>
          </div>
        )}
      </div>
    );
  };

  // Cập nhật handleIconSelect để cập nhật cả màu sắc mới
  const handleIconSelect = (iconName) => {
    setFormData({...formData, iconType: iconName});
    
    // Lấy màu mặc định cho icon này nếu không có màu tùy chỉnh
    if (selectedType && !formData.customColor) {
      const iconColor = getTypeColor(iconName);
      updateTypeStyle(selectedType.typeName, iconName, iconColor);
    } else if (selectedType) {
      updateTypeStyle(selectedType.typeName, iconName, formData.customColor);
    }
  };

  // Render icon button component
  const renderIconButton = (iconInfo, isSelected, onClick) => {
    const iconColor = getTypeColor(iconInfo.name);
    
    return (
      <div 
        key={iconInfo.name}
        className="me-2 p-2" 
        style={{
          backgroundColor: isSelected ? `${iconColor}20` : 'transparent',
          borderRadius: '4px',
          cursor: 'pointer',
          border: isSelected ? `1px solid ${iconColor}` : '1px solid transparent'
        }}
        onClick={() => onClick(iconInfo.name)}
      >
        <div 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${iconColor}15`,
            color: iconColor
          }}
        >
          <FontAwesomeIcon icon={iconInfo.icon} size="lg" />
        </div>
      </div>
    );
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
          <CRow className="align-items-center">
            <CCol>
              <strong>Quản lý loại sân</strong>
            </CCol>
            <CCol xs="auto">
              <CButton color="primary" size="sm" onClick={showAddNewTypeModal}>
                <CIcon icon={cilPlus} className="me-1" />
                Thêm loại sân
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
            <CCol md={6} className="text-end">
              <small className="text-muted me-3">
                {filteredTypes.length > 0 ? (
                  <>Hiển thị {Math.min(filteredTypes.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredTypes.length)} của {filteredTypes.length} mục</>
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
                  fetchTypes();
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
                    <CTableHeaderCell style={{ width: '80px' }}>ID</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '100px' }}>Icon</CTableHeaderCell>
                    <CTableHeaderCell>Tên loại sân</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '150px' }}>Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentTypes.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={4} className="text-center">
                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Không có loại sân nào.'}
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    currentTypes.map((type) => {
                      const typeColor = getTypeColor(type.typeName);
                      const typeIcon = getTypeIcon(type.typeName);
                      
                      return (
                        <CTableRow key={type.typeId}>
                          <CTableDataCell>{type.typeId}</CTableDataCell>
                          <CTableDataCell>
                            <div 
                              className="type-icon-wrapper" 
                              style={{
                                backgroundColor: `${typeColor}15`,
                                color: typeColor,
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem'
                              }}
                            >
                              <FontAwesomeIcon icon={typeIcon} />
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <span 
                              className="type-name-pill" 
                              style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                backgroundColor: `${typeColor}15`,
                                color: typeColor,
                                fontWeight: '500',
                                display: 'inline-block'
                              }}
                            >
                              {type.typeName}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton color="primary" size="sm" className="me-2" onClick={() => showEditTypeModal(type)}>
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton color="danger" size="sm" onClick={() => showDeleteTypeModal(type)}>
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      );
                    })
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

      {/* Modal thêm loại sân */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader>
          <CModalTitle>Thêm loại sân mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="typeName">Tên loại sân</CFormLabel>
              <CFormInput
                id="typeName"
                name="typeName"
                value={formData.typeName}
                onChange={handleInputChange}
                placeholder="Nhập tên loại sân"
                required
              />
            </div>
            <div className="mb-3">
              {renderIconSelector()}
              {renderColorPicker()}
              <div className="d-flex align-items-center mt-3">
                <div className="preview-box me-3" style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%',
                  backgroundColor: `${formData.customColor}15`,
                  color: formData.customColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FontAwesomeIcon icon={getTypeIcon(formData.iconType)} />
                </div>
                <div>
                  <strong>Xem trước:</strong> Đây là cách icon và màu sắc sẽ hiển thị trên trang người dùng
                </div>
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleAddType} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Thêm loại sân'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal sửa loại sân */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <CModalHeader>
          <CModalTitle>Sửa loại sân</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="edit-typeName">Tên loại sân</CFormLabel>
              <CFormInput
                id="edit-typeName"
                name="typeName"
                value={formData.typeName}
                onChange={handleInputChange}
                placeholder="Nhập tên loại sân"
                required
              />
            </div>
            <div className="mb-3">
              {renderIconSelector()}
              {renderColorPicker()}
              <div className="d-flex align-items-center mt-3">
                <div className="preview-box me-3" style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%',
                  backgroundColor: `${formData.customColor}15`,
                  color: formData.customColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FontAwesomeIcon icon={getTypeIcon(formData.iconType)} />
                </div>
                <div>
                  <strong>Xem trước:</strong> Đây là cách icon và màu sắc sẽ hiển thị trên trang người dùng
                </div>
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleEditType} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Lưu thay đổi'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal xóa loại sân */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa loại sân "{selectedType?.typeName}"?
          <p className="text-danger mt-2">
            <strong>Lưu ý:</strong> Thao tác này không thể hoàn tác. Nếu có sân thuộc loại này, 
            hành động này có thể gây lỗi hệ thống.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteType} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Xóa'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default StadiumTypeManagement; 