import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import PolicyPage from './pages/PolicyPage';
import TermsPage from './pages/TermsPage';
import AboutPage from './pages/AboutPage';
import StadiumListPage from './pages/StadiumListPage';
import StadiumDetailPage from './pages/StadiumDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import PrivacyPolicy from './landingpage/PrivacyPolicy';
import RefundPolicy from './landingpage/RefundPolicy';
import CustomerPolicy from './landingpage/CustomerPolicy';
import PaymentPolicy from './landingpage/PaymentPolicy';
import UserGuide from './landingpage/UserGuide';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chinh-sach" element={<PolicyPage />} />
          <Route path="/dieu-khoan" element={<TermsPage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/danh-sach-san" element={<StadiumListPage />} />
          <Route path="/san/:stadiumId" element={<StadiumDetailPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          {/* Thêm các routes khác ở đây khi bạn phát triển thêm trang */}
          <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicy />} />
          <Route path="/chinh-sach-huy-doi-tra" element={<RefundPolicy />} />
          <Route path="/chinh-sach-khach-hang" element={<CustomerPolicy />} />
          <Route path="/chinh-sach-thanh-toan" element={<PaymentPolicy />} />
          <Route path="/huong-dan" element={<UserGuide />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;