import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';

// Lazy load các components để tối ưu hiệu suất
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const Login = lazy(() => import('./views/Login'));
const Dashboard = lazy(() => import('./views/Dashboard'));
const UserManagement = lazy(() => import('./views/UserManagement'));
const BookingManagement = lazy(() => import('./views/BookingManagement'));
const StadiumTypeManagement = lazy(() => import('./views/StadiumTypeManagement'));
const BillManagement = lazy(() => import('./views/BillManagement'));
const PaymentMethodManagement = lazy(() => import('./views/PaymentMethodManagement'));
const StadiumManagement = lazy(() => import('./views/StadiumManagement'));
const LocationManagement = lazy(() => import('./views/LocationManagement'));
const ImageManagement = lazy(() => import('./views/ImageManagement'));
const EvaluationManagement = lazy(() => import('./views/EvaluationManagement'));
const WorkScheduleManagement = lazy(() => import('./views/WorkScheduleManagement'));
const StadiumApprovalManagement = lazy(() => import('./views/OwnerManagement'));

// Placeholder cho các trang chưa làm
const ComingSoon = () => (
  <div className="text-center p-5">
    <h2>Tính năng đang phát triển</h2>
    <p>Chức năng này sẽ sớm được cập nhật.</p>
  </div>
);

const AdminRoutes = () => {
  // Render fallback UI khi component đang loading
  const loading = (
    <div className="text-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );

  return (
    <Suspense fallback={loading}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <AuthGuard>
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="stadium-approval" element={<StadiumApprovalManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="stadium-types" element={<StadiumTypeManagement />} />
          <Route path="stadiums" element={<StadiumManagement />} />
          <Route path="locations" element={<LocationManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="bills" element={<BillManagement />} />
          <Route path="payment-methods" element={<PaymentMethodManagement />} />
          <Route path="images" element={<ImageManagement />} />
          <Route path="evaluations" element={<EvaluationManagement />} />
          <Route path="work-schedules" element={<WorkScheduleManagement />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes; 