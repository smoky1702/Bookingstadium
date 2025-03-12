import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../landingpage/PolicylandingPages.css';

const UserGuide = () => {
  return (
    <div className="policy-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Hướng dẫn sử dụng</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>

      <div className="policy-content">
        <div className="container">
          <div className="policy-section">
            <h2 className="policy-title">Hướng dẫn sử dụng Mi24/7</h2>
            
            <div className="policy-description">
              <h3>1. Đăng ký và đăng nhập</h3>
              
              <h4>1.1. Đăng ký tài khoản</h4>
              <ol className="policy-numbered-list">
                <li>Truy cập website mi247.com hoặc tải ứng dụng mi247 từ App Store/Google Play</li>
                <li>Nhấn vào nút "Đăng ký" ở góc phải trên cùng</li>
                <li>Điền đầy đủ thông tin: Email, mật khẩu, xác nhận mật khẩu, số điện thoại, họ và tên</li>
                <li>Đọc và đồng ý với Điều khoản dịch vụ và Chính sách bảo mật</li>
                <li>Nhấn "Đăng ký" để hoàn tất</li>
                <li>Xác nhận email (kiểm tra hộp thư và nhấn vào liên kết xác nhận)</li>
              </ol>
              
              <div className="guide-image">
                <img src="/guides/register.png" alt="Hướng dẫn đăng ký" />
              </div>
              
              <h4>1.2. Đăng nhập tài khoản</h4>
              <ol className="policy-numbered-list">
                <li>Nhấn vào nút "Đăng nhập" ở góc phải trên cùng</li>
                <li>Nhập email và mật khẩu đã đăng ký</li>
                <li>Hoặc chọn đăng nhập nhanh qua Facebook/Google</li>
                <li>Nhấn "Đăng nhập" để truy cập tài khoản</li>
              </ol>
              
              <div className="guide-image">
                <img src="/guides/login.png" alt="Hướng dẫn đăng nhập" />
              </div>
              
              <h4>1.3. Quên mật khẩu</h4>
              <ol className="policy-numbered-list">
                <li>Tại màn hình đăng nhập, nhấn vào "Quên mật khẩu"</li>
                <li>Nhập email đăng ký tài khoản</li>
                <li>Nhấn "Gửi yêu cầu"</li>
                <li>Kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu</li>
              </ol>
              
              <h3>2. Tìm kiếm và đặt sân</h3>
              
              <h4>2.1. Tìm kiếm sân bóng</h4>
              <p>
                Bạn có thể tìm kiếm sân bóng theo nhiều cách:
              </p>
              <ul className="policy-list">
                <li><strong>Tìm theo vị trí</strong>: Nhập khu vực/quận/huyện vào ô tìm kiếm</li>
                <li><strong>Tìm theo loại sân</strong>: Chọn loại sân (sân 5, sân 7, sân 11) từ dropdown</li>
                <li><strong>Tìm theo tên sân</strong>: Nhập tên sân bóng cụ thể</li>
                <li><strong>Tìm theo bộ lọc</strong>: Sử dụng bộ lọc nâng cao (giá, tiện ích, đánh giá, v.v.)</li>
              </ul>
              
              <div className="guide-image">
                <img src="/guides/search.png" alt="Hướng dẫn tìm kiếm" />
              </div>
              
              <h4>2.2. Xem thông tin sân bóng</h4>
              <p>
                Sau khi tìm thấy sân bóng phù hợp, nhấn vào để xem chi tiết:
              </p>
              <ul className="policy-list">
                <li>Thông tin cơ bản: Địa chỉ, số điện thoại, giờ mở cửa</li>
                <li>Hình ảnh sân bóng</li>
                <li>Giá thuê theo khung giờ</li>
                <li>Tiện ích có sẵn (phòng thay đồ, chỗ để xe, nhà hàng, v.v.)</li>
                <li>Đánh giá và bình luận từ người dùng khác</li>
                <li>Bản đồ vị trí</li>
              </ul>
              
              <h4>2.3. Đặt sân</h4>
              <ol className="policy-numbered-list">
                <li>Sau khi chọn sân, nhấn vào nút "Đặt sân"</li>
                <li>Chọn ngày và khung giờ muốn đặt (hệ thống sẽ hiển thị các khung giờ còn trống)</li>
                <li>Chọn các dịch vụ đi kèm (nếu có)</li>
                <li>Nhập thông tin liên hệ hoặc sử dụng thông tin từ tài khoản</li>
                <li>Kiểm tra lại thông tin đặt sân</li>
                <li>Nhấn "Tiếp tục" để chuyển đến trang thanh toán</li>
              </ol>
              
              <div className="guide-image">
                <img src="/guides/booking.png" alt="Hướng dẫn đặt sân" />
              </div>
              
              <h3>3. Thanh toán</h3>
              
              <h4>3.1. Các phương thức thanh toán</h4>
              <p>
                Mi24/7 hỗ trợ nhiều phương thức thanh toán:
              </p>
              <ul className="policy-list">
                <li>Thẻ ATM nội địa</li>
                <li>Thẻ quốc tế (Visa, MasterCard, JCB, Amex)</li>
                <li>Ví điện tử (MoMo, ZaloPay, VNPay, ShopeePay)</li>
                <li>Ví Mi24/7</li>
                <li>Thanh toán tại sân (chỉ áp dụng với một số sân)</li>
              </ul>
              
              <h4>3.2. Quy trình thanh toán</h4>
              <ol className="policy-numbered-list">
                <li>Chọn phương thức thanh toán</li>
                <li>Điền thông tin thanh toán theo hướng dẫn</li>
                <li>Xác nhận và hoàn tất thanh toán</li>
                <li>Nhận xác nhận đặt sân thành công qua email và SMS</li>
              </ol>
              
              <div className="guide-image">
                <img src="/guides/payment.png" alt="Hướng dẫn thanh toán" />
              </div>
              
              <h3>4. Quản lý đặt sân</h3>
              
              <h4>4.1. Xem lịch sử đặt sân</h4>
              <ol className="policy-numbered-list">
                <li>Đăng nhập vào tài khoản</li>
                <li>Truy cập mục "Tài khoản" --+ "Lịch sử đặt sân"</li>
                <li>Xem danh sách các lần đặt sân (đã đặt, đang chờ, đã sử dụng, đã hủy)</li>
                <li>Nhấn vào từng đơn để xem chi tiết</li>
              </ol>
              
              <h4>4.2. Hủy đặt sân</h4>
              <ol className="policy-numbered-list">
                <li>Truy cập mục "Tài khoản" --+ "Lịch sử đặt sân"</li>
                <li>Chọn đơn đặt sân cần hủy</li>
                <li>Nhấn nút "Hủy đặt sân"</li>
                <li>Chọn lý do hủy</li>
                <li>Xác nhận hủy đặt sân</li>
                <li>Nhận thông báo về việc hoàn tiền (nếu có) theo <Link to="/chinh-sach-huy-doi-tra" className="policy-link">Chính sách hủy đổi trả</Link></li>
              </ol>
              
              <div className="guide-image">
                {<img src="/guides/cancel_booking.jpg" alt="Hướng dẫn hủy đặt sân" />}
              </div>
              
              <h4>4.3. Đổi lịch đặt sân</h4>
              <ol className="policy-numbered-list">
                <li>Truy cập mục "Tài khoản" --+ "Lịch sử đặt sân"</li>
                <li>Chọn đơn đặt sân cần đổi lịch</li>
                <li>Nhấn nút "Đổi lịch"</li>
                <li>Chọn ngày và khung giờ mới</li>
                <li>Xác nhận thông tin và thanh toán phần chênh lệch giá (nếu có)</li>
                <li>Nhận xác nhận đổi lịch thành công</li>
              </ol>
              
              <h3>5. Đánh giá và bình luận</h3>
              
              <h4>5.1. Đánh giá sân bóng</h4>
              <ol className="policy-numbered-list">
                <li>Sau khi sử dụng sân, bạn sẽ nhận được lời mời đánh giá qua email/ứng dụng</li>
                <li>Hoặc truy cập "Tài khoản" --+ "Lịch sử đặt sân" --+ chọn đơn đã hoàn thành --+ "Đánh giá"</li>
                <li>Cho điểm từ 1-5 sao</li>
                <li>Viết nhận xét về trải nghiệm của bạn (không bắt buộc)</li>
                <li>Tải lên hình ảnh (nếu muốn)</li>
                <li>Nhấn "Gửi đánh giá"</li>
              </ol>
              
              <div className="guide-image">
                {<img src="/guides/rating.jpg" alt="Hướng dẫn đánh giá" />}
              </div>
              
              <h4>5.2. Bình luận và trả lời</h4>
              <ul className="policy-list">
                <li>Bạn có thể bình luận dưới các đánh giá của người khác</li>
                <li>Bạn cũng có thể trả lời các bình luận trên đánh giá của mình</li>
                <li>Mi24/7 kiểm duyệt tất cả đánh giá và bình luận để đảm bảo tuân thủ quy tắc cộng đồng</li>
              </ul>
              
              <h3>6. Quản lý tài khoản</h3>
              
              <h4>6.1. Cập nhật thông tin cá nhân</h4>
              <ol className="policy-numbered-list">
                <li>Đăng nhập vào tài khoản</li>
                <li>Truy cập mục "Tài khoản" --+ "Thông tin cá nhân"</li>
                <li>Cập nhật các thông tin cần thiết (họ tên, số điện thoại, địa chỉ, v.v.)</li>
                <li>Nhấn "Lưu thay đổi"</li>
              </ol>
              
              <h4>6.2. Đổi mật khẩu</h4>
              <ol className="policy-numbered-list">
                <li>Truy cập mục "Tài khoản" --+ "Đổi mật khẩu"</li>
                <li>Nhập mật khẩu hiện tại</li>
                <li>Nhập mật khẩu mới và xác nhận mật khẩu mới</li>
                <li>Nhấn "Cập nhật"</li>
              </ol>
              
              <h4>6.3. Quản lý ví Mi24/7</h4>
              <ol className="policy-numbered-list">
                <li>Truy cập mục "Tài khoản" --+ "Ví Mi24/7"</li>
                <li>Xem số dư hiện tại</li>
                <li>Nạp tiền: Nhấn "Nạp tiền", chọn số tiền, phương thức thanh toán và làm theo hướng dẫn</li>
                <li>Rút tiền: Nhấn "Rút tiền", nhập số tiền, thông tin tài khoản ngân hàng và xác nhận</li>
                <li>Xem lịch sử giao dịch ví</li>
              </ol>
              
              <div className="guide-image">
                <img src="/guides/wallet.png" alt="Hướng dẫn quản lý ví" />
              </div>
              
              <h3>7. Tìm đối, bắt cặp đấu</h3>
              
              <h4>7.1. Tạo đội bóng</h4>
              <ol className="policy-numbered-list">
                <li>Truy cập mục "Đội bóng" --+ "Tạo đội mới"</li>
                <li>Nhập thông tin đội: tên đội, logo, mô tả, loại đội (5/7/11 người)</li>
                <li>Mời thành viên tham gia qua email hoặc mã đội</li>
                <li>Nhấn "Tạo đội"</li>
              </ol>
              
              <h4>7.2. Tìm đối đá</h4>
              <ol className="policy-numbered-list">
                <li>Truy cập mục "Tìm đối"</li>
                <li>Chọn loại đội (5/7/11 người)</li>
                <li>Chọn khu vực, ngày và khung giờ mong muốn</li>
                <li>Nhấn "Tìm đối"</li>
                <li>Duyệt danh sách các đội đang tìm đối</li>
                <li>Nhấn "Kết nối" để gửi yêu cầu kết nối</li>
              </ol>
              
              <h4>7.3. Tạo trận đấu</h4>
              <ol className="policy-numbered-list">
                <li>Sau khi kết nối thành công với đội khác, nhấn "Tạo trận đấu"</li>
                <li>Chọn sân và thời gian</li>
                <li>Xác nhận thông tin và thanh toán</li>
                <li>Mời các thành viên trong đội tham gia</li>
                <li>Nhận xác nhận trận đấu qua email và SMS</li>
              </ol>
              
              <h3>8. Hỗ trợ</h3>
              
              <h4>8.1. Trung tâm hỗ trợ</h4>
              <p>
                Nếu bạn cần hỗ trợ, có nhiều cách để liên hệ với chúng tôi:
              </p>
              <ul className="policy-list">
                <li>Truy cập mục "Trợ giúp" trên website hoặc ứng dụng</li>
                <li>Chat trực tuyến với nhân viên hỗ trợ (8:00 - 22:00 hàng ngày)</li>
                <li>Gọi hotline: 0987.654.321 (8:00 - 22:00 hàng ngày)</li>
                <li>Gửi email: support@mi247.com</li>
                <li>Gửi yêu cầu hỗ trợ qua form trên website</li>
              </ul>
              
              <h4>8.2. Câu hỏi thường gặp (FAQ)</h4>
              <p>
                Bạn có thể tìm câu trả lời cho các câu hỏi thường gặp tại mục "Câu hỏi thường gặp" trên website hoặc ứng dụng. Các chủ đề FAQ bao gồm:
              </p>
              <ul className="policy-list">
                <li>Đăng ký và đăng nhập</li>
                <li>Tìm kiếm và đặt sân</li>
                <li>Thanh toán và hoàn tiền</li>
                <li>Hủy và đổi lịch đặt sân</li>
                <li>Tìm đối và tạo trận đấu</li>
                <li>Sự cố kỹ thuật và giải pháp</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserGuide;