import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../landingpage/PolicylandingPages.css';

const CustomerPolicy = () => {
  return (
    <div className="policy-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Chính sách khách hàng</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>

      <div className="policy-content">
        <div className="container">
          <div className="policy-section">
            <h2 className="policy-title">Chính sách khách hàng Mi24/7</h2>
            
            <div className="policy-description">
              <h3>1. Quyền lợi của khách hàng</h3>
              <p>
                Tại Mi24/7, chúng tôi cam kết mang lại trải nghiệm đặt sân tốt nhất cho khách hàng. Khi sử dụng dịch vụ của chúng tôi, bạn được hưởng các quyền lợi sau:
              </p>
              <ul className="policy-list">
                <li>Đặt sân nhanh chóng, tiện lợi, minh bạch về giá cả và dịch vụ</li>
                <li>Xem đầy đủ thông tin về sân bóng trước khi đặt (hình ảnh, giá cả, tiện ích, đánh giá)</li>
                <li>Nhận xác nhận đặt sân và nhắc lịch qua SMS/email</li>
                <li>Được hỗ trợ 24/7 cho mọi vấn đề phát sinh</li>
                <li>Tích điểm thưởng cho mỗi lần đặt sân thành công</li>
                <li>Nhận các ưu đãi và khuyến mãi đặc biệt</li>
                <li>Quyền góp ý, phản hồi về chất lượng dịch vụ</li>
                <li>Quyền khiếu nại và được giải quyết thỏa đáng</li>
              </ul>
              
              <h3>2. Chính sách thành viên</h3>
              <h4>2.1. Cấp độ thành viên</h4>
              <div className="refund-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cấp độ</th>
                      <th>Điều kiện</th>
                      <th>Ưu đãi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Thành viên Thường</td>
                      <td>Đăng ký tài khoản</td>
                      <td>
                        <ul>
                          <li>Tích 1% điểm thưởng trên mỗi đơn đặt sân</li>
                          <li>Nhận các khuyến mãi cơ bản</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td>Thành viên Bạc</td>
                      <td>Đặt từ 10 đơn/năm</td>
                      <td>
                        <ul>
                          <li>Tích 2% điểm thưởng</li>
                          <li>Giảm 3% phí đặt sân</li>
                          <li>Ưu tiên đặt sân vào giờ cao điểm</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td>Thành viên Vàng</td>
                      <td>Đặt từ 25 đơn/năm</td>
                      <td>
                        <ul>
                          <li>Tích 3% điểm thưởng</li>
                          <li>Giảm 5% phí đặt sân</li>
                          <li>Hỗ trợ viên riêng</li>
                          <li>Miễn phí hủy đặt sân (trước 24h)</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td>Thành viên Kim Cương</td>
                      <td>Đặt từ 50 đơn/năm</td>
                      <td>
                        <ul>
                          <li>Tích 5% điểm thưởng</li>
                          <li>Giảm 10% phí đặt sân</li>
                          <li>Hỗ trợ viên riêng 24/7</li>
                          <li>Miễn phí hủy đặt sân (trước 12h)</li>
                          <li>Ưu đãi đặc biệt vào dịp sinh nhật</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4>2.2. Điểm thưởng</h4>
              <ul className="policy-list">
                <li>1 điểm thưởng = 1.000 VNĐ</li>
                <li>Điểm thưởng có hiệu lực trong vòng 12 tháng kể từ ngày tích lũy</li>
                <li>Điểm thưởng có thể dùng để thanh toán cho các lần đặt sân tiếp theo</li>
                <li>Điểm thưởng không được áp dụng cùng với các chương trình khuyến mãi khác</li>
              </ul>
              
              <h3>3. Trách nhiệm của khách hàng</h3>
              <p>
                Khi sử dụng dịch vụ của Mi24/7, khách hàng có trách nhiệm:
              </p>
              <ul className="policy-list">
                <li>Cung cấp thông tin chính xác khi đăng ký tài khoản và đặt sân</li>
                <li>Tuân thủ lịch đặt sân và đến đúng giờ</li>
                <li>Tuân thủ nội quy của sân bóng</li>
                <li>Thanh toán đầy đủ và đúng hạn</li>
                <li>Bảo vệ thông tin tài khoản cá nhân</li>
                <li>Không sử dụng dịch vụ Mi24/7 vào mục đích bất hợp pháp</li>
                <li>Thông báo cho Mi24/7 khi phát hiện sai sót hoặc vấn đề trong quá trình sử dụng dịch vụ</li>
              </ul>
              
              <h3>4. Chính sách giải quyết khiếu nại</h3>
              <h4>4.1. Quy trình khiếu nại</h4>
              <ol className="policy-numbered-list">
                <li>Gửi khiếu nại qua kênh hỗ trợ (email, hotline, chat) trong vòng 48 giờ kể từ khi phát sinh vấn đề</li>
                <li>Cung cấp đầy đủ thông tin: mã đơn hàng, thời gian, nội dung khiếu nại, bằng chứng (nếu có)</li>
                <li>Đội ngũ hỗ trợ sẽ liên hệ trong vòng 24 giờ để xác nhận thông tin</li>
                <li>Mi24/7 sẽ phối hợp với chủ sân để xác minh và giải quyết khiếu nại</li>
                <li>Thông báo kết quả giải quyết trong thời gian sớm nhất có thể</li>
              </ol>
              
              <h4>4.2. Thời gian giải quyết khiếu nại</h4>
              <ul className="policy-list">
                <li>Khiếu nại thông thường: 1-3 ngày làm việc</li>
                <li>Khiếu nại phức tạp: 3-7 ngày làm việc</li>
                <li>Trường hợp đặc biệt: tối đa 14 ngày làm việc</li>
              </ul>
              
              <h3>5. Chính sách đền bù</h3>
              <p>
                Trong trường hợp xảy ra sự cố do lỗi của Mi24/7 hoặc chủ sân, chúng tôi có chính sách đền bù như sau:
              </p>
              <ul className="policy-list">
                <li>Sân không đúng với mô tả: Hoàn tiền 100% hoặc đổi sân miễn phí</li>
                <li>Đặt sân thành công nhưng chủ sân không xác nhận: Hoàn tiền 100% và tặng voucher 100.000 VNĐ</li>
                <li>Đặt sân thành công nhưng đến nơi sân không sẵn sàng: Hoàn tiền 100% và tặng voucher 200.000 VNĐ</li>
                <li>Các vấn đề khác: Đền bù theo mức độ ảnh hưởng thực tế sau khi đánh giá</li>
              </ul>
              
              <h3>6. Chương trình khách hàng thân thiết</h3>
              <p>
                Mi24/7 triển khai chương trình khách hàng thân thiết nhằm tri ân những khách hàng đã luôn đồng hành cùng chúng tôi:
              </p>
              <ul className="policy-list">
                <li>Sinh nhật thành viên: Tặng voucher đặt sân trị giá 100.000 - 500.000 VNĐ tùy cấp độ thành viên</li>
                <li>Ưu đãi dành riêng: Thông báo sớm và được ưu tiên tham gia các chương trình khuyến mãi đặc biệt</li>
                <li>Quà tặng định kỳ: Nhận quà tặng khi đạt các mốc lịch sử đặt sân</li>
                <li>Giới thiệu bạn bè: Nhận thưởng khi giới thiệu bạn bè sử dụng dịch vụ Mi24/7</li>
              </ul>
              
              <h3>7. Chính sách bảo mật thông tin khách hàng</h3>
              <p>
                Mi24/7 cam kết bảo mật thông tin cá nhân của khách hàng theo Chính sách bảo mật. Chúng tôi chỉ thu thập những thông tin cần thiết để cung cấp dịch vụ và không chia sẻ thông tin với bên thứ ba khi chưa được sự đồng ý của khách hàng.
              </p>
              <p>
                Để biết thêm chi tiết, vui lòng tham khảo <Link to="/chinh-sach-bao-mat" className="policy-link">Chính sách bảo mật</Link> của chúng tôi.
              </p>
              
              <h3>8. Thông tin liên hệ</h3>
              <p>
                Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào về Chính sách khách hàng, vui lòng liên hệ với chúng tôi qua:
              </p>
              <ul className="policy-list">
                <li>Hotline: 0987.654.321 (8:00 - 22:00 hàng ngày)</li>
                <li>Email: support@mi247.com</li>
                <li>Địa chỉ: Việt Nam</li>
                <li>Chat trực tuyến trên website hoặc ứng dụng</li>
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

export default CustomerPolicy;

