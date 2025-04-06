import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { evaluationAPI, userAPI, stadiumAPI } from '../../services/apiService';
import './EvaluationPage.css';

const EvaluationPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState({});
  const [stadiums, setStadiums] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingOtherData, setLoadingOtherData] = useState(false);

  // Hàm lấy tất cả dữ liệu cần thiết
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Bắt đầu lấy tất cả dữ liệu...');
      
      // 1. Lấy dữ liệu đánh giá
      console.log('Đang gọi API đánh giá...');
      const evaluationsResponse = await evaluationAPI.getEvaluations();
      console.log('Evaluations API Response:', evaluationsResponse);
      
      // Xử lý dữ liệu đánh giá theo cấu trúc
      let evaluationData = [];
      if (evaluationsResponse.data && evaluationsResponse.data.result && Array.isArray(evaluationsResponse.data.result)) {
        evaluationData = evaluationsResponse.data.result;
      } else if (evaluationsResponse.data && Array.isArray(evaluationsResponse.data)) {
        evaluationData = evaluationsResponse.data;
      } else if (evaluationsResponse.data && typeof evaluationsResponse.data === 'object') {
        if (evaluationsResponse.data.result) {
          if (Array.isArray(evaluationsResponse.data.result)) {
            evaluationData = evaluationsResponse.data.result;
          } else {
            evaluationData = [evaluationsResponse.data.result];
          }
        } else {
          evaluationData = [evaluationsResponse.data];
        }
      }
      
      console.log('Dữ liệu đánh giá:', evaluationData);
      
      // 2. Thu thập tất cả ID người dùng và sân bóng để gọi API
      const userIds = new Set();
      const stadiumIds = new Set();
      
      evaluationData.forEach(evaluation => {
        // In chi tiết từng đánh giá để debug
        console.log('Chi tiết đánh giá:', evaluation);
        
        // Xác định userId - thử tất cả các khóa có thể
        const userId = evaluation.userId || 
                       evaluation.user_id || 
                       (evaluation.user && (evaluation.user.id || evaluation.user)) ||
                       null;
        
        // Xác định stadiumId - thử tất cả các khóa có thể
        const stadiumId = evaluation.stadiumId || 
                          evaluation.stadium_id || 
                          (evaluation.stadium && (evaluation.stadium.id || evaluation.stadium)) ||
                          null;
        
        console.log(`Đã xác định: userId=${userId}, stadiumId=${stadiumId}`);
        
        if (userId) userIds.add(userId);
        if (stadiumId) stadiumIds.add(stadiumId);
      });
      
      console.log('Danh sách ID người dùng cần lấy:', [...userIds]);
      console.log('Danh sách ID sân bóng cần lấy:', [...stadiumIds]);
      
      // 3. Lấy thông tin người dùng - Gọi API tất cả người dùng
      setLoadingOtherData(true);
      
      try {
        console.log('Đang gọi API lấy danh sách người dùng...');
        const usersResponse = await userAPI.getAllUsers();
        console.log('Users API Response:', usersResponse);
        
        let usersMap = {};
        let usersData = [];
        
        // Xác định mảng dữ liệu người dùng
        if (usersResponse.data && usersResponse.data.result && Array.isArray(usersResponse.data.result)) {
          usersData = usersResponse.data.result;
        } else if (usersResponse.data && Array.isArray(usersResponse.data)) {
          usersData = usersResponse.data;
        }
        
        // Log toàn bộ danh sách người dùng để debug
        console.log('Danh sách người dùng nhận được:', usersData);
        
        // Tạo map từ ID đến thông tin người dùng
        usersData.forEach(user => {
          const userId = user.id || user.userId || user.user_id;
          if (userId) {
            usersMap[userId] = user;
            console.log(`Đã mapping user: ${userId} -> `, user);
          }
        });
        
        console.log('User map đã tạo:', usersMap);
        setUsers(usersMap);
      } catch (userError) {
        console.error('Lỗi khi lấy danh sách người dùng:', userError);
      }
      
      // 4. Lấy thông tin sân bóng - Gọi API tất cả sân bóng
      try {
        console.log('Đang gọi API lấy danh sách sân bóng...');
        const stadiumsResponse = await stadiumAPI.getStadiums();
        console.log('Stadiums API Response:', stadiumsResponse);
        
        let stadiumsMap = {};
        let stadiumsData = [];
        
        // Xác định mảng dữ liệu sân bóng
        if (stadiumsResponse.data && stadiumsResponse.data.result && Array.isArray(stadiumsResponse.data.result)) {
          stadiumsData = stadiumsResponse.data.result;
        } else if (stadiumsResponse.data && Array.isArray(stadiumsResponse.data)) {
          stadiumsData = stadiumsResponse.data;
        }
        
        // Log toàn bộ danh sách sân bóng để debug
        console.log('Danh sách sân bóng nhận được:', stadiumsData);
        
        // Tạo map từ ID đến thông tin sân bóng
        stadiumsData.forEach(stadium => {
          const stadiumId = stadium.id || stadium.stadiumId || stadium.stadium_id;
          if (stadiumId) {
            stadiumsMap[stadiumId] = stadium;
            console.log(`Đã mapping stadium: ${stadiumId} -> `, stadium);
          }
        });
        
        console.log('Stadium map đã tạo:', stadiumsMap);
        setStadiums(stadiumsMap);
      } catch (stadiumError) {
        console.error('Lỗi khi lấy danh sách sân bóng:', stadiumError);
      }
      
      // 5. Cập nhật state và hoàn thành
      setEvaluations(evaluationData || []);
      setLoadingOtherData(false);
      
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Effect chính để lấy dữ liệu
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Lấy tên người dùng
  const getUserName = (userId) => {
    if (!userId) return 'Người dùng không xác định';
    
    console.log(`Đang lấy tên người dùng cho ID: ${userId}`);
    console.log('Dữ liệu user có sẵn:', users[userId]);
    
    if (users[userId]) {
      const user = users[userId];
      
      // Ưu tiên hiển thị firstname + lastname
      if (user.firstname && user.lastname) {
        console.log(`Tìm thấy firstname + lastname: ${user.firstname} ${user.lastname}`);
        return `${user.firstname} ${user.lastname}`;
      } 
      
      // Các trường hợp khác
      if (user.fullName) return user.fullName;
      if (user.username) return user.username;
      if (user.email) return user.email.split('@')[0];
    }
    
    // Kiểm tra nếu thông tin người dùng có trong object evaluation
    // (một số API trả về thông tin nested)
    const evaluation = evaluations.find(item => 
      item.userId === userId || 
      item.user_id === userId || 
      (item.user && (item.user.id === userId || item.user === userId))
    );
    
    if (evaluation) {
      console.log('Tìm được thông tin user trong evaluation:', evaluation);
      
      // Nếu user là object có firstname và lastname
      if (evaluation.user && typeof evaluation.user === 'object') {
        if (evaluation.user.firstname && evaluation.user.lastname) {
          console.log(`Từ evaluation.user: ${evaluation.user.firstname} ${evaluation.user.lastname}`);
          return `${evaluation.user.firstname} ${evaluation.user.lastname}`;
        }
      }
      
      // Nếu evaluation trực tiếp có firstname và lastname
      if (evaluation.firstname && evaluation.lastname) {
        console.log(`Từ evaluation trực tiếp: ${evaluation.firstname} ${evaluation.lastname}`);
        return `${evaluation.firstname} ${evaluation.lastname}`;
      }
    }
    
    // Mặc định nếu không có thông tin
    return `Người dùng (${userId.substring(0, 6)}...)`;
  };
  
  // Lấy thông tin sân bóng
  const getStadiumInfo = (stadiumId) => {
    if (!stadiumId) return 'Sân bóng không xác định';
    
    console.log(`Đang lấy thông tin sân bóng cho ID: ${stadiumId}`);
    console.log('Dữ liệu stadium có sẵn:', stadiums[stadiumId]);
    
    if (stadiums[stadiumId]) {
      const stadium = stadiums[stadiumId];
      
      // Ưu tiên kết hợp stadium_name + location_name
      let stadiumName = stadium.stadium_name || stadium.stadiumName || stadium.name || '';
      let locationName = stadium.location_name || stadium.locationName || '';
      
      // Nếu location là object
      if (stadium.location && typeof stadium.location === 'object') {
        locationName = stadium.location.location_name || 
                       stadium.location.locationName || 
                       stadium.location.name || 
                       stadium.location.address || 
                       locationName;
      }
      
      console.log(`Đã xác định stadiumName: ${stadiumName}, locationName: ${locationName}`);
      
      // Kết hợp thông tin
      if (stadiumName && locationName) return `${stadiumName} - ${locationName}`;
      if (stadiumName) return stadiumName;
      if (locationName) return locationName;
    }
    
    // Kiểm tra nếu thông tin sân bóng có trong object evaluation
    const evaluation = evaluations.find(item => 
      item.stadiumId === stadiumId || 
      item.stadium_id === stadiumId || 
      (item.stadium && (item.stadium.id === stadiumId || item.stadium === stadiumId))
    );
    
    if (evaluation) {
      console.log('Tìm được thông tin stadium trong evaluation:', evaluation);
      
      // Nếu stadium là object có stadium_name
      if (evaluation.stadium && typeof evaluation.stadium === 'object') {
        let stadiumName = evaluation.stadium.stadium_name || evaluation.stadium.stadiumName || evaluation.stadium.name || '';
        let locationName = evaluation.stadium.location_name || evaluation.stadium.locationName || '';
        
        // Nếu stadium.location là object
        if (evaluation.stadium.location && typeof evaluation.stadium.location === 'object') {
          locationName = evaluation.stadium.location.location_name || 
                         evaluation.stadium.location.locationName || 
                         evaluation.stadium.location.name || 
                         locationName;
        }
        
        if (stadiumName && locationName) return `${stadiumName} - ${locationName}`;
        if (stadiumName) return stadiumName;
        if (locationName) return locationName;
      }
      
      // Nếu evaluation trực tiếp có stadium_name
      let stadiumName = evaluation.stadium_name || evaluation.stadiumName || '';
      let locationName = evaluation.location_name || evaluation.locationName || '';
      
      if (stadiumName && locationName) return `${stadiumName} - ${locationName}`;
      if (stadiumName) return stadiumName;
      if (locationName) return locationName;
    }
    
    // Mặc định nếu không có thông tin
    return `Sân bóng (${stadiumId.substring(0, 6)}...)`;
  };
  
  // Hiển thị sao đánh giá
  const renderStars = (ratingScore) => {
    const score = parseFloat(ratingScore) || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= score) {
        // Sao đầy
        stars.push(<i key={i} className="fas fa-star filled"></i>);
      } else if (i - 0.5 <= score) {
        // Nửa sao
        stars.push(<i key={i} className="fas fa-star-half-alt filled"></i>);
      } else {
        // Sao trống
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    
    return stars;
  };
  
  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch(e) {
      return dateString;
    }
  };

  return (
    <div className="evaluation-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-star"></i>
            </div>
            <h1 className="page-title">Đánh giá từ khách hàng</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>
      
      <div className="evaluation-content">
        <div className="container">
          {loading && (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Đang tải dữ liệu đánh giá...</span>
            </div>
          )}
          
          {loadingOtherData && !loading && (
            <div className="loading-other" style={{margin: '10px 0', color: '#666', fontSize: '14px'}}>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span> Đang tải thông tin người dùng và sân bóng...</span>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          {!loading && !error && evaluations.length === 0 && (
            <div className="no-evaluations">
              <i className="far fa-frown"></i>
              <p>Chưa có đánh giá nào.</p>
            </div>
          )}
          
          {!loading && !error && evaluations.length > 0 && (
            <div className="evaluations-list">
              {evaluations.map((evaluation, index) => {
                // Lấy các trường dữ liệu từ evaluation
                const evaluationId = evaluation.id || evaluation.evaluationId || evaluation.evaluation_id || index;
                
                // Lấy userId từ nhiều trường có thể
                const userId = evaluation.userId || 
                               evaluation.user_id || 
                               (evaluation.user && (evaluation.user.id || evaluation.user)) ||
                               null;
                
                // Lấy stadiumId từ nhiều trường có thể
                const stadiumId = evaluation.stadiumId || 
                                  evaluation.stadium_id || 
                                  (evaluation.stadium && (evaluation.stadium.id || evaluation.stadium)) ||
                                  null;
                
                // Lấy điểm đánh giá
                const ratingScore = evaluation.ratingScore || 
                                   evaluation.rating_score || 
                                   evaluation.rating || 
                                   0;
                
                // Lấy nội dung bình luận
                const comment = evaluation.comment || evaluation.content || "";
                
                // Lấy ngày tạo
                const dateCreated = evaluation.dateCreated || 
                                   evaluation.date_created || 
                                   evaluation.createdAt || 
                                   evaluation.created_at;
                
                return (
                  <div key={evaluationId} className="evaluation-card">
                    <div className="evaluation-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="user-details">
                          <h3 className="user-name">{getUserName(userId)}</h3>
                          <p className="evaluation-date">{formatDate(dateCreated)}</p>
                        </div>
                      </div>
                      <div className="rating">
                        {renderStars(ratingScore)}
                        <span className="rating-score">{ratingScore}</span>
                      </div>
                    </div>
                    
                    <div className="evaluation-location">
                      <i className="fas fa-futbol"></i>
                      <span>{getStadiumInfo(stadiumId)}</span>
                    </div>
                    
                    <div className="evaluation-comment">
                      <p>{comment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EvaluationPage;