import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { stadiumAPI, locationAPI, typeAPI } from '../../services/apiService';
import '../StadiumManagerPage/StadiumManagerPage.css';

const StadiumManagerPage = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stadiums');
  const [stadiums, setStadiums] = useState([]);
  const [locations, setLocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state cho việc thêm sân mới
  const [newStadium, setNewStadium] = useState({
    locationId: '',
    typeId: 1,
    stadiumName: '',
    price: 0,
    status: 'AVAILABLE',
    description: ''
  });
  
  // Form state cho việc thêm địa điểm mới
  const [newLocation, setNewLocation] = useState({
    userId: currentUser?.user_id || '',
    locationName: '',
    address: '',
    city: '',
    district: ''
  });

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy danh sách sân
        const stadiumsResponse = await stadiumAPI.getStadiums();
        if (stadiumsResponse.data && stadiumsResponse.data.result) {
          setStadiums(stadiumsResponse.data.result);
        }
        
        // Lấy danh sách địa điểm
        const locationsResponse = await locationAPI.getLocations();
        if (locationsResponse.data && locationsResponse.data.result) {
          setLocations(locationsResponse.data.result);
        }
        
        // Lấy danh sách loại sân
        const typesResponse = await typeAPI.getTypes();
        if (typesResponse.data && typesResponse.data.result) {
          setTypes(typesResponse.data.result);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, currentUser, navigate]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Xử lý thay đổi input cho form thêm sân mới
  const handleStadiumChange = (e) => {
    const { name, value } = e.target;
    setNewStadium({
      ...newStadium,
      [name]: name === 'typeId' ? parseInt(value) : name === 'price' ? parseFloat(value) : value
    });
  };
  
  // Xử lý thay đổi input cho form thêm địa điểm mới
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setNewLocation({
      ...newLocation,
      [name]: value
    });
  };
  
  // Xử lý thêm sân mới
  const handleAddStadium = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await stadiumAPI.createStadium(newStadium);
      
      if (response.data && response.data.result) {
        setStadiums([...stadiums, response.data.result]);
        setSuccess('Thêm sân bóng mới thành công!');
        
        // Reset form
        setNewStadium({
          locationId: '',
          typeId: 1,
          stadiumName: '',
          price: 0,
          status: 'AVAILABLE',
          description: ''
        });
        
        // Xóa thông báo thành công sau 3 giây
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Lỗi khi thêm sân bóng:', error);
      setError('Không thể thêm sân bóng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý thêm địa điểm mới
  const handleAddLocation = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const locationData = {
        ...newLocation,
        userId: currentUser.user_id
      };
      
      const response = await locationAPI.createLocation(locationData);
      
      if (response.data && response.data.result) {
        setLocations([...locations, response.data.result]);
        setSuccess('Thêm địa điểm mới thành công!');
        
        // Reset form
        setNewLocation({
          userId: currentUser?.user_id || '',
          locationName: '',
          address: '',
          city: '',
          district: ''
        });
        
        // Xóa thông báo thành công sau 3 giây
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Lỗi khi thêm địa điểm:', error);
      setError('Không thể thêm địa điểm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý xóa sân
  const handleDeleteStadium = async (stadiumId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sân bóng này?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await stadiumAPI.deleteStadium(stadiumId);
      
      setStadiums(stadiums.filter(stadium => stadium.stadiumId !== stadiumId));
      setSuccess('Xóa sân bóng thành công!');
      
      // Xóa thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi xóa sân bóng:', error);
      setError('Không thể xóa sân bóng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý xóa địa điểm
  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await locationAPI.deleteLocation(locationId);
      
      setLocations(locations.filter(location => location.locationId !== locationId));
      setSuccess('Xóa địa điểm thành công!');
      
      // Xóa thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi xóa địa điểm:', error);
      setError('Không thể xóa địa điểm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get type name by ID
  const getTypeName = (typeId) => {
    const type = types.find(t => t.typeId === typeId);
    return type ? type.typeName : 'Loại sân không xác định';
  };
  
  // Get location name by ID
  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.locationId === locationId);
    return location ? location.locationName : 'Địa điểm không xác định';
  };

  return (
    <div className="stadium-manager-page">
      <Navbar />
      
      <div className="stadium-manager-container">
        <div className="container">
          <div className="stadium-manager-header">
            <h1>Quản lý sân bóng</h1>
          </div>
          
          <div className="stadium-manager-content">
            <div className="stadium-manager-tabs">
              <button 
                className={`tab-button ${activeTab === 'stadiums' ? 'active' : ''}`}
                onClick={() => handleTabChange('stadiums')}
              >
                <i className="fas fa-futbol"></i> Sân bóng
              </button>
              <button 
                className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`}
                onClick={() => handleTabChange('locations')}
              >
                <i className="fas fa-map-marker-alt"></i> Địa điểm
              </button>
              <button 
                className={`tab-button ${activeTab === 'add-stadium' ? 'active' : ''}`}
                onClick={() => handleTabChange('add-stadium')}
              >
                <i className="fas fa-plus-circle"></i> Thêm sân bóng
              </button>
              <button 
                className={`tab-button ${activeTab === 'add-location' ? 'active' : ''}`}
                onClick={() => handleTabChange('add-location')}
              >
                <i className="fas fa-plus-circle"></i> Thêm địa điểm
              </button>
            </div>
            
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <span>{success}</span>
              </div>
            )}
            
            <div className="tab-content">
              {loading && (
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Đang tải dữ liệu...</p>
                </div>
              )}
              
              {/* Tab danh sách sân bóng */}
              {!loading && activeTab === 'stadiums' && (
                <div className="stadiums-list-tab">
                  <h2>Danh sách sân bóng</h2>
                  
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tên sân</th>
                        <th>Loại sân</th>
                        <th>Địa điểm</th>
                        <th>Giá (VNĐ/giờ)</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stadiums.length > 0 ? (
                        stadiums.map(stadium => (
                          <tr key={stadium.stadiumId}>
                            <td>{stadium.stadiumName}</td>
                            <td>{getTypeName(stadium.typeId)}</td>
                            <td>{getLocationName(stadium.locationId)}</td>
                            <td>{stadium.price ? stadium.price.toLocaleString() : '0'}</td>
                            <td>
                              <span className={`status-badge ${stadium.status ? stadium.status.toLowerCase() : 'available'}`}>
                                {stadium.status === 'AVAILABLE' ? 'Còn trống' : 
                                 stadium.status === 'MAINTENANCE' ? 'Bảo trì' : 
                                 stadium.status === 'BOOKED' ? 'Đã đặt' : 'Còn trống'}
                              </span>
                            </td>
                            <td className="action-buttons">
                              <Link to={`/san/${stadium.stadiumId}`} className="view-button">
                                <i className="fas fa-eye"></i>
                              </Link>
                              <button className="edit-button">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleDeleteStadium(stadium.stadiumId)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="no-data">Không có sân bóng nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Tab danh sách địa điểm */}
              {!loading && activeTab === 'locations' && (
                <div className="locations-list-tab">
                  <h2>Danh sách địa điểm</h2>
                  
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tên địa điểm</th>
                        <th>Địa chỉ</th>
                        <th>Quận/Huyện</th>
                        <th>Thành phố</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.length > 0 ? (
                        locations.map(location => (
                          <tr key={location.locationId}>
                            <td>{location.locationName}</td>
                            <td>{location.address}</td>
                            <td>{location.district}</td>
                            <td>{location.city}</td>
                            <td className="action-buttons">
                              <button className="edit-button">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleDeleteLocation(location.locationId)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="no-data">Không có địa điểm nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Tab thêm sân bóng mới */}
              {!loading && activeTab === 'add-stadium' && (
                <div className="add-stadium-tab">
                  <h2>Thêm sân bóng mới</h2>
                  
                  <form onSubmit={handleAddStadium} className="form-grid">
                    <div className="form-group">
                      <label>Tên sân bóng</label>
                      <input 
                        type="text"
                        name="stadiumName"
                        value={newStadium.stadiumName}
                        onChange={handleStadiumChange}
                        className="form-control"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Địa điểm</label>
                      <select 
                        name="locationId"
                        value={newStadium.locationId}
                        onChange={handleStadiumChange}
                        className="form-control"
                        required
                      >
                        <option value="">-- Chọn địa điểm --</option>
                        {locations.map(location => (
                          <option key={location.locationId} value={location.locationId}>
                            {location.locationName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Loại sân</label>
                      <select 
                        name="typeId"
                        value={newStadium.typeId}
                        onChange={handleStadiumChange}
                        className="form-control"
                        required
                      >
                        {types.map(type => (
                          <option key={type.typeId} value={type.typeId}>
                            {type.typeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Giá (VNĐ/giờ)</label>
                      <input 
                        type="number"
                        name="price"
                        value={newStadium.price}
                        onChange={handleStadiumChange}
                        className="form-control"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select 
                        name="status"
                        value={newStadium.status}
                        onChange={handleStadiumChange}
                        className="form-control"
                      >
                        <option value="AVAILABLE">Còn trống</option>
                        <option value="MAINTENANCE">Bảo trì</option>
                      </select>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Mô tả</label>
                      <textarea 
                        name="description"
                        value={newStadium.description}
                        onChange={handleStadiumChange}
                        className="form-control"
                        rows="4"
                      ></textarea>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="submit-button">
                        <i className="fas fa-plus-circle"></i> Thêm sân bóng
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Tab thêm địa điểm mới */}
              {!loading && activeTab === 'add-location' && (
                <div className="add-location-tab">
                  <h2>Thêm địa điểm mới</h2>
                  
                  <form onSubmit={handleAddLocation} className="form-grid">
                    <div className="form-group">
                      <label>Tên địa điểm</label>
                      <input 
                        type="text"
                        name="locationName"
                        value={newLocation.locationName}
                        onChange={handleLocationChange}
                        className="form-control"
                        required
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Địa chỉ</label>
                      <input 
                        type="text"
                        name="address"
                        value={newLocation.address}
                        onChange={handleLocationChange}
                        className="form-control"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Quận/Huyện</label>
                      <input 
                        type="text"
                        name="district"
                        value={newLocation.district}
                        onChange={handleLocationChange}
                        className="form-control"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Thành phố</label>
                      <input 
                        type="text"
                        name="city"
                        value={newLocation.city}
                        onChange={handleLocationChange}
                        className="form-control"
                        required
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="submit-button">
                        <i className="fas fa-plus-circle"></i> Thêm địa điểm
                      </button>
                    </div>
                  </form>
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

export default StadiumManagerPage;