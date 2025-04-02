import React from 'react';
import Footer from '../../components/Footer';
import '../AboutPage/AboutPage.css';
import Navbar from '../../components/Navbar';

const AboutPage = () => {
  return (
    <div className="about-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Giới thiệu</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>

      <div className="about-content">
        <div className="container">
          {/* Hero Section */}
          <div className="about-hero">
            <div className="about-hero-content">
              <h2>Nền tảng đặt sân bóng đá trực tuyến hàng đầu Việt Nam</h2>
              <p>Mi247.com - Giải pháp công nghệ hiện đại kết nối người chơi và chủ sân bóng đá trên khắp cả nước</p>
            </div>
            <div className="about-hero-image">
              {/* Chú thích: Thêm hình ảnh banner giới thiệu ở đây */}
              <img src="/about-banner.jpg" alt="Mi24/7 - Nền tảng đặt sân bóng đá" />
            </div>
          </div>
          
          {/* Our Story Section */}
          <div className="about-section">
            <div className="section-header">
              <h2>Câu chuyện của chúng tôi</h2>
              <div className="section-underline"></div>
            </div>
            <div className="about-story">
              <div className="story-content">
                <p>
                  Mi247.com ra đời với sứ mệnh kết nối cộng đồng thể thao và mang đến trải nghiệm đặt sân bóng đá trực tuyến thuận tiện, nhanh chóng nhất cho người dùng.
                </p>
                <p>
                  Được thành lập vào năm 2025, chúng tôi đã không ngừng phát triển và cải tiến nền tảng để đáp ứng nhu cầu ngày càng cao của người chơi và các chủ sân. Với đội ngũ nhân viên nhiệt huyết, yêu thể thao và am hiểu công nghệ, Mi24/7 đã trở thành địa chỉ tin cậy của hàng nghìn người dùng mỗi ngày.
                </p>
                <p>
                  Chúng tôi tin rằng việc tạo ra một hệ sinh thái kết nối giữa người chơi và chủ sân không chỉ giúp người dùng dễ dàng tìm kiếm và đặt sân mà còn góp phần phát triển phong trào thể thao trong cộng đồng.
                </p>
              </div>
              <div className="story-image">
                {/* Chú thích: Thêm hình ảnh câu chuyện ở đây */}
                <img src="/our-story.jpg" alt="Câu chuyện Mi24/7" />
              </div>
            </div>
          </div>
          
          {/* Our Mission Section */}
          <div className="about-section">
            <div className="section-header">
              <h2>Sứ mệnh của chúng tôi</h2>
              <div className="section-underline"></div>
            </div>
            <div className="mission-content">
              <div className="mission-item">
                <div className="mission-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3>Kết nối</h3>
                <p>Tạo cầu nối giữa người chơi và chủ sân thông qua nền tảng công nghệ hiện đại, đơn giản hóa quy trình đặt sân và quản lý.</p>
              </div>
              <div className="mission-item">
                <div className="mission-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Uy tín</h3>
                <p>Xây dựng nền tảng đáng tin cậy với thông tin minh bạch, đảm bảo trải nghiệm đặt sân an toàn và đáng tin cậy cho tất cả người dùng.</p>
              </div>
              <div className="mission-item">
                <div className="mission-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3>Cộng đồng</h3>
                <p>Phát triển cộng đồng thể thao lành mạnh, kết nối những người có chung đam mê thể thao và tạo điều kiện để họ tìm kiếm, gặp gỡ đối thủ.</p>
              </div>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="about-stats">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Sân bóng đối tác</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50000+</div>
              <div className="stat-label">Người dùng hàng tháng</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">63</div>
              <div className="stat-label">Tỉnh thành phố</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Hỗ trợ khách hàng</div>
            </div>
          </div>
          
          {/* Our Team */}
          <div className="about-section">
            <div className="section-header">
              <h2>Đội ngũ của chúng tôi</h2>
              <div className="section-underline"></div>
            </div>
            <div className="team-content">
              <p>
                Mi24/7 được phát triển bởi đội ngũ làm đồ án tốt nghiệp và đam mê thể thao. Chúng tôi hiểu rõ những thách thức mà người chơi và chủ sân gặp phải trong quá trình tìm kiếm sân và quản lý sân bóng.
              </p>
              <p>
                Với kinh nghiệm và kiến thức chuyên sâu, chúng tôi cam kết không ngừng đổi mới và cải tiến nền tảng để mang đến trải nghiệm tốt nhất cho người dùng. Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ khách hàng 24/7.
              </p>
              
              {/* Thêm hình ảnh đội ngũ ở đây */}
              <div className="team-images">
                <div className="team-image">
                  {/* Chú thích: Thêm hình ảnh đội ngũ ở đây */}
                  <img src="/team.jpg" alt="Đội ngũ Mi24/7" className="img-fluid" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact CTA */}
          <div className="contact-cta">
            <div className="cta-content">
              <h3>Bạn muốn tìm hiểu thêm về Mi24/7?</h3>
              <p>Đừng ngần ngại liên hệ với chúng tôi để được tư vấn và hỗ trợ</p>
              <a href="/lien-he" className="cta-button">Liên hệ ngay</a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;