import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CHeaderToggler,
  CNavItem,
  CNavLink,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarToggler,
  CNavTitle,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilMenu, 
  cilSpeedometer, 
  cilPeople, 
  cilAppsSettings, 
  cilCalendar, 
  cilCreditCard, 
  cilMoney,
  cilExitToApp,
  cilFootball,
  cilLocationPin,
  cilImage,
  cilStar,
  cilClock
} from '@coreui/icons';
import { useState } from 'react';
import '@coreui/coreui/dist/css/coreui.min.css';
import './AdminLayout.css';

const AdminLayout = () => {
  // Khởi tạo trạng thái từ localStorage hoặc mặc định là true
  const [sidebarVisible, setSidebarVisible] = useState(
    localStorage.getItem('sidebarVisible') !== 'false'
  );
  
  // Lưu trạng thái sidebar khi thay đổi
  useEffect(() => {
    localStorage.setItem('sidebarVisible', sidebarVisible);
  }, [sidebarVisible]);

  // Đảm bảo sidebar luôn mở trên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !sidebarVisible) {
        setSidebarVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Kiểm tra khi component mount
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarVisible]);

  const toggleSidebar = () => {
    // Chỉ cho phép đóng sidebar trên thiết bị di động
    if (window.innerWidth < 768 || sidebarVisible === false) {
      setSidebarVisible(!sidebarVisible);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="admin-wrapper">
      <CSidebar
        visible={sidebarVisible}
        onVisibleChange={(visible) => {
          // Chỉ cho phép đóng sidebar trên thiết bị di động
          if (window.innerWidth < 768 || visible === true) {
            setSidebarVisible(visible);
          }
        }}
        className={window.innerWidth >= 768 ? 'sidebar-desktop' : ''}
      >
        <CSidebarBrand>
          BookingStadium Admin
        </CSidebarBrand>
        <CSidebarNav>
          <CNavTitle>Trang quản trị</CNavTitle>
          <CNavItem>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilSpeedometer} className="me-2" />
              Dashboard
            </NavLink>
          </CNavItem>
          <CNavTitle>Quản lý</CNavTitle>
          <CNavItem>
            <NavLink to="/admin/stadium-approval" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilPeople} className="me-2" />
              Duyệt sân
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilPeople} className="me-2" />
              Quản lý người dùng
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/stadium-types" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilAppsSettings} className="me-2" />
              Quản lý loại sân
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/stadiums" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilFootball} className="me-2" />
              Quản lý sân
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/locations" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilLocationPin} className="me-2" />
              Quản lý địa điểm
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/images" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilImage} className="me-2" />
              Danh sách hình ảnh
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/evaluations" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilStar} className="me-2" />
              Quản lý đánh giá
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/work-schedules" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilClock} className="me-2" />
              Quản lý lịch làm việc
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/bookings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilCalendar} className="me-2" />
              Quản lý đặt sân
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/bills" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilMoney} className="me-2" />
              Quản lý hóa đơn
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/admin/payment-methods" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <CIcon icon={cilCreditCard} className="me-2" />
              Phương thức thanh toán
            </NavLink>
          </CNavItem>
          <CNavTitle>Tài khoản</CNavTitle>
          <CNavItem>
            <a href="#" className="nav-link" onClick={handleLogout}>
              <CIcon icon={cilExitToApp} className="me-2" />
              Đăng xuất
            </a>
          </CNavItem>
        </CSidebarNav>
        <CSidebarToggler 
          onClick={toggleSidebar}
          style={{ display: 'none' }}
        />
      </CSidebar>

      <div className="admin-content-wrapper">
        <CHeader className="admin-header">
          <CContainer fluid>
            <CHeaderToggler
              className="d-md-none"
              onClick={toggleSidebar}
            >
              <CIcon icon={cilMenu} />
            </CHeaderToggler>
            <CHeaderBrand className="d-md-none">
              BookingStadium Admin
            </CHeaderBrand>
            <CHeaderNav className="ms-auto">
              <CNavItem>
                <a href="#" className="nav-link" onClick={handleLogout}>
                  <CIcon icon={cilExitToApp} />
                  Đăng xuất
                </a>
              </CNavItem>
            </CHeaderNav>
          </CContainer>
        </CHeader>

        <div className="admin-main-content">
          <CContainer fluid className="p-4">
            <Outlet />
          </CContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 