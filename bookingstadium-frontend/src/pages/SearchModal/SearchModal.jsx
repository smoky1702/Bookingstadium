import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../SearchModal/SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchData, setSearchData] = useState({
    fieldType: '',
    fieldName: '',
    area: ''
  });

  const [recentSearches, setRecentSearches] = useState([]);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    // Add event listener to handle clicks outside the modal
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData({
      ...searchData,
      [name]: value
    });
  };

  const saveSearch = () => {
    const searchTerm = `${searchData.fieldType} ${searchData.fieldName} ${searchData.area}`.trim();
    
    if (searchTerm.length > 0) {
      // Add to recent searches
      const newSearches = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(newSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    saveSearch();
    
    // Build query string
    const params = new URLSearchParams();
    if (searchData.fieldType) params.append('type', searchData.fieldType);
    if (searchData.fieldName) params.append('name', searchData.fieldName);
    if (searchData.area) params.append('area', searchData.area);
    
    // Navigate to search results page
    navigate(`/tim-kiem?${params.toString()}`);
    onClose();
  };

  const handleRecentSearchClick = (search) => {
    // Parse the search term and set the form fields
    const parts = search.split(' ');
    if (parts.length > 0) {
      setSearchData({
        fieldType: parts[0] || '',
        fieldName: parts.length > 1 ? parts[1] : '',
        area: parts.length > 2 ? parts.slice(2).join(' ') : ''
      });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={modalRef}>
        <div className="search-modal-header">
          <h2>Tìm kiếm</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="search-modal-body">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-form-row">
              <div className="form-group">
                <select 
                  name="fieldType"
                  value={searchData.fieldType}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Loại/Theo loại sân</option>
                  <option value="bongda">Bóng đá</option>
                  <option value="tennis">Tennis</option>
                  <option value="golf">Golf</option>
                  <option value="bongro">Bóng rổ</option>
                  <option value="bongchuyen">Bóng chuyền</option>
                  <option value="caulong">Cầu lông</option>
                </select>
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="fieldName"
                  placeholder="Nhập tên sân hoặc địa chỉ để tìm kiếm..."
                  value={searchData.fieldName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="area"
                  placeholder="Nhập khu vực"
                  value={searchData.area}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i> Tìm kiếm
            </button>
          </form>

          {recentSearches.length > 0 && (
            <div className="recent-searches">
              <div className="recent-searches-header">
                <h3>Tìm kiếm gần đây</h3>
                <button className="clear-searches" onClick={clearRecentSearches}>
                  Xóa tất cả
                </button>
              </div>
              <ul className="recent-search-list">
                {recentSearches.map((search, index) => (
                  <li key={index} onClick={() => handleRecentSearchClick(search)}>
                    <i className="fas fa-history"></i>
                    <span>{search}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="popular-areas">
            <h3>Khu vực phổ biến</h3>
            <div className="area-tags">
              <div className="area-tag" onClick={() => setSearchData({...searchData, area: 'Quận 1'})}>
                Quận 1
              </div>
              <div className="area-tag" onClick={() => setSearchData({...searchData, area: 'Quận 3'})}>
                Quận 3
              </div>
              <div className="area-tag" onClick={() => setSearchData({...searchData, area: 'Quận 7'})}>
                Quận 7
              </div>
              <div className="area-tag" onClick={() => setSearchData({...searchData, area: 'Quận Gò Vấp'})}>
                Quận Gò Vấp
              </div>
              <div className="area-tag" onClick={() => setSearchData({...searchData, area: 'Quận Tân Bình'})}>
                Quận Tân Bình
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;