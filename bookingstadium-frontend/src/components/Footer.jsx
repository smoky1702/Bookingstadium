import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import ChatBot from '../components/ChatBot'; // sửa đúng cú pháp import

const Footer = () => {
  return (
    <>
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section about">
              <h3 className="footer-title">GIỚI THIỆU</h3>
              <p>Mi24/7 cung cấp nền tảng thông minh giúp cho bạn tìm sân bãi và đặt sân một cách hiệu quả nhất.</p>

              <div className="footer-policies">
                <Link to="/chinh-sach-bao-mat" className="footer-link">Chính sách bảo mật</Link>
                <Link to="/chinh-sach-huy-doi-tra" className="footer-link">Chính sách hủy đổi trả</Link>
                <Link to="/chinh-sach-khach-hang" className="footer-link">Chính sách khách hàng</Link>
                <Link to="/chinh-sach-thanh-toan" className="footer-link">Chính sách thanh toán</Link>
              </div>
            </div>

            <div className="footer-section info">
              <h3 className="footer-title">THÔNG TIN</h3>
              <div className="company-info">
                <p><i className="fas fa-building"></i> Công ty Cổ phần Booking MI24/7</p>
                <p><i className="fas fa-id-card"></i> MST: 0123456789</p>
                <p><i className="fas fa-envelope"></i> Email: contact@mi247.com</p>
                <p><i className="fas fa-map-marker-alt"></i> Địa chỉ: Việt Nam</p>
                <p><i className="fas fa-phone"></i> Điện thoại: 0987.654.321</p>
                <p className="certificate">Giấy phép ĐKKD số 123456789 do Sở Kế hoạch và Đầu tư thành phố HCM cấp ngày 03/09/2025</p>
              </div>
            </div>

            <div className="footer-section contact">
              <h3 className="footer-title">LIÊN HỆ</h3>
              <div className="contact-form">
                <p className="contact-support">Chăm sóc khách hàng:</p>
                <p className="contact-phone">0987.654.321</p>
                <button className="contact-button">Gửi ngay</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-social">
              <p>TÌM CHÚNG TÔI</p>
              <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            <div className="footer-copyright">
              <p>© Copyright 2025 - Thiết kế bởi Mi247.com</p>
            </div>
          </div>
        </div>
      </footer>
      <ChatBot /> {/* Chat bot nổi nằm ngoài footer */}
    </>
  );
};

export default Footer;
