import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faExpand, faExternalLinkAlt, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './GoongMap.css';

const GoongMap = ({ latitude, longitude, locationName, address, height = "400px" }) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  // Đảm bảo tọa độ hợp lệ
  const validLatitude = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : null;
  const validLongitude = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : null;
  const hasValidCoordinates = validLatitude !== null && validLongitude !== null;
  
  // Tạo URL cho embed Google Maps (không cần API key)
  const getGoogleMapsEmbedUrl = () => {
    if (!hasValidCoordinates) return 'about:blank';
    
    // Format URL để hiển thị marker rõ ràng tại vị trí của sân
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${validLatitude},${validLongitude}&zoom=17`;
  };
  
  // Tạo URL Google Maps để mở trong tab mới
  const getGoogleMapsUrl = () => {
    if (!hasValidCoordinates) return '#';
    return `https://www.google.com/maps?q=${validLatitude},${validLongitude}`;
  };
  
  // Toggle chế độ xem bản đồ (thường/vệ tinh)
  const toggleMapView = () => {
    const iframe = document.querySelector('.map-iframe');
    if (iframe) {
      const currentSrc = iframe.src;
      if (currentSrc.includes('&maptype=roadmap') || !currentSrc.includes('&maptype=')) {
        // Chuyển sang chế độ vệ tinh
        if (currentSrc.includes('&maptype=roadmap')) {
          iframe.src = currentSrc.replace('&maptype=roadmap', '&maptype=satellite');
        } else {
          iframe.src = currentSrc + '&maptype=satellite';
        }
      } else if (currentSrc.includes('&maptype=satellite')) {
        // Chuyển về chế độ bản đồ
        iframe.src = currentSrc.replace('&maptype=satellite', '&maptype=roadmap');
      }
    }
  };
  
  // Xử lý mở xem toàn màn hình
  const handleToggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
  };
  
  // Xử lý lỗi iframe
  const handleIframeError = () => {
    console.error("Không thể tải bản đồ Google Maps");
    setMapError(true);
  };
  
  // Thêm marker vào bản đồ sau khi iframe đã load
  const handleIframeLoad = () => {
    try {
      const iframe = document.querySelector('.map-iframe');
      if (iframe && iframe.contentWindow) {
        // Đã load thành công
        console.log("Bản đồ đã load thành công");
      }
    } catch (error) {
      console.error("Lỗi khi tương tác với iframe:", error);
    }
  };
  
  // Khi không có tọa độ hợp lệ
  if (!hasValidCoordinates) {
    return (
      <div className="goong-map-wrapper">
        <div className="map-placeholder" style={{ height }}>
          <p className="map-message">Không có thông tin tọa độ cho địa điểm này</p>
          {address && (
            <div className="address-container">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="address-icon" />
              <span className="address-text">{address}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="goong-map-wrapper">
      <div className="goong-map-container" style={{ height }}>
        {mapError ? (
          <div className="map-fallback">
            <div className="fallback-message">
              Không thể tải bản đồ. Vui lòng kiểm tra lại kết nối internet.
            </div>
            {address && (
              <div className="address-container">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="address-icon" />
                <span className="address-text">{address}</span>
              </div>
            )}
            <div className="fallback-actions">
              <a href={getGoogleMapsUrl()} className="view-on-google-maps" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                Xem trên Google Maps
              </a>
            </div>
          </div>
        ) : (
          <iframe
            className="map-iframe"
            src={getGoogleMapsEmbedUrl()}
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '8px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onError={handleIframeError}
            onLoad={handleIframeLoad}
            title="Bản đồ vị trí"
          ></iframe>
        )}
        
        <div className="map-controls">
          <button 
            className="map-control-btn satellite-btn" 
            onClick={toggleMapView} 
            title="Chuyển đổi chế độ bản đồ/vệ tinh"
            disabled={mapError}
          >
            <FontAwesomeIcon icon={faLayerGroup} />
          </button>
          <button 
            className="map-control-btn fullscreen-btn" 
            onClick={handleToggleFullscreen} 
            title="Xem toàn màn hình"
            disabled={mapError}
          >
            <FontAwesomeIcon icon={faExpand} />
          </button>
          <a 
            href={getGoogleMapsUrl()} 
            className="map-control-btn directions-btn" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Mở trong Google Maps"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </a>
        </div>
        
        <div className="address-overlay">
          <div className="address-container map-address">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="address-icon" />
            <span className="address-text">{address}</span>
          </div>
        </div>
        
        <div className="map-coordinates-display">
          {validLatitude.toFixed(6)}, {validLongitude.toFixed(6)}
        </div>
      </div>
      
      {showFullscreen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-map-container">
            <iframe
              src={getGoogleMapsEmbedUrl()} 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '8px' }} 
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ vị trí - Toàn màn hình"
            ></iframe>
            
            <div className="address-overlay fullscreen-address">
              <div className="address-container map-address">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="address-icon" />
                <span className="address-text">{address}</span>
              </div>
            </div>
            <button className="close-fullscreen-btn" onClick={handleToggleFullscreen}>
              &times; Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoongMap; 