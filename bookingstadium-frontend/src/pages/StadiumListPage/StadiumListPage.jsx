import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faMoneyBillWave, faFutbol, faBasketballBall, faVolleyballBall, faTableTennis, faLocationArrow, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import { stadiumAPI, typeAPI, locationAPI, imageAPI} from '../../services/apiService';
import { getTypeStyleSettings, getTypeIcon, getTypeColor } from '../../utils/typeStyleUtils';
import './StadiumListPage.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Mảng các icon có sẵn
const availableIcons = [
  { name: 'Bóng đá', icon: faFutbol },
  { name: 'Bóng rổ', icon: faBasketballBall },
  { name: 'Bóng chuyền', icon: faVolleyballBall },
  { name: 'Cầu lông', icon: faTableTennis }
];


const StadiumListPage = () => {
  const [stadiums, setStadiums] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const stadiumsPerPage = 9;
  const [stadiumImages, setStadiumImages] = useState({});
  
  // State cấu hình hiển thị (chỉ đọc)
  const [typeStyleSettings, setTypeStyleSettings] = useState({});

  const navigate = useNavigate();

  // Lấy cấu hình màu sắc và icon từ localStorage
  useEffect(() => {
    // Hàm đọc cài đặt từ localStorage
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('typeStyleSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setTypeStyleSettings(settings);
        } catch (e) {
          // Bỏ console.error
          setTypeStyleSettings({});
        }
      }
    };

    // Hàm xử lý khi localStorage thay đổi từ tab khác
    const handleStorageChange = (e) => {
      if (e.key === 'typeStyleSettings') {
        loadSettings();
      }
    };
    
    // Hàm xử lý khi cài đặt thay đổi trong cùng tab
    const handleSettingsChange = (event) => {
      setTypeStyleSettings(event.detail.settings || getTypeStyleSettings());
    };

    // Đăng ký lắng nghe sự kiện storage (thay đổi từ tab khác)
    window.addEventListener('storage', handleStorageChange);
    
    // Đăng ký lắng nghe sự kiện tùy chỉnh (thay đổi từ cùng tab)
    window.addEventListener('typeSettingsChanged', handleSettingsChange);
    
    // Đọc cài đặt lần đầu
    loadSettings();
    
    // Cleanup listener khi unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('typeSettingsChanged', handleSettingsChange);
    };
  }, []);

  // Fetch dữ liệu
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
      // Hàm helper để xử lý cấu trúc dữ liệu đa dạng từ API
      const extractArrayData = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.result && Array.isArray(data.result)) return data.result;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?.content && Array.isArray(data.content)) return data.content;
        return [];
      };
      
      // 1. Fetch stadiums
      let processedStadiums = [];
      try {
        const response = await stadiumAPI.getStadiums();
        processedStadiums = extractArrayData(response.data);
      } catch (err) {
        try {
          // Thử endpoint thay thế
          const alternativeResponse = await stadiumAPI.getStadiumsAlternative();
          processedStadiums = extractArrayData(alternativeResponse.data);
        } catch (altErr) {
          setError(`Không thể tải dữ liệu sân bóng. Vui lòng đảm bảo backend đang chạy.`);
          setLoading(false);
          return;
        }
      }
      
      // Cập nhật state với dữ liệu sân
      setStadiums(processedStadiums);
      
      // 2. Fetch images
      try {
        const imagesMap = {};
        const response = await imageAPI.getImages();
        const allImages = extractArrayData(response.data);
        
        // Map ảnh vào sân tương ứng
        processedStadiums.forEach(stadium => {
          const stadiumId = stadium.stadiumId || stadium.id;
          if (!stadiumId) return;
          
          const stadiumImages = allImages.filter(img => img.stadiumId === stadiumId);
          if (stadiumImages.length > 0) {
            imagesMap[stadiumId] = stadiumImages[0].imageUrl;
          }
        });
        
        setStadiumImages(imagesMap);
      } catch (error) {
        // Silent fail - không gây lỗi nếu không tải được ảnh
      }
      
      // 3. Fetch types
      try {
        const typesResponse = await typeAPI.getTypes();
        const typesData = extractArrayData(typesResponse.data);
        setTypes(typesData);
      } catch (error) {
        try {
          // Thử endpoint thay thế cho types
          const altTypesResponse = await typeAPI.getTypesAlternative();
          const altTypesData = extractArrayData(altTypesResponse.data);
          setTypes(altTypesData);
        } catch (altError) {
          // Không gây lỗi critical nếu không tải được types
        }
      }
      
      // 4. Fetch locations và enrich stadiums
      try {
        const locationsResponse = await locationAPI.getLocations();
        const locations = extractArrayData(locationsResponse.data);
        
        // Enrich stadiums với location data
        const enhancedStadiums = [...processedStadiums];
        
        enhancedStadiums.forEach((stadium, index) => {
          const locationId = stadium.locationId;
          
          if (locationId) {
            const locationInfo = locations.find(loc => loc.locationId === locationId);
            
            if (locationInfo) {
              enhancedStadiums[index] = {
                ...enhancedStadiums[index],
                location: locationInfo,
                address: locationInfo.address || enhancedStadiums[index].address,
                district: locationInfo.district || enhancedStadiums[index].district,
                city: locationInfo.city || enhancedStadiums[index].city
              };
            }
          }
        });
        
        setStadiums(enhancedStadiums);
      } catch (error) {
        // Silent fail - vẫn hiển thị stadium nếu không lấy được location
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    setCurrentPage(1);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Đã lọc tự động khi searchTerm thay đổi
  };

  // Lọc sân theo tìm kiếm và type đã chọn
  const filteredStadiums = useMemo(() => {
    return stadiums.filter(stadium => {
      const nameMatch = stadium.stadiumName && stadium.stadiumName.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = !selectedType || stadium.typeId === selectedType;
      return nameMatch && typeMatch;
    });
  }, [stadiums, searchTerm, selectedType]);
  
  // Tính toán phân trang
  const totalPages = Math.ceil(filteredStadiums.length / stadiumsPerPage);
  const indexOfLastStadium = currentPage * stadiumsPerPage;
  const indexOfFirstStadium = indexOfLastStadium - stadiumsPerPage;
  const currentStadiums = filteredStadiums.slice(indexOfFirstStadium, indexOfLastStadium);

  // Xử lý chuyển trang
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(filteredStadiums.length / stadiumsPerPage);
    setCurrentPage(prev => Math.min(prev + 1, maxPage));
  };

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);
  
  // Đếm số lượng sân theo từng loại
  const getStadiumCountByType = (typeId) => {
    return stadiums.filter(stadium => stadium.typeId === typeId).length;
  };
  
  // Lấy tên loại sân từ typeId
  const getTypeName = (typeId) => {
    const type = types.find(t => t.typeId === typeId);
    return type ? type.typeName : `Loại sân ID: ${typeId}`;
  };
  
  // Lấy tên sân - từ API field là "stadiumName"
  const getStadiumName = (stadium) => {
    if (!stadium) return "Sân bóng";
    
    return stadium.stadiumName || stadium.name || "Sân bóng";
  };
  
  // Lấy thành phố riêng
  const getCity = (stadium) => {
    if (!stadium) return "Chưa cập nhật thành phố";
    
    // Nếu có location object
    if (stadium.location && typeof stadium.location === 'object') {
      if (stadium.location.city) return stadium.location.city;
    }
    
    // Trường hợp thuộc tính đã được trích xuất trực tiếp
    return stadium.city || "Chưa cập nhật thành phố";
  };

  // Lấy quận/huyện riêng
  const getDistrict = (stadium) => {
    if (!stadium) return 'Chưa có thông tin';
    
    if (stadium.location && stadium.location.district) {
      return stadium.location.district;
    }
    
    return stadium.district || 'Chưa có thông tin';
  };

  // Lấy địa chỉ chi tiết (không bao gồm district và city)
  const getAddress = (stadium) => {
    if (!stadium) return 'Chưa có thông tin';
    
    // Nếu có location object
    if (stadium.location && typeof stadium.location === 'object') {
      return stadium.location.address || 'Chưa có thông tin';
    }
    
    // Trường hợp dữ liệu trực tiếp
    return stadium.address || 'Chưa có thông tin';
  };

  // Lấy địa chỉ đầy đủ (chỉ hiển thị trong chi tiết)
  const getFullAddress = (stadium) => {
    if (!stadium) return 'Chưa có thông tin';
    
    const address = getAddress(stadium);
    const district = getDistrict(stadium);
    const city = getCity(stadium);
    
    return [address, district, city]
      .filter(part => part && part.trim() !== '' && part !== 'Chưa có thông tin' && part !== 'Chưa cập nhật thành phố')
      .join(', ') || 'Chưa có thông tin';
  };
  
  // Lấy giá sân từ API
  const getStadiumPrice = (stadium) => {
    if (!stadium || !stadium.price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(stadium.price);
  };
  
  // Lấy hình ảnh từ API nếu có, ngược lại dùng ảnh mặc định
  const getStadiumImage = (stadium) => {
    if (!stadium) return '/stadium-placeholder.jpg';
    
    const stadiumId = stadium.stadiumId || stadium.id;
    if (!stadiumId) return '/stadium-placeholder.jpg';
    
    // Nếu stadium có thuộc tính imageUrl trực tiếp
    if (stadium.imageUrl) {
      // Kiểm tra xem imageUrl có phải là đường dẫn đầy đủ không
      if (stadium.imageUrl.startsWith('http')) {
        return stadium.imageUrl;
      }
      
      // Nếu là đường dẫn tương đối, thêm base URL
      return `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'}${stadium.imageUrl}`;
    }
    
    const imageUrl = stadiumImages[stadiumId];
    
    if (!imageUrl) return '/stadium-placeholder.jpg';
    
    // Kiểm tra xem imageUrl có phải là đường dẫn đầy đủ không
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL
    return `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'}${imageUrl}`;
  };

  // Kiểm tra trạng thái sân
  const getStadiumStatus = (stadium) => {
    if (!stadium || !stadium.status) return { text: 'Không xác định', className: '' };
    
    switch(stadium.status.toUpperCase()) {
      case 'AVAILABLE':
        return { text: 'Còn trống', className: 'available' };
      case 'BOOKED':
        return { text: 'Đã đặt', className: 'booked' };
      case 'MAINTENANCE':
        return { text: 'Bảo trì', className: 'maintenance' };
      default:
        return { text: 'Không xác định', className: '' };
    }
  };
  
  // Hiển thị dropdown chọn loại sân
  const renderTypeFilter = () => (
    <div className="filter-section">
      <h3 className="filter-title">Loại sân</h3>
      <div className="type-filter-list">
        <div 
          className={`type-filter-item ${selectedType === '' ? 'active' : ''}`}
          onClick={() => setSelectedType('')}
          style={selectedType === '' ? {backgroundColor: "#1a4297"} : {}}
        >
          <div className="type-filter-content">
            <span className="type-icon" style={{backgroundColor: "rgba(26, 66, 151, 0.1)", color: "#1a4297"}}>
              <FontAwesomeIcon icon={faFutbol} />
            </span>
            <span className="type-name">Tất cả</span>
            <span className="type-count">{stadiums.length}</span>
          </div>
        </div>
        
        {types.map((type, index) => {
          const typeColor = getTypeColor(type.typeName);
          // Giả định loại sân thứ 3 là mới
          const isNewType = index === 2;
          
          return (
            <div 
              key={type.typeId} 
              className={`type-filter-item ${selectedType === type.typeId ? 'active' : ''}`}
              onClick={() => setSelectedType(type.typeId)}
              style={selectedType === type.typeId ? {backgroundColor: typeColor, borderColor: typeColor} : {}}
            >
              {isNewType && <span className="type-new-badge">Mới</span>}
              <div className="type-filter-content">
                <span 
                  className="type-icon" 
                  style={{
                    backgroundColor: selectedType === type.typeId ? 
                                    "rgba(255, 255, 255, 0.25)" : 
                                    `${typeColor}20`, // 20% opacity
                    color: selectedType === type.typeId ? "#fff" : typeColor
                  }}
                >
                  <FontAwesomeIcon icon={getTypeIcon(type.typeName)} />
                </span>
                <span className="type-name">{type.typeName}</span>
                <span 
                  className="type-count"
                  style={selectedType === type.typeId ? 
                        {backgroundColor: "#fff", color: typeColor} : 
                        {backgroundColor: `${typeColor}15`, color: typeColor}}
                >
                  {getStadiumCountByType(type.typeId)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render một stadium card với thông tin đầy đủ
  const renderStadiumCard = (stadium) => {
    const imageUrl = getStadiumImage(stadium);
    const status = getStadiumStatus(stadium);
    const price = getStadiumPrice(stadium);
    const city = getCity(stadium);
    const district = getDistrict(stadium);
    const address = getAddress(stadium);
    const stadiumName = getStadiumName(stadium);
    
    // Tạo địa chỉ chi tiết (address + district)
    const addressDetail = [address, district]
      .filter(part => part && part.trim() !== '' && part !== 'Chưa có thông tin')
      .join(', ') || 'Chưa có thông tin';
    
    return (
      <div className="stadium-card" key={stadium.stadiumId || stadium.id}>
        <div className={`stadium-image ${!imageUrl ? 'no-image' : ''}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={stadiumName}
              onError={(e) => {
                e.target.onerror = null; // Tránh vòng lặp vô hạn
                e.target.parentNode.classList.add('no-image');
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="no-image-placeholder"></div>
          )}
        </div>
        
        <div className="stadium-info">
          {/* 1. Tên sân */}
          <h3>{stadiumName}</h3>
          
          <div className="location-info">
            {/* 2. Thành phố */}
            <p className="location-name">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
              <strong>{city}</strong>
            </p>
            
            {/* 3. Địa chỉ + Quận/huyện */}
            <p className="address">
              <FontAwesomeIcon icon={faLocationArrow} className="address-icon" />
              <span>{addressDetail}</span>
            </p>
          </div>
          
          <div className="price-status">
            <span className="price">
              <FontAwesomeIcon icon={faMoneyBillWave} className="price-icon" />
              {price}
            </span>
            
            <span className={`status ${status.className}`}>
              {status.text}
            </span>
          </div>
          
          <div className="stadium-actions">
            <button className="booking-btn" onClick={() => navigate(`/san/${stadium.stadiumId || stadium.id}`)}>
              <FontAwesomeIcon icon={faInfoCircle} className="booking-icon" />
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="stadium-list-page">
      <Navbar />
      
      <div className="main-content">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <FontAwesomeIcon icon={faStar} />
            </div>
            <h1 className="page-title">Danh sách sân bãi</h1>
            <div className="title-underline"></div>
          </div>
          
          <div className="content-wrapper">
            {/* Sidebar với danh sách loại sân từ API */}
            <aside className="sidebar">
              <div className="sidebar-section">
                <h3 className="sidebar-title">Danh sách sân bãi</h3>
                {renderTypeFilter()}
        </div>
            </aside>
            
            {/* Main content */}
            <div className="content-area">
              {/* Stadium grid */}
              {loading && (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Đang tải danh sách sân bóng...</p>
              </div>
              )}
              
              {error && !loading && (
                <div className="error-message">
                  <p>{error}</p>
                  <button 
                    onClick={fetchData}
                    style={{
                      marginTop: '15px',
                      padding: '8px 15px',
                      backgroundColor: '#1a4297',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              )}
              
              {!loading && filteredStadiums.length === 0 && !error && (
              <div className="no-results">
                  <p>Không tìm thấy sân bóng nào phù hợp với tìm kiếm của bạn.</p>
                  <button 
                    onClick={fetchData}
                    style={{
                      marginTop: '15px',
                      padding: '8px 15px',
                      backgroundColor: '#1a4297',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Thử lại
                  </button>
              </div>
            )}
            
              {!loading && filteredStadiums.length > 0 && (
            <div className="stadium-grid">
              {currentStadiums.map(stadium => (
                    renderStadiumCard(stadium)
                  ))}
                </div>
              )}

              {filteredStadiums.length > 0 && (
                <div className="pagination">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                  >
                    Trang trước
                  </button>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StadiumListPage;
