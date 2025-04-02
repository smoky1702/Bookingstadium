import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../PolicyPage/PolicyPage.css';

const PolicyPage = () => {
  return (
    <div className="policy-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Chính sách</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>

      <div className="policy-content">
        <div className="container">
          <div className="policy-section">
            <h2 className="policy-title">Chính sách bảo vệ thông tin cá nhân</h2>
            <div className="policy-description">
              <h3>1. Mục đích thu thập thông tin cá nhân:</h3>
              <p>
                Thông tin cá nhân thu thập được sẽ chỉ được sử dụng trong nội bộ công ty. "Thông tin cá nhân" có nghĩa là thông tin về khách hàng mà dựa vào đó có thể xác định danh tính của khách hàng, bao gồm nhưng không giới hạn tên, số chứng minh thư, số giấy khai sinh, số hộ chiếu, quốc tịch, địa chỉ, số điện thoại, ngày tháng năm sinh, các chi tiết về thẻ tín dụng hoặc thẻ ghi nợ, chứng lộc, giới tính, ngày sinh, địa chỉ thư điện tử, bất kỳ thông tin ý về khách hàng mà khách hàng đã cung cấp cho Công ty trong các mẫu đơn đăng ký hoặc bất kỳ mẫu đơn tương tự như vậy hoặc bất kỳ thông tin ý về khách hàng mà đã được hoặc có thể thu thập, lưu trữ, sử dụng và xử lý bởi Công ty theo thời gian và bao gồm các thông tin cá nhân nhạy cảm như dữ liệu liên quan đến sức khỏe, tôn giáo hay tín ngưỡng tương tự khác.
              </p>
              
              <p>
                Khi Thành viên đăng ký tài khoản trên trang đặt sân trực tuyến Mi24/7, Công ty có thể sử dụng và xử lý Thông tin Cá nhân của khách hàng cho việc kinh doanh và các hoạt động của Công ty, bao gồm, nhưng không giới hạn, các mục đích sau đây:
              </p>
              
              <ul className="policy-list">
                <li>Chuyển tiếp đơn hàng tới Thành viên đến các cơ sở thể thao đối tác mà Thành viên đặt lịch chơi thể thao;</li>
                <li>Thông báo về việc đặt lịch và hỗ trợ khách hàng;</li>
                <li>Xác minh sự tồn tại của Thành viên;</li>
                <li>Cung cấp công thanh toán với các thông tin cần thiết để thực hiện các giao dịch nếu Thành viên lựa chọn hình thức thanh toán trực tuyến;</li>
                <li>Để xác nhận và/hoặc sơ ý các khoản thanh toán theo Thỏa thuận;</li>
                <li>Để thực hiện các nghĩa vụ của Công ty đối với bất kỳ hợp đồng nào đã ký kết với khách hàng;</li>
                <li>Để cung cấp cho khách hàng các dịch vụ theo Thỏa thuận;</li>
                <li>Để xử lý việc tham gia của khách hàng trong bất kỳ sự kiện, chương trình khuyến mãi, hoạt động, các nghiên cứu, cuộc thi, chương trình khuyến mãi, các cuộc điều tra tham dò, khảo sát hoặc các hoạt động khác và để liên lạc với khách hàng về sự tham gia của khách hàng tại đây;</li>
                <li>Để xử lý quản lý, hoặc kiểm chứng yêu cầu sử dụng Dịch vụ của khách hàng theo Thỏa thuận;</li>
                <li>Để phát triển, tăng cường và cung cấp những Dịch vụ được yêu cầu theo Thỏa thuận nhằm đáp ứng nhu cầu của khách hàng;</li>
                <li>Để xử lý bất kỳ khoản bồi hoàn, giảm giá và/hoặc các khoản phí theo quy định của Thỏa thuận;</li>
              </ul>
            </div>
          </div>
          
          {/* Các chính sách khác */}
          <div className="other-policies">
            <h3>Các chính sách khác</h3>
            <div className="policy-links">
              <Link to="/chinh-sach-bao-mat" className="policy-link">
                <i className="fas fa-shield-alt"></i>
                <span>Chính sách bảo mật</span>
              </Link>
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

export default PolicyPage;