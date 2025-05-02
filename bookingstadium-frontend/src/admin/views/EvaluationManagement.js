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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CAlert,
  CBadge,
  CPagination,
  CPaginationItem,
  CRow,
  CCol,
  CInputGroup,
  CFormInput,
} from '@coreui/react';
import { evaluationAPI, userAPI, stadiumAPI } from '../services/adminApi';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilSearch, cilX } from '@coreui/icons';

const EvaluationManagement = () => {
  // State
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [users, setUsers] = useState({});
  const [stadiums, setStadiums] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Lấy danh sách đánh giá
  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const response = await evaluationAPI.getAllEvaluations();
      
      let evaluationList = [];
      
      if (response.data) {
        if (response.data.result && Array.isArray(response.data.result)) {
          evaluationList = response.data.result;
        } else if (Array.isArray(response.data)) {
          evaluationList = response.data;
        }
      }
      
      // Đảm bảo mỗi đánh giá có một ID duy nhất
      const processedEvaluations = evaluationList.map((evaluation, index) => {
        // Ưu tiên thử các trường ID khác nhau
        const actualId = evaluation.id || evaluation.evaluationId || evaluation.evaluation_id;
        // Nếu không có ID nào, sử dụng index làm ID tạm thời
        const uniqueId = actualId || `temp-id-${index}`;
        
        return {
          ...evaluation,
          uniqueId,
          // Lưu lại ID thật để sử dụng khi xóa
          actualId
        };
      });
      
      setEvaluations(processedEvaluations);
      
      // Lấy thông tin người dùng và sân có liên quan
      await fetchRelatedData(processedEvaluations);
      
    } catch (err) {
      setError('Không thể tải dữ liệu đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin liên quan (users và stadiums)
  const fetchRelatedData = async (evaluationList) => {
    // Tạo danh sách userIds và stadiumIds cần lấy thông tin
    const userIds = [...new Set(evaluationList.map(evaluation => evaluation.userId || evaluation.user_id).filter(Boolean))];
    const stadiumIds = [...new Set(evaluationList.map(evaluation => evaluation.stadiumId || evaluation.stadium_id).filter(Boolean))];
    
    // Lấy thông tin users
    try {
      const userResponse = await userAPI.getAllUsers();
      const userList = userResponse.data.result || userResponse.data || [];
      
      const userMap = {};
      userList.forEach(user => {
        if (user && user.id) {
          userMap[user.id] = user;
        }
      });
      
      setUsers(userMap);
    } catch (err) {
      // Xử lý lỗi im lặng, không hiển thị thông báo
    }
    
    // Lấy thông tin stadiums
    try {
      const stadiumResponse = await stadiumAPI.getAllStadiums();
      const stadiumList = stadiumResponse.data.result || stadiumResponse.data || [];
      
      const stadiumMap = {};
      stadiumList.forEach(stadium => {
        if (stadium && stadium.id) {
          stadiumMap[stadium.id] = stadium;
        }
      });
      
      setStadiums(stadiumMap);
    } catch (err) {
      // Xử lý lỗi im lặng, không hiển thị thông báo
    }
  };

  // Định dạng thời gian theo kiểu Việt Nam
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch (err) {
      return dateString;
    }
  };

  // Lấy tên người dùng từ ID
  const getUserName = (userId) => {
    const actualUserId = userId || 'unknown';
    if (!actualUserId) return 'N/A';
    const user = users[actualUserId];
    return user ? (user.fullName || user.username || user.email || actualUserId) : actualUserId;
  };

  // Lấy tên sân từ ID
  const getStadiumName = (stadiumId) => {
    const actualStadiumId = stadiumId || 'unknown';
    if (!actualStadiumId) return 'N/A';
    const stadium = stadiums[actualStadiumId];
    return stadium ? stadium.name || actualStadiumId : actualStadiumId;
  };

  // Xử lý xóa đánh giá
  const handleDelete = async () => {
    if (!deleteId) {
      setError('Không thể xác định ID đánh giá cần xóa');
      return;
    }

    try {
      // Gọi API để xóa đánh giá với ID
      await evaluationAPI.deleteEvaluation(deleteId);
      
      setSuccess('Xóa đánh giá thành công');
      setDeleteModal(false);
      setDeleteId(null);
      
      // Cập nhật lại danh sách đánh giá
      fetchEvaluations();
    } catch (err) {
      setError(`Không thể xóa đánh giá. Lỗi: ${err.response?.data?.message || err.message || 'Không xác định'}`);
    }
  };

  // Lấy màu cho badge rating
  const getRatingBadgeColor = (rating) => {
    const numericRating = Number(rating);
    if (!numericRating) return 'secondary';
    if (numericRating <= 2) return 'danger';
    if (numericRating <= 3) return 'warning';
    if (numericRating <= 4) return 'info';
    return 'success';
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredEvaluations = evaluations.filter(evaluation => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      String(evaluation.evaluationId || evaluation.id || evaluation.actualId || '').toLowerCase().includes(searchLower) ||
      getUserName(evaluation.userId || evaluation.user_id).toLowerCase().includes(searchLower) ||
      getStadiumName(evaluation.stadiumId || evaluation.stadium_id).toLowerCase().includes(searchLower) ||
      String(evaluation.comment || '').toLowerCase().includes(searchLower) ||
      String(evaluation.rating || evaluation.ratingScore || evaluation.rating_score || '').includes(searchLower)
    );
  });
  
  // Tính toán chỉ số cho phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvaluations = filteredEvaluations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);

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
    fetchEvaluations();
  }, []);

  // Xử lý hiển thị modal xóa
  const openDeleteModal = (evaluation) => {
    // Tìm ID thực tế để xóa - ưu tiên evaluationId vì backend đang sử dụng evaluationId trong đường dẫn API
    const idToDelete = evaluation.evaluationId || evaluation.id || evaluation.actualId;
    
    if (!idToDelete) {
      setError('Không thể xác định ID đánh giá cần xóa');
      return;
    }
    
    setDeleteId(idToDelete);
    setDeleteModal(true);
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Quản lý đánh giá</strong>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
              {error}
            </CAlert>
          )}
          {success && (
            <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
              {success}
            </CAlert>
          )}

          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CFormInput
                  placeholder="Tìm kiếm theo ID, người dùng, sân, nội dung..."
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
                {filteredEvaluations.length > 0 ? (
                  <>Hiển thị {Math.min(filteredEvaluations.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredEvaluations.length)} của {filteredEvaluations.length} mục</>
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
                  fetchEvaluations();
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
                    <CTableHeaderCell>Người dùng</CTableHeaderCell>
                    <CTableHeaderCell>Sân</CTableHeaderCell>
                    <CTableHeaderCell>Đánh giá</CTableHeaderCell>
                    <CTableHeaderCell>Nội dung</CTableHeaderCell>
                    <CTableHeaderCell>Thời gian</CTableHeaderCell>
                    <CTableHeaderCell>Thao tác</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentEvaluations.length > 0 ? (
                    currentEvaluations.map((evaluation, index) => (
                      <CTableRow key={`eval-${evaluation.uniqueId || index}`}>
                        <CTableDataCell>
                          <small>{evaluation.evaluationId || evaluation.id || evaluation.actualId || 'N/A'}</small>
                        </CTableDataCell>
                        <CTableDataCell>{getUserName(evaluation.userId || evaluation.user_id)}</CTableDataCell>
                        <CTableDataCell>{getStadiumName(evaluation.stadiumId || evaluation.stadium_id)}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getRatingBadgeColor(evaluation.rating || evaluation.ratingScore || evaluation.rating_score)}>
                            {evaluation.rating || evaluation.ratingScore || evaluation.rating_score || 'N/A'} ★
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div style={{ maxWidth: '350px', maxHeight: '100px', overflow: 'auto' }}>
                            {evaluation.comment || <span className="text-muted">Không có nội dung</span>}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{formatDateTime(evaluation.createdAt || evaluation.dateCreated || evaluation.date_created)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            color="danger" 
                            size="sm"
                            onClick={() => openDeleteModal(evaluation)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center">
                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Không có dữ liệu đánh giá'}
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

      {/* Modal xác nhận xóa */}
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default EvaluationManagement; 