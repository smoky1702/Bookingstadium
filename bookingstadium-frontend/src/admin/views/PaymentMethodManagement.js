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
import { cilSearch, cilInfo, cilTrash, cilPencil, cilPlus, cilWarning, cilX } from '@coreui/icons';
import { paymentMethodAPI } from '../services/adminApi';

const PaymentMethodManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    paymentMethodName: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, color: 'success', message: '' });
  const [actionConfirmed, setActionConfirmed] = useState(false);
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodAPI.getPaymentMethods();
      console.log('API Response:', response);
      console.log('Payment Methods Data:', response.data);
      const paymentMethodsData = response.data?.result || [];
      console.log('Extracted Payment Methods:', paymentMethodsData);
      setPaymentMethods(paymentMethodsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Không thể tải danh sách phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.paymentMethodName.trim()) {
      errors.paymentMethodName = 'Tên phương thức thanh toán không được để trống';
    } else if (formData.paymentMethodName.length < 2) {
      errors.paymentMethodName = 'Tên phương thức thanh toán phải có ít nhất 2 ký tự';
    } else if (formData.paymentMethodName.length > 50) {
      errors.paymentMethodName = 'Tên phương thức thanh toán không được vượt quá 50 ký tự';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng bắt đầu gõ
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleKeyDown = (e, submitHandler) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitHandler();
    }
  };

  const resetFormData = () => {
    setFormData({
      paymentMethodName: ''
    });
    setFormErrors({});
  };

  const showMethodDetail = (method) => {
    setSelectedMethod(method);
    setShowDetailModal(true);
  };

  const showEditMethodModal = (method) => {
    setSelectedMethod(method);
    setFormData({
      paymentMethodName: method.paymentMethodName || ''
    });
    setShowEditModal(true);
  };

  const showAddMethodModal = () => {
    resetFormData();
    setShowAddModal(true);
  };

  const showDeleteMethodModal = (method) => {
    setSelectedMethod(method);
    setShowDeleteModal(true);
  };

  const showAlert = (color, message) => {
    setAlert({
      show: true,
      color,
      message
    });
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleCreateMethod = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Đổi tên field cho phù hợp với backend
      const requestData = {
        payment_method_name: formData.paymentMethodName.trim()
      };
      
      console.log('Sending create request with data:', requestData);
      
      const response = await paymentMethodAPI.createPaymentMethod(requestData);
      console.log('Create payment method response:', response);
      
      // Tải lại danh sách sau khi tạo
      await fetchPaymentMethods();
      
      // Đóng modal và hiển thị thông báo
      setShowAddModal(false);
      resetFormData();
      showAlert('success', 'Thêm phương thức thanh toán thành công');
    } catch (err) {
      console.error('Error creating payment method:', err);
      showAlert('danger', err.response?.data?.message || `Không thể thêm phương thức thanh toán: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMethod = async () => {
    if (!selectedMethod || !validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Đổi tên field cho phù hợp với backend
      const requestData = {
        payment_method_name: formData.paymentMethodName.trim()
      };
      
      console.log('Sending update request with data:', requestData);
      console.log('Updating method with ID:', selectedMethod.paymentMethodId);
      
      const response = await paymentMethodAPI.updatePaymentMethod(selectedMethod.paymentMethodId, requestData);
      console.log('Update payment method response:', response);
      
      // Tải lại danh sách sau khi cập nhật
      await fetchPaymentMethods();
      
      // Đóng modal và hiển thị thông báo
      setShowEditModal(false);
      resetFormData();
      showAlert('success', 'Cập nhật phương thức thanh toán thành công');
    } catch (err) {
      console.error('Error updating payment method:', err);
      showAlert('danger', err.response?.data?.message || `Không thể cập nhật phương thức thanh toán: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async () => {
    if (!selectedMethod) return;
    
    if (!actionConfirmed) {
      setActionConfirmed(true);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Deleting method with ID:', selectedMethod.paymentMethodId);
      
      const response = await paymentMethodAPI.deletePaymentMethod(selectedMethod.paymentMethodId);
      console.log('Delete payment method response:', response);
      
      // Tải lại danh sách sau khi xóa
      await fetchPaymentMethods();
      
      // Đóng modal và hiển thị thông báo
      setShowDeleteModal(false);
      setActionConfirmed(false);
      showAlert('success', 'Xóa phương thức thanh toán thành công');
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setActionConfirmed(false);
      showAlert('danger', err.response?.data?.message || 'Không thể xóa phương thức thanh toán. Phương thức này có thể đang được sử dụng trong hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredMethods = paymentMethods.filter(method => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (method.paymentMethodId?.toString() || '').toLowerCase().includes(searchLower) ||
      (method.paymentMethodName || '').toLowerCase().includes(searchLower)
    );
  });

  // Tính toán chỉ số cho phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMethods = filteredMethods.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMethods.length / itemsPerPage);

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
              <strong>Quản lý phương thức thanh toán</strong>
            </CCol>
            <CCol xs="auto">
              <CButton color="primary" onClick={showAddMethodModal}>
                <CIcon icon={cilPlus} className="me-2" />
                Thêm phương thức
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CFormInput
                  placeholder="Tìm kiếm theo tên phương thức thanh toán..."
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
                {filteredMethods.length > 0 ? (
                  <>Hiển thị {Math.min(filteredMethods.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredMethods.length)} của {filteredMethods.length} mục</>
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
                  fetchPaymentMethods();
                }}
              >
                Làm mới
              </CButton>
            </CCol>
          </CRow>

          {loading && !paymentMethods.length ? (
            <div className="text-center p-3">
              <CSpinner />
            </div>
          ) : error ? (
            <div className="text-danger p-3">{error}</div>
          ) : (
            <>
              <CTable hover responsive className="mb-3">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell width="10%">ID</CTableHeaderCell>
                    <CTableHeaderCell>Tên phương thức thanh toán</CTableHeaderCell>
                    <CTableHeaderCell width="15%" className="text-center">Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentMethods.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={3} className="text-center">
                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Không có phương thức thanh toán nào.'}
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    currentMethods.map((method) => (
                      <CTableRow key={method.paymentMethodId}>
                        <CTableDataCell>{method.paymentMethodId}</CTableDataCell>
                        <CTableDataCell>{method.paymentMethodName}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton color="info" size="sm" className="me-1" onClick={() => showMethodDetail(method)} title="Xem chi tiết">
                            <CIcon icon={cilInfo} />
                          </CButton>
                          <CButton color="primary" size="sm" className="me-1" onClick={() => showEditMethodModal(method)} title="Chỉnh sửa">
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" size="sm" onClick={() => showDeleteMethodModal(method)} title="Xóa">
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

      {/* Modal xem chi tiết phương thức thanh toán */}
      <CModal visible={showDetailModal} onClose={() => setShowDetailModal(false)}>
        <CModalHeader>
          <CModalTitle>Chi tiết phương thức thanh toán</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedMethod && (
            <div>
              <CRow className="mb-3">
                <CCol md={4}><strong>ID:</strong></CCol>
                <CCol md={8}>{selectedMethod?.paymentMethodId}</CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}><strong>Tên phương thức:</strong></CCol>
                <CCol md={8}>{selectedMethod?.paymentMethodName}</CCol>
              </CRow>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal thêm phương thức thanh toán */}
      <CModal visible={showAddModal} onClose={() => {
        setShowAddModal(false);
        resetFormData();
      }}>
        <CModalHeader>
          <CModalTitle>Thêm phương thức thanh toán</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="paymentMethodName">Tên phương thức thanh toán <span className="text-danger">*</span></CFormLabel>
              <CFormInput
                id="paymentMethodName"
                name="paymentMethodName"
                value={formData.paymentMethodName}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, handleCreateMethod)}
                placeholder="Nhập tên phương thức thanh toán"
                required
                invalid={!!formErrors.paymentMethodName}
                feedbackInvalid={formErrors.paymentMethodName}
                autoFocus
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => {
            setShowAddModal(false);
            resetFormData();
          }}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleCreateMethod} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Thêm mới'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal sửa phương thức thanh toán */}
      <CModal visible={showEditModal} onClose={() => {
        setShowEditModal(false);
        resetFormData();
      }}>
        <CModalHeader>
          <CModalTitle>Cập nhật phương thức thanh toán</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="paymentMethodName">Tên phương thức thanh toán <span className="text-danger">*</span></CFormLabel>
              <CFormInput
                id="paymentMethodName"
                name="paymentMethodName"
                value={formData.paymentMethodName}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, handleUpdateMethod)}
                placeholder="Nhập tên phương thức thanh toán"
                required
                invalid={!!formErrors.paymentMethodName}
                feedbackInvalid={formErrors.paymentMethodName}
                autoFocus
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => {
            setShowEditModal(false);
            resetFormData();
          }}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleUpdateMethod} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Lưu thay đổi'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal xóa phương thức thanh toán */}
      <CModal visible={showDeleteModal} onClose={() => {
        setShowDeleteModal(false);
        setActionConfirmed(false);
      }}>
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilWarning} className="text-danger me-2" />
            Xác nhận xóa
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {!actionConfirmed ? (
            <>
              <p>Bạn có chắc chắn muốn xóa phương thức thanh toán <strong>{selectedMethod?.paymentMethodName}</strong>?</p>
              <p className="text-danger mt-2">
                <strong>Lưu ý:</strong> Thao tác này không thể hoàn tác và có thể ảnh hưởng đến các hóa đơn đã sử dụng phương thức này.
              </p>
            </>
          ) : (
            <>
              <p className="text-danger fw-bold">Hãy xác nhận lại lần cuối:</p>
              <p>Bạn thực sự muốn xóa phương thức thanh toán <strong>{selectedMethod?.paymentMethodName}</strong>?</p>
              <p>Nhấn "Xóa" để tiếp tục hoặc "Hủy" để quay lại.</p>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setActionConfirmed(false);
            }}
          >
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteMethod} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : actionConfirmed ? 'Xóa' : 'Xác nhận xóa'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default PaymentMethodManagement; 