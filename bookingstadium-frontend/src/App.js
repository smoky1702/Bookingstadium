import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage/HomePage';
import PolicyPage from './pages/PolicyPage/PolicyPage';
import TermsPage from './pages/TermsPage/TermsPage';
import AboutPage from './pages/AboutPage/AboutPage';
import StadiumListPage from './pages/StadiumListPage/StadiumListPage';
import StadiumDetailPage from './pages/StadiumDetailPage/StadiumDetailPage';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import BookingDetailPage from './pages/BookingDetailPage/BookingDetailPage';
import PaymentReturnPage from './pages/PaymentReturnPage/PaymentReturnPage';
import PrivacyPolicy from './landingpage/PrivacyPolicy';
import RefundPolicy from './landingpage/RefundPolicy';
import CustomerPolicy from './landingpage/CustomerPolicy';
import PaymentPolicy from './landingpage/PaymentPolicy';
import UserGuide from './landingpage/UserGuide';
import './App.css';

// Lazy load Admin routes
const AdminRoutes = lazy(() => import('./Admin/AdminRoutes'));

function App() {
  // Loading component cho Suspense
  const loading = (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      Đang tải...
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* User routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/chinh-sach" element={<PolicyPage />} />
          <Route path="/dieu-khoan" element={<TermsPage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/danh-sach-san" element={<StadiumListPage />} />
          <Route path="/san/:stadiumId" element={<StadiumDetailPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/booking/:bookingId" element={<BookingDetailPage />} />
          <Route path="/payment/return" element={<PaymentReturnPage />} />
          <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicy />} />
          <Route path="/chinh-sach-huy-doi-tra" element={<RefundPolicy />} />
          <Route path="/chinh-sach-khach-hang" element={<CustomerPolicy />} />
          <Route path="/chinh-sach-thanh-toan" element={<PaymentPolicy />} />
          <Route path="/huong-dan" element={<UserGuide />} />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={
            <Suspense fallback={loading}>
              <AdminRoutes />
            </Suspense>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;