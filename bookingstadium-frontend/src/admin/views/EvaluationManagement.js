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
  // Thêm state cho sắp xếp
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' hoặc 'desc'

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
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format ngày theo định dạng "DD-MM-YYYY"
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (err) {
      return 'N/A';
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

  // Lấy tên trường hiển thị cho việc sắp xếp
  const getSortFieldName = (field) => {
    switch (field) {
      case 'id':
        return 'ID';
      case 'userId':
        return 'Người dùng';
      case 'stadiumId':
        return 'Sân';
      case 'rating':
        return 'Điểm';
      case 'comment':
        return 'Nội dung';
      case 'createdAt':
        return 'Thời gian';
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
  
  // Sắp xếp dữ liệu sau khi lọc
  const sortedEvaluations = [...filteredEvaluations].sort((a, b) => {
    let aValue, bValue;
    
    // Xác định giá trị để sắp xếp dựa vào field
    switch (sortField) {
      case 'id':
        aValue = String(a.evaluationId || a.id || a.actualId || '').toLowerCase();
        bValue = String(b.evaluationId || b.id || b.actualId || '').toLowerCase();
        break;
      case 'userId':
        aValue = getUserName(a.userId || a.user_id).toLowerCase();
        bValue = getUserName(b.userId || b.user_id).toLowerCase();
        break;
      case 'stadiumId':
        aValue = getStadiumName(a.stadiumId || a.stadium_id).toLowerCase();
        bValue = getStadiumName(b.stadiumId || b.stadium_id).toLowerCase();
        break;
      case 'rating':
        aValue = Number(a.rating || a.ratingScore || a.rating_score || 0);
        bValue = Number(b.rating || b.ratingScore || b.rating_score || 0);
        break;
      case 'comment':
        aValue = String(a.comment || '').toLowerCase();
        bValue = String(b.comment || '').toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || a.dateCreated || a.date_created || 0).getTime();
        bValue = new Date(b.createdAt || b.dateCreated || b.date_created || 0).getTime();
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
  const currentEvaluations = sortedEvaluations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedEvaluations.length / itemsPerPage);

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
                  setSortField('createdAt');
                  setSortDirection('desc');
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
              <CTable hover responsive style={{ tableLayout: 'fixed', width: '100%' }}>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell 
                      onClick={() => handleSort('id')} 
                      style={{
                        ...getSortHeaderStyle('id'),
                        width: '17%',
                        // overflow: 'hidden'
                      }}
                    >
                      ID {getSortIcon('id')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('userId')} 
                      style={{
                        ...getSortHeaderStyle('userId'),
                        width: '15%'
                      }}
                    >
                      Người dùng {getSortIcon('userId')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('stadiumId')} 
                      style={{
                        ...getSortHeaderStyle('stadiumId'),
                        width: '15%'
                      }}
                    >
                      Sân {getSortIcon('stadiumId')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('rating')} 
                      style={{
                        ...getSortHeaderStyle('rating'),
                        textAlign: 'center',
                        width: '10%'
                      }}
                    >
                      Điểm {getSortIcon('rating')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('comment')} 
                      style={{
                        ...getSortHeaderStyle('comment'),
                        width: '20%'
                      }}
                    >
                      Nội dung {getSortIcon('comment')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('createdAt')} 
                      style={{
                        ...getSortHeaderStyle('createdAt'),
                        width: '15%'
                      }}
                    >
                      Thời gian {getSortIcon('createdAt')}
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '8%', textAlign: 'center' }}>
                      Thao tác
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentEvaluations.length > 0 ? (
                    currentEvaluations.map((evaluation, index) => (
                      <CTableRow key={`eval-${evaluation.uniqueId || index}`}>
                        <CTableDataCell style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {evaluation.evaluationId || evaluation.id || evaluation.actualId || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getUserName(evaluation.userId || evaluation.user_id)}
                        </CTableDataCell>
                        <CTableDataCell style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getStadiumName(evaluation.stadiumId || evaluation.stadium_id)}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge 
                            color={getRatingBadgeColor(evaluation.rating || evaluation.ratingScore || evaluation.rating_score)}
                            style={{ 
                              fontSize: '0.9rem', 
                              padding: '5px 10px',
                              minWidth: '40px'
                            }}
                          >
                            {evaluation.rating || evaluation.ratingScore || evaluation.rating_score || 'N/A'} ★
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div style={{ maxHeight: '80px', overflow: 'auto' }}>
                            {evaluation.comment || <span className="text-muted">Không có nội dung</span>}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDateTime(evaluation.createdAt || evaluation.dateCreated || evaluation.date_created)}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
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