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
  CFormSelect,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
  CInputGroup,
  CFormInput,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilTrash, cilX } from '@coreui/icons';
import { userAPI } from '../services/adminApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Thêm state cho sắp xếp
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' hoặc 'desc'
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Hàm fetchUsers đặt bên ngoài useEffect
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      const userData = response.data?.result || [];
      console.log('User data:', userData); // Debug log để xem cấu trúc dữ liệu
      setUsers(userData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.updateRole(userId, { roleId: newRole });
      
      // Cập nhật state
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: { roleId: newRole } } : user
      ));
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Không thể thay đổi vai trò người dùng');
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await userAPI.deleteUser(userToDelete.user_id);
      
      // Cập nhật state
      setUsers(users.filter(user => user.user_id !== userToDelete.user_id));
      
      // Đóng modal
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Không thể xóa người dùng');
    }
  };

  // Lấy tên vai trò hiển thị
  const getRoleDisplay = (role) => {
    if (!role) return 'Người dùng';
    
    // Xử lý nhiều cấu trúc dữ liệu từ API
    let roleId = role;
    
    // Nếu role là object, lấy roleId
    if (typeof role === 'object' && role !== null) {
      roleId = role.roleId || '';
    }
    
    switch(roleId) {
      case 'ADMIN':
        return 'Admin';
      case 'OWNER': 
        return 'Chủ sân';
      case 'USER':
        return 'Người dùng';
      default:
        return roleId || 'Người dùng';
    }
  };

  // Lấy màu sắc cho vai trò
  const getRoleBadgeColor = (role) => {
    if (!role) return 'primary';
    
    let roleId = role;
    
    // Nếu role là object, lấy roleId
    if (typeof role === 'object' && role !== null) {
      roleId = role.roleId || '';
    }
    
    switch(roleId) {
      case 'ADMIN':
        return 'danger';
      case 'OWNER': 
        return 'warning';
      case 'USER':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  // Hàm lấy role hiện tại của user
  const getCurrentRole = (user) => {
    // Nếu không có user
    if (!user) return 'USER';
    
    // Nếu có role object
    if (user.role && typeof user.role === 'object') {
      return user.role.roleId || 'USER';
    }
    
    return 'USER';
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
      case 'user_id':
        return 'ID người dùng';
      case 'email':
        return 'Email';
      case 'fullname':
        return 'Họ tên';
      case 'createdAt':
        return 'Ngày đăng ký';
      case 'role':
        return 'Vai trò';
      default:
        return field;
    }
  };
  
  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Lọc theo ID, email, họ tên và vai trò
    return (
      (user.user_id || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (`${user.firstname || ''} ${user.lastname || ''}`).toLowerCase().includes(searchLower) ||
      getRoleDisplay(user.role).toLowerCase().includes(searchLower)
    );
  });
  
  // Sắp xếp dữ liệu sau khi lọc
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue, bValue;
    
    // Xác định giá trị để sắp xếp dựa vào field
    switch (sortField) {
      case 'fullname':
        aValue = `${a.firstname || ''} ${a.lastname || ''}`.toLowerCase();
        bValue = `${b.firstname || ''} ${b.lastname || ''}`.toLowerCase();
        break;
      case 'email':
        aValue = (a.email || '').toLowerCase();
        bValue = (b.email || '').toLowerCase();
        break;
      case 'role':
        aValue = getRoleDisplay(a.role).toLowerCase();
        bValue = getRoleDisplay(b.role).toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || a.created_at || a.date_created || 0).getTime();
        bValue = new Date(b.createdAt || b.created_at || b.date_created || 0).getTime();
        break;
      default:
        aValue = (a[sortField] || '').toString().toLowerCase();
        bValue = (b[sortField] || '').toString().toLowerCase();
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
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

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

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format ngày theo định dạng "DD-MM-YYYY"
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
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

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Quản lý người dùng</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CFormInput
                  placeholder="Tìm kiếm theo ID, email, tên người dùng hoặc vai trò..."
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
                {sortedUsers.length > 0 ? (
                  <>Hiển thị {Math.min(sortedUsers.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, sortedUsers.length)} của {sortedUsers.length} người dùng</>
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
                  fetchUsers();
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
              <CTable 
                hover 
                responsive 
                className="align-middle"
                style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}
              >
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell 
                      onClick={() => handleSort('user_id')} 
                      style={{ 
                        ...getSortHeaderStyle('user_id'),
                        width: '12%',
                        overflow: 'hidden'
                      }}
                    >
                      ID {getSortIcon('user_id')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('email')} 
                      style={{ 
                        ...getSortHeaderStyle('email'),
                        width: '20%'
                      }}
                    >
                      Email {getSortIcon('email')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('fullname')} 
                      style={{ 
                        ...getSortHeaderStyle('fullname'),
                        width: '18%'
                      }}
                    >
                      Họ và tên {getSortIcon('fullname')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('createdAt')} 
                      style={{ 
                        ...getSortHeaderStyle('createdAt'),
                        width: '12%'
                      }}
                    >
                      Ngày đăng ký {getSortIcon('createdAt')}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => handleSort('role')} 
                      style={{ 
                        ...getSortHeaderStyle('role'),
                        width: '12%',
                        textAlign: 'center'
                      }}
                    >
                      Vai trò {getSortIcon('role')}
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '26%', textAlign: 'center' }}>
                      Hành động
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentUsers.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center">
                        {searchTerm ? 'Không tìm thấy người dùng phù hợp.' : 'Không có người dùng nào.'}
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    currentUsers.map((user) => (
                      <CTableRow key={user.user_id}>
                        <CTableDataCell style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.user_id}
                        </CTableDataCell>
                        <CTableDataCell style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </CTableDataCell>
                        <CTableDataCell>
                          {user.firstname} {user.lastname}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDateTime(user.createdAt || user.created_at || user.date_created)}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={getRoleBadgeColor(user.role)}>
                            {getRoleDisplay(user.role)}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <div className="d-flex justify-content-center align-items-center">
                            <CFormSelect
                              size="sm"
                              aria-label="Thay đổi vai trò"
                              style={{ width: '120px', marginRight: '10px' }}
                              value={getCurrentRole(user)}
                              onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                            >
                              <option value="USER">Người dùng</option>
                              <option value="OWNER">Chủ sân</option>
                              <option value="ADMIN">Quản trị viên</option>
                            </CFormSelect>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => confirmDelete(user)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
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

      {/* Modal xác nhận xóa */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa người dùng{' '}
          <strong>{userToDelete?.email}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteUser}>
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default UserManagement; 