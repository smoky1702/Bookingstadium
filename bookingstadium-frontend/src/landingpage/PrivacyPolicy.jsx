import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../landingpage/PolicylandingPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Chính sách bảo mật</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>

      <div className="policy-content">
        <div className="container">
          <div className="policy-section">
            <h2 className="policy-title">Chính sách bảo vệ thông tin cá nhân</h2>
            
            <div className="policy-description">
              <h3>1. Mục đích thu thập thông tin cá nhân</h3>
              <p>
                Mi24/7 thu thập thông tin cá nhân của bạn với mục đích:
              </p>
              <ul className="policy-list">
                <li>Cung cấp và cải thiện dịch vụ đặt sân</li>
                <li>Xác thực tài khoản và bảo vệ tài khoản của bạn</li>
                <li>Xử lý giao dịch đặt sân và thanh toán</li>
                <li>Gửi thông báo về lịch đặt sân, cập nhật từ hệ thống</li>
                <li>Giải quyết tranh chấp và xử lý các vấn đề phát sinh</li>
                <li>Cung cấp hỗ trợ khách hàng</li>
              </ul>

              <h3>2. Phạm vi thu thập thông tin</h3>
              <p>
                Chúng tôi thu thập các thông tin sau:
              </p>
              <ul className="policy-list">
                <li>Thông tin cá nhân: họ tên, email, số điện thoại, địa chỉ</li>
                <li>Thông tin tài khoản: tên đăng nhập, mật khẩu đã được mã hóa</li>
                <li>Thông tin giao dịch: lịch sử đặt sân, thanh toán</li>
                <li>Dữ liệu thiết bị: địa chỉ IP, loại thiết bị, trình duyệt web</li>
              </ul>

              <h3>3. Thời gian lưu trữ thông tin</h3>
              <p>
                Mi24/7 lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để thực hiện mục đích thu thập thông tin hoặc theo quy định của pháp luật, tùy thuộc thời gian nào dài hơn.
              </p>

              <h3>4. Những người hoặc tổ chức có thể được tiếp cận với thông tin</h3>
              <p>
                Thông tin cá nhân của bạn có thể được chia sẻ với:
              </p>
              <ul className="policy-list">
                <li>Nhân viên được ủy quyền của Mi24/7</li>
                <li>Đối tác cung cấp sân (chỉ thông tin cần thiết để xác nhận đặt sân)</li>
                <li>Đối tác thanh toán (chỉ thông tin cần thiết để xử lý giao dịch)</li>
                <li>Cơ quan nhà nước có thẩm quyền khi có yêu cầu theo quy định pháp luật</li>
              </ul>

              <h3>5. Cam kết bảo mật thông tin cá nhân</h3>
              <p>
                Mi24/7 cam kết:
              </p>
              <ul className="policy-list">
                <li>Bảo mật thông tin cá nhân của bạn bằng các biện pháp vật lý, điện tử và quản lý phù hợp</li>
                <li>Không bán, trao đổi hoặc chuyển nhượng thông tin cá nhân của bạn cho bên thứ ba ngoài phạm vi đã nêu</li>
                <li>Đảm bảo quyền lợi và sự an toàn cho thông tin cá nhân mà bạn đã cung cấp</li>
                <li>Xử lý các hành vi vi phạm bảo mật thông tin một cách nghiêm túc</li>
              </ul>

              <h3>6. Quyền của người dùng đối với thông tin cá nhân</h3>
              <p>
                Bạn có quyền:
              </p>
              <ul className="policy-list">
                <li>Truy cập và kiểm tra thông tin cá nhân đã cung cấp</li>
                <li>Cập nhật, điều chỉnh thông tin cá nhân khi cần thiết</li>
                <li>Yêu cầu xóa thông tin cá nhân khỏi cơ sở dữ liệu</li>
                <li>Rút lại sự đồng ý cho việc thu thập, sử dụng và tiết lộ thông tin cá nhân</li>
                <li>Khiếu nại về việc sử dụng thông tin cá nhân không đúng mục đích</li>
              </ul>
              
              <h3>7. Cách thức chỉnh sửa thông tin cá nhân</h3>
              <p>
                Bạn có thể chỉnh sửa thông tin cá nhân bằng cách:
              </p>
              <ul className="policy-list">
                <li>Đăng nhập vào tài khoản và truy cập mục "Thông tin cá nhân"</li>
                <li>Liên hệ bộ phận chăm sóc khách hàng qua số điện thoại: 0247.303.0247</li>
                <li>Gửi yêu cầu qua email: contact@mi247.com</li>
              </ul>

              <h3>8. Cơ chế tiếp nhận và giải quyết khiếu nại</h3>
              <p>
                Khi có khiếu nại về việc sử dụng thông tin cá nhân, bạn có thể:
              </p>
              <ul className="policy-list">
                <li>Gửi khiếu nại qua email: support@mi247.com</li>
                <li>Gọi điện thoại đến số: 0987.654.321</li>
                <li>Mi24/7 cam kết phản hồi trong vòng 48 giờ và giải quyết khiếu nại trong thời gian sớm nhất</li>
              </ul>
            </div>
          </div>
          
          {/* Các chính sách khác */}
          <div className="other-policies">
            <h3>Các chính sách khác</h3>
            <div className="policy-links">
              <Link to="/chinh-sach-huy-doi-tra" className="policy-link">
                <i className="fas fa-exchange-alt"></i>
                <span>Chính sách hủy đổi trả</span>
              </Link>
              <Link to="/chinh-sach-khach-hang" className="policy-link">
                <i className="fas fa-user-shield"></i>
                <span>Chính sách khách hàng</span>
              </Link>
              <Link to="/chinh-sach-thanh-toan" className="policy-link">
                <i className="fas fa-credit-card"></i>
                <span>Chính sách thanh toán</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;