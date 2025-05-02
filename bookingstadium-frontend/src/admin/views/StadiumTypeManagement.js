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
  CSpinner,
  CAlert,
  CCol,
  CRow,
  CInputGroup,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSearch, cilX } from '@coreui/icons';
import { typeAPI } from '../services/adminApi';

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
  });
  const [alert, setAlert] = useState({ show: false, color: 'success', message: '' });
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
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
  };

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
    });
  };

  const showAddNewTypeModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const showEditTypeModal = (type) => {
    setSelectedType(type);
    setFormData({
      typeName: type.typeName || '',
    });
    setShowEditModal(true);
  };

  const showDeleteTypeModal = (type) => {
    setSelectedType(type);
    setShowDeleteModal(true);
  };

  const handleAddType = async () => {
    try {
      setLoading(true);
      
      // Đảm bảo gửi đúng format dữ liệu mà server mong đợi
      const typeData = {
        type_name: formData.typeName
      };
      
      console.log('Sending data:', typeData);
      await typeAPI.createType(typeData);
      
      // Tải lại danh sách sau khi thêm
      await fetchTypes();
      
      // Đóng modal và hiển thị thông báo
      setShowAddModal(false);
      setAlert({
        show: true,
        color: 'success',
        message: 'Thêm loại sân thành công'
      });
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 3000);
    } catch (err) {
      console.error('Error adding stadium type:', err);
      setAlert({
        show: true,
        color: 'danger',
        message: 'Không thể thêm loại sân. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditType = async () => {
    if (!selectedType) return;
    
    try {
      setLoading(true);
      
      // Đảm bảo gửi đúng format dữ liệu mà server mong đợi
      const typeData = {
        type_name: formData.typeName
      };
      
      console.log('Updating type with data:', typeData);
      await typeAPI.updateType(selectedType.typeId, typeData);
      
      // Tải lại danh sách sau khi cập nhật
      await fetchTypes();
      
      // Đóng modal và hiển thị thông báo
      setShowEditModal(false);
      setAlert({
        show: true,
        color: 'success',
        message: 'Cập nhật loại sân thành công'
      });
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 3000);
    } catch (err) {
      console.error('Error updating stadium type:', err);
      setAlert({
        show: true,
        color: 'danger',
        message: 'Không thể cập nhật loại sân. Vui lòng thử lại.'
      });
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
      setAlert({
        show: true,
        color: 'success',
        message: 'Xóa loại sân thành công'
      });
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 3000);
    } catch (err) {
      console.error('Error deleting stadium type:', err);
      setAlert({
        show: true,
        color: 'danger',
        message: 'Không thể xóa loại sân. Loại sân này có thể đang được sử dụng.'
      });
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
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Tên loại sân</CTableHeaderCell>
                    <CTableHeaderCell>Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentTypes.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={3} className="text-center">
                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Không có loại sân nào.'}
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    currentTypes.map((type) => (
                      <CTableRow key={type.typeId}>
                        <CTableDataCell>{type.typeId}</CTableDataCell>
                        <CTableDataCell>{type.typeName}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="primary" size="sm" className="me-2" onClick={() => showEditTypeModal(type)}>
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" size="sm" onClick={() => showDeleteTypeModal(type)}>
                            <CIcon icon={cilTrash} />
                          </CButton>
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