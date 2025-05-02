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
  
  // Tính toán chỉ số cho phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
                {filteredUsers.length > 0 ? (
                  <>Hiển thị {Math.min(filteredUsers.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredUsers.length)} của {filteredUsers.length} người dùng</>
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
              <CTable hover responsive className="mb-3">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Họ tên</CTableHeaderCell>
                    <CTableHeaderCell>Vai trò</CTableHeaderCell>
                    <CTableHeaderCell>Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentUsers.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center">
                        {searchTerm ? 'Không tìm thấy người dùng phù hợp.' : 'Không có người dùng nào.'}
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    currentUsers.map((user) => (
                      <CTableRow key={user.user_id}>
                        <CTableDataCell>{user.user_id}</CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>
                          {`${user.firstname || ''} ${user.lastname || ''}`}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <CBadge color={getRoleBadgeColor(user.role)} className="me-2">
                              {getRoleDisplay(user.role)}
                            </CBadge>
                            <CFormSelect
                              value={getCurrentRole(user)}
                              onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                              style={{ width: '130px' }}
                            >
                              <option value="USER">Người dùng</option>
                              <option value="OWNER">Chủ sân</option>
                              <option value="ADMIN">Admin</option>
                            </CFormSelect>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => confirmDelete(user)}
                            className="me-2"
                          >
                            <CIcon icon={cilTrash} /> Xóa
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