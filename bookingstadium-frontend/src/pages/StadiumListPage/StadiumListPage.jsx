import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { locationAPI, typeAPI, stadiumAPI } from '../../services/apiService';
import '../StadiumListPage/StadiumListPage.css';

const StadiumListPage = () => {
  const [locations, setLocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch locations
        const locationsResponse = await locationAPI.getLocations();
        if (locationsResponse.data && locationsResponse.data.result) {
          setLocations(locationsResponse.data.result);
        }
        
        // Fetch types
        const typesResponse = await typeAPI.getTypes();
        if (typesResponse.data && typesResponse.data.result) {
          setTypes(typesResponse.data.result);
        }
        
        // Fetch stadiums
        const stadiumsResponse = await stadiumAPI.getStadiums();
        if (stadiumsResponse.data && stadiumsResponse.data.result) {
          setStadiums(stadiumsResponse.data.result);
        } else {
          // Nếu không có dữ liệu trong response.result, kiểm tra xem có dữ liệu ở response không
          if (stadiumsResponse.data) {
            setStadiums(Array.isArray(stadiumsResponse.data) ? stadiumsResponse.data : []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter stadiums
  const filteredStadiums = stadiums.filter(stadium => {
    return (
      // Filter by type
      (selectedType === '' || stadium.typeId.toString() === selectedType) &&
      // Filter by location
      (selectedLocation === '' || stadium.locationId === selectedLocation) &&
      // Filter by price
      (stadium.price >= priceRange.min && stadium.price <= priceRange.max) &&
      // Filter by search term (name or description)
      (searchTerm === '' || 
        stadium.stadiumName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stadium.description && stadium.description.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  });
  
  // Get location name by ID
  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.locationId === locationId);
    return location ? location.locationName : 'Địa điểm không xác định';
  };
  
  // Get type name by ID
  const getTypeName = (typeId) => {
    const type = types.find(t => t.typeId === typeId);
    return type ? type.typeName : 'Loại sân không xác định';
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle filter changes
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };
  
  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };
  
  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className="stadium-list-page">
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="star-icon">
              <i className="fas fa-futbol"></i>
            </div>
            <h1 className="page-title">Danh sách sân bóng</h1>
            <div className="title-underline"></div>
          </div>
        </div>
      </div>
      
      <div className="stadium-list-content">
        <div className="container">
          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên sân..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </div>
            
            <div className="filters">
              <div className="filter-group">
                <label>Loại sân:</label>
                <select value={selectedType} onChange={handleTypeChange}>
                  <option value="">Tất cả</option>
                  {types.map(type => (
                    <option key={type.typeId} value={type.typeId}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Địa điểm:</label>
                <select value={selectedLocation} onChange={handleLocationChange}>
                  <option value="">Tất cả</option>
                  {locations.map(location => (
                    <option key={location.locationId} value={location.locationId}>
                      {location.locationName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group price-filter">
                <label>Giá (VNĐ):</label>
                <div className="price-inputs">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange(e, 'min')}
                    min="0"
                  />
                  <span>-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange(e, 'max')}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="results-section">
            <div className="results-header">
              <h3>Kết quả tìm kiếm</h3>
              <span className="results-count">{filteredStadiums.length} sân bóng</span>
            </div>
            
            {loading && <div className="loading">Đang tải dữ liệu...</div>}
            
            {error && <div className="error-message">{error}</div>}
            
            {!loading && !error && filteredStadiums.length === 0 && (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy sân bóng nào phù hợp với tiêu chí tìm kiếm.</p>
              </div>
            )}
            
            <div className="stadium-grid">
              {filteredStadiums.map(stadium => (
                <div key={stadium.stadiumId} className="stadium-card">
                  <div className="stadium-image">
                    {/* Sử dụng hình ảnh placeholder */}
                    <img src={`/stadium-placeholder.jpg`} alt={stadium.stadiumName} />
                    <div className="stadium-type">{getTypeName(stadium.typeId)}</div>
                  </div>
                  <div className="stadium-info">
                    <h3 className="stadium-name">{stadium.stadiumName}</h3>
                    <div className="stadium-location">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{getLocationName(stadium.locationId)}</span>
                    </div>
                    <div className="stadium-price">
                      <i className="fas fa-tag"></i>
                      <span>{stadium.price ? stadium.price.toLocaleString() : '0'} VNĐ/giờ</span>
                    </div>
                    <div className="stadium-status">
                      <span className={`status-badge ${stadium.status ? stadium.status.toLowerCase() : 'available'}`}>
                        {stadium.status === 'AVAILABLE' ? 'Còn trống' : 
                         stadium.status === 'MAINTENANCE' ? 'Bảo trì' : 
                         stadium.status === 'BOOKED' ? 'Đã đặt' : 'Còn trống'}
                      </span>
                    </div>
                    <Link to={`/san/${stadium.stadiumId}`} className="view-details-button">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StadiumListPage;