import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../landingpage/PolicylandingPages.css';

const RefundPolicy = () => {
  return (
    <div className="policy-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Chính sách hủy đổi trả</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>

      <div className="policy-content">
        <div className="container">
          <div className="policy-section">
            <h2 className="policy-title">Chính sách hủy đổi trả Mi24/7</h2>
            
            <div className="policy-description">
              <h3>1. Chính sách hủy đặt sân</h3>
              <p>
                Mi24/7 hiểu rằng đôi khi bạn có thể cần hủy lịch đặt sân vì nhiều lý do khác nhau. Chúng tôi đã thiết lập các chính sách để đảm bảo quá trình này diễn ra thuận lợi nhất.
              </p>
              
              <h4>1.1. Thời gian hủy và hoàn tiền</h4>
              <div className="refund-table">
                <table>
                  <thead>
                    <tr>
                      <th>Thời gian hủy trước giờ đặt sân</th>
                      <th>% Hoàn tiền</th>
                      <th>Phí hủy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Trên 48 giờ</td>
                      <td>100%</td>
                      <td>Không phí</td>
                    </tr>
                    <tr>
                      <td>24 - 48 giờ</td>
                      <td>80%</td>
                      <td>20% giá trị đơn hàng</td>
                    </tr>
                    <tr>
                      <td>12 - 24 giờ</td>
                      <td>50%</td>
                      <td>50% giá trị đơn hàng</td>
                    </tr>
                    <tr>
                      <td>Dưới 12 giờ</td>
                      <td>0%</td>
                      <td>100% giá trị đơn hàng</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h4>1.2. Trường hợp ngoại lệ</h4>
              <p>
                Các trường hợp sau đây có thể được xem xét hoàn tiền 100%:
              </p>
              <ul className="policy-list">
                <li>Thời tiết xấu (mưa lớn, bão, lũ lụt) được xác nhận bởi chủ sân</li>
                <li>Sân bóng không thể sử dụng vì lý do kỹ thuật từ phía chủ sân</li>
                <li>Trường hợp bất khả kháng có xác nhận từ cơ quan có thẩm quyền</li>
              </ul>
              
              <h3>2. Quy trình hủy đặt sân</h3>
              <ol className="policy-numbered-list">
                <li>Đăng nhập vào tài khoản Mi24/7</li>
                <li>Vào mục "Lịch sử đặt sân" và chọn lịch đặt sân cần hủy</li>
                <li>Nhấn nút "Hủy đặt sân" và chọn lý do hủy</li>
                <li>Xác nhận yêu cầu hủy</li>
                <li>Sau khi chủ sân xác nhận, tiền hoàn trả (nếu có) sẽ được chuyển vào ví Mi24/7 hoặc tài khoản thanh toán ban đầu của bạn trong vòng 3-7 ngày làm việc</li>
              </ol>
              
              <h3>3. Chính sách đổi lịch đặt sân</h3>
              <h4>3.1. Điều kiện đổi lịch</h4>
              <ul className="policy-list">
                <li>Yêu cầu đổi lịch phải được thực hiện ít nhất 24 giờ trước giờ đặt sân</li>
                <li>Mỗi đơn đặt sân chỉ được phép đổi lịch tối đa 1 lần</li>
                <li>Lịch đã bị hủy không thể đổi lịch</li>
                <li>Lịch mới phải trong vòng 30 ngày kể từ ngày đặt ban đầu</li>
              </ul>
              
              <h4>3.2. Phí đổi lịch</h4>
              <div className="refund-table">
                <table>
                  <thead>
                    <tr>
                      <th>Thời gian đổi trước giờ đặt sân</th>
                      <th>Phí đổi lịch</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Trên 48 giờ</td>
                      <td>Không phí</td>
                    </tr>
                    <tr>
                      <td>24 - 48 giờ</td>
                      <td>10% giá trị đơn hàng</td>
                    </tr>
                    <tr>
                      <td>Dưới 24 giờ</td>
                      <td>Không được phép đổi lịch</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h4>3.3. Chênh lệch giá khi đổi lịch</h4>
              <ul className="policy-list">
                <li>Nếu giá sân mới cao hơn: Người đặt sân thanh toán thêm phần chênh lệch</li>
                <li>Nếu giá sân mới thấp hơn: Phần chênh lệch sẽ được hoàn vào ví Mi24/7</li>
              </ul>
              
              <h3>4. Trường hợp không được hủy/đổi/hoàn tiền</h3>
              <ul className="policy-list">
                <li>Đã sử dụng sân (một phần hoặc toàn bộ thời gian)</li>
                <li>Hủy lịch sau khi thời gian đặt sân đã bắt đầu</li>
                <li>Không xuất hiện tại sân mà không thông báo (No-show)</li>
                <li>Các chương trình khuyến mãi có ghi rõ "Không được hủy/đổi/hoàn tiền"</li>
              </ul>
              
              <h3>5. Liên hệ hỗ trợ</h3>
              <p>
                Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ thêm về chính sách hủy đổi trả, vui lòng liên hệ với chúng tôi qua:
              </p>
              <ul className="policy-list">
                <li>Hotline: 0247.303.0247 (8:00 - 22:00 hàng ngày)</li>
                <li>Email: support@mi247.com</li>
                <li>Live chat trên website hoặc ứng dụng</li>
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

export default RefundPolicy;