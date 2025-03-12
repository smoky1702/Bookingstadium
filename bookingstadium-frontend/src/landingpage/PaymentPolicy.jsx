import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../landingpage/PolicylandingPages.css';

const PaymentPolicy = () => {
  return (
    <div className="policy-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Chính sách thanh toán</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>

      <div className="policy-content">
        <div className="container">
          <div className="policy-section">
            <h2 className="policy-title">Chính sách thanh toán Mi24/7</h2>
            
            <div className="policy-description">
              <h3>1. Phương thức thanh toán</h3>
              <p>
                Mi24/7 hỗ trợ nhiều phương thức thanh toán khác nhau để thuận tiện cho khách hàng:
              </p>
              
              <h4>1.1. Thanh toán trực tuyến</h4>
              <ul className="policy-list">
                <li>
                  <strong>Thẻ ngân hàng nội địa (ATM)</strong>: Hỗ trợ tất cả các ngân hàng tại Việt Nam có đăng ký Internet Banking
                  <div className="bank-logos">
                    <img src="/banks.jpg" alt="Internet Banking" />
                  </div>
                </li>
                <li>
                  <strong>Thẻ quốc tế</strong>: Visa, MasterCard, JCB, American Express
                  <div className="card-logos">
                    <img src="/cards.png" alt="Cards" />
                  </div>
                </li>
                <li>
                  <strong>Ví điện tử</strong>: MoMo, ZaloPay, VNPay, ShopeePay
                  <div className="ewallet-logos">
                    <img src="/ewallets.jpg" alt="ewallets" />
                  </div>
                </li>
              </ul>
              
              <h4>1.2. Ví Mi24/7</h4>
              <ul className="policy-list">
                <li>Khách hàng có thể nạp tiền vào Ví Mi24/7 để thanh toán nhanh chóng</li>
                <li>Ví Mi24/7 cũng lưu trữ số dư hoàn tiền, điểm thưởng đổi ra tiền</li>
                <li>Tiền trong Ví Mi24/7 không có thời hạn sử dụng</li>
                <li>Có thể rút tiền từ Ví Mi24/7 về tài khoản ngân hàng (phí 2.000 VNĐ/lần)</li>
              </ul>
              
              <h4>1.3. Thanh toán tại sân</h4>
              <ul className="policy-list">
                <li>Chỉ áp dụng với một số sân có hợp tác đặc biệt và được ghi chú rõ</li>
                <li>Khách hàng cần đặt cọc trước 20% qua cổng thanh toán Mi24/7</li>
                <li>Thanh toán phần còn lại trực tiếp tại sân bóng</li>
              </ul>
              
              <h3>2. Quy trình thanh toán</h3>
              <ol className="policy-numbered-list">
                <li>Chọn sân bóng, thời gian và các dịch vụ đi kèm (nếu có)</li>
                <li>Tiến hành đặt sân và chọn phương thức thanh toán</li>
                <li>Hoàn tất thanh toán theo hướng dẫn tương ứng với phương thức đã chọn</li>
                <li>Nhận xác nhận đặt sân thành công qua email và SMS</li>
              </ol>
              
              <div className="important-notice">
                <p><strong>Lưu ý:</strong> Đơn đặt sân chỉ được xác nhận sau khi thanh toán thành công. Trường hợp hệ thống ghi nhận thanh toán không thành công, đơn đặt sân sẽ được giữ trong 15 phút để bạn thực hiện thanh toán lại.</p>
              </div>
              
              <h3>3. Thời gian thanh toán</h3>
              <ul className="policy-list">
                <li>Thanh toán trực tuyến: Xử lý ngay lập tức 24/7</li>
                <li>Nạp tiền vào ví Mi24/7: Xử lý trong vòng 5 phút</li>
                <li>Rút tiền từ ví Mi24/7: Xử lý trong vòng 24 giờ làm việc</li>
              </ul>
              
              <h3>4. Chính sách an toàn thanh toán</h3>
              <p>
                Mi24/7 cam kết bảo mật thông tin thanh toán của khách hàng:
              </p>
              <ul className="policy-list">
                <li>Hệ thống thanh toán được mã hóa theo tiêu chuẩn PCI DSS</li>
                <li>Không lưu trữ thông tin thẻ tín dụng/thẻ ghi nợ của khách hàng</li>
                <li>Sử dụng các cổng thanh toán uy tín và được cấp phép tại Việt Nam</li>
                <li>Xác thực giao dịch bằng OTP hoặc phương thức xác thực khác</li>
                <li>Giám sát giao dịch 24/7 để phát hiện các hoạt động đáng ngờ</li>
              </ul>
              
              <h3>5. Hóa đơn thanh toán</h3>
              <ul className="policy-list">
                <li>Hóa đơn điện tử sẽ được gửi qua email sau khi thanh toán thành công</li>
                <li>Khách hàng có thể xem lại lịch sử thanh toán trong phần "Lịch sử giao dịch" trên tài khoản</li>
                <li>Yêu cầu xuất hóa đơn VAT: Vui lòng cung cấp thông tin xuất hóa đơn trong vòng 7 ngày kể từ khi thanh toán</li>
              </ul>
              
              <h3>6. Phí giao dịch</h3>
              <div className="refund-table">
                <table>
                  <thead>
                    <tr>
                      <th>Phương thức thanh toán</th>
                      <th>Phí giao dịch</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Thẻ ATM nội địa</td>
                      <td>Miễn phí</td>
                    </tr>
                    <tr>
                      <td>Thẻ quốc tế (Visa, MasterCard, JCB, Amex)</td>
                      <td>Miễn phí</td>
                    </tr>
                    <tr>
                      <td>Ví điện tử (MoMo, ZaloPay, VNPay, ShopeePay)</td>
                      <td>Miễn phí</td>
                    </tr>
                    <tr>
                      <td>Nạp tiền vào Ví Mi24/7</td>
                      <td>Miễn phí</td>
                    </tr>
                    <tr>
                      <td>Rút tiền từ Ví Mi24/7 về tài khoản ngân hàng</td>
                      <td>2.000 VNĐ/lần</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h3>7. Chính sách hoàn tiền</h3>
              <p>
                Trường hợp cần hoàn tiền (hủy đặt sân, không thể sử dụng sân, v.v.), Mi24/7 sẽ xử lý theo các hình thức sau:
              </p>
              <ul className="policy-list">
                <li><strong>Hoàn tiền vào Ví Mi24/7</strong>: Xử lý trong vòng 24 giờ</li>
                <li><strong>Hoàn tiền về thẻ/tài khoản ngân hàng gốc</strong>: Thời gian xử lý từ 5-15 ngày làm việc tùy theo ngân hàng</li>
                <li><strong>Hoàn tiền về ví điện tử</strong>: Thời gian xử lý từ 1-7 ngày làm việc tùy theo nhà cung cấp</li>
              </ul>
              <p>
                Để biết thêm chi tiết về điều kiện và tỷ lệ hoàn tiền, vui lòng tham khảo <Link to="/chinh-sach-huy-doi-tra" className="policy-link">Chính sách hủy đổi trả</Link> của chúng tôi.
              </p>
              
              <h3>8. Quy trình xử lý thanh toán không thành công</h3>
              <ol className="policy-numbered-list">
                <li>Khi giao dịch không thành công, Mi24/7 sẽ thông báo ngay trên màn hình và gửi email/SMS</li>
                <li>Lịch đặt sân sẽ được giữ trong 15 phút để bạn có thể thực hiện thanh toán lại</li>
                <li>Trong trường hợp tiền đã bị trừ nhưng không nhận được xác nhận, hệ thống sẽ tự động hoàn tiền trong vòng 24 giờ</li>
                <li>Nếu không nhận được tiền hoàn lại sau 24 giờ, vui lòng liên hệ bộ phận hỗ trợ khách hàng</li>
              </ol>
              
              <h3>9. Thông tin liên hệ hỗ trợ thanh toán</h3>
              <p>
                Nếu bạn gặp bất kỳ vấn đề nào liên quan đến thanh toán, vui lòng liên hệ:
              </p>
              <ul className="policy-list">
                <li>Hotline: 0247.303.0247 (8:00 - 22:00 hàng ngày)</li>
                <li>Email: payment@mi247.com</li>
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
              <Link to="/chinh-sach-khach-hang" className="policy-link">
                <i className="fas fa-user-shield"></i>
                <span>Chính sách khách hàng</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentPolicy;