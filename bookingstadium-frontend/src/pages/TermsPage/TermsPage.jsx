import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../TermsPage/TermsPage.css';

const TermsPage = () => {
  return (
    <div className="terms-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Điều khoản</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>

      <div className="terms-content">
        <div className="container">
          <div className="terms-section">
            <h2 className="terms-title">QUY CHẾ HOẠT ĐỘNG</h2>
            <div className="terms-subtitle">QUY CHẾ HOẠT ĐỘNG CỦA NỀN TẢNG</div>
            <div className="terms-subtitle">ĐẶT SÂN TRỰC TUYẾN WWW.Mi247.COM</div>
            
            <div className="terms-description">
              <p>
                Mi24/7 là nền tảng đặt sân trực tuyến phục vụ thương nhân, tổ chức, cá nhân có nhu cầu tạo gian hàng trực tuyến để giới thiệu và đăng tin cho thuê sân tập, có sơ sở thể dục thể thao của mình.
              </p>
              <p>
                Mi24/7 được xây dựng nhằm hỗ trợ tối đa cho khách hàng muốn tìm hiểu thông tin trực tuyến và sân luyện tập, thể dâu thể dục thể thao khác nhau hoặc có nhu cầu đặt thuê sân trực tuyến.
              </p>
              
              <h3>I. Nguyên tắc chung</h3>
              <p>
                Nền tảng đặt sân trực tuyến Mi24/7 do Công ty Cổ phần Phần mềm HPT Việt Nam thực hiện hoạt động và vận hành. Thành viên trên Nền tảng đặt sân trực tuyền là các thương nhân, tổ chức, cá nhân có hoạt động thương mại hợp pháp được Công ty TNHH Thực hiện hoàn toàn trực tuyến tại website thương mại điện tử Nền tảng đặt sân trực tuyến Mi24/7 và các bên liên quan.
              </p>
              <p>
                Nguyên tắc này áp dụng cho các thành viên đăng ký sử dụng, tạo lập gian hàng giới thiệu, buôn bán sản phẩm/ dịch vụ hoặc khuyến mại sản phẩm/ dịch vụ được thực hiện trên Nền tảng đặt sân trực tuyến Mi24/7.
              </p>
              <p>
                Thương nhân, tổ chức, cá nhân tham gia giao dịch tại Nền tảng đặt sân trực tuyến Mi24/7 tự do thỏa thuận trên cơ sở tôn trọng quyền và lợi ích hợp pháp của các bên tham gia hoạt động cho thuê sân phẩm/ dịch vụ thông qua hợp đồng, không trái với quy định của pháp luật.
              </p>
              <p>
                Sản phẩm/ dịch vụ tham gia giao dịch trên Nền tảng đặt sân trực tuyến Mi24/7 phải đáp ứng đầy đủ các quy định của pháp luật có liên quan, không thuộc các trường hợp cấm kinh doanh, cấm quảng cáo theo quy định của pháp luật.
              </p>
              <p>
                Hoạt động cho thuê dịch vụ qua Nền tảng đặt sân trực tuyến Mi24/7 phải được thực hiện công khai, minh bạch, đảm bảo quyền lợi của người tiêu dùng.
              </p>
              <p>
                Tất cả các nội dung trong Quy định này phải tuân thủ theo hệ thống pháp luật hiện hành của Việt Nam. Thành viên khi tham gia vào Nền tảng đặt sân trực tuyến Mi24/7 phải tự tìm hiểu trách nhiệm pháp lý của mình đối với luật pháp hiện hành của Việt Nam và cam kết thực hiện đúng những nội dung trong Quy chế của Nền tảng đặt sân trực tuyến Mi24/7.
              </p>
              
              <h3>II. Quy định chung</h3>
              <p>
                Tên Miền Nền tảng đặt sân trực tuyền: Nền tảng đặt sân trực tuyến Mi24/7 do Công ty Cổ phần Phần mềm Vitex Việt Nam phát triển với tên miền là: <a href="https://www.mi247.com" className="terms-link">https://www.mi247.com</a> (sau đây gọi tắt là "Nền tảng đặt sân trực tuyền Mi24/7")
              </p>
              
              <p>
                <strong>Định nghĩa chung:</strong>
              </p>
              <p>
                Người cho thuê/ Chủ sân (Nhà cung cấp, đối tác): là thương nhân, tổ chức, cá nhân có nhu cầu sử dụng dịch vụ của Mi24/7 bao gồm: tạo gian hàng giới thiệu sản phẩm/ dịch vụ cho thuê sân luyện tập thể thao, giới thiệu về công ty, thực hiện các khuyến mại dịch vụ.
              </p>
            </div>
          </div>
          
          {/* Các liên kết hữu ích */}
          <div className="useful-links">
            <h3>Liên kết hữu ích</h3>
            <div className="link-cards">
              <div className="link-card">
                <div className="link-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="link-details">
                  <h4>Chính sách bảo mật</h4>
                  <p>Tìm hiểu cách chúng tôi bảo vệ thông tin cá nhân của bạn</p>
                  <a href="/chinh-sach" className="link-button">Xem chi tiết</a>
                </div>
              </div>
              
              <div className="link-card">
                <div className="link-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="link-details">
                  <h4>Hướng dẫn sử dụng</h4>
                  <p>Hướng dẫn chi tiết cách đặt sân, hủy lịch và thanh toán</p>
                  <a href="/huong-dan" className="link-button">Xem chi tiết</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsPage;