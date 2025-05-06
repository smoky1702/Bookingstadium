// Cấu hình cho Goong Map API
const mapConfig = {
  // Key cho MapTiles (hiển thị bản đồ) - sử dụng key từ biến môi trường
  GOONG_MAPTILES_KEY: process.env.REACT_APP_GOONG_MAPTILES_KEY || '4SrU3Aaog8hsCibq2ChkhPDxEVzzsHd3ZhiTwbOP',
  
  // Key cho REST API (geocoding, directions, places)
  GOONG_API_KEY: process.env.REACT_APP_GOONG_API_KEY || '4SrU3Aaog8hsCibq2ChkhPDxEVzzsHd3ZhiTwbOP',
  
  // URLs cho các endpoints
  GEOCODE_URL: 'https://rsapi.goong.io/Geocode',
  PLACE_DETAIL_URL: 'https://rsapi.goong.io/Place/Detail',
  PLACE_AUTOCOMPLETE_URL: 'https://rsapi.goong.io/Place/AutoComplete',
  DIRECTION_URL: 'https://rsapi.goong.io/Direction',
  
  // Không sử dụng proxy (tắt proxy)
  USE_PROXY: false,
  
  // URL backend API location
  BACKEND_LOCATION_API: 'http://localhost:8080/location',
  
  // Hàm helper để lấy URL cho Static Map (sử dụng dữ liệu động từ tham số)
  getStaticMapUrl: (lat, lng, zoom = 15, width = 600, height = 400) => {
    return `https://tiles.goong.io/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red|${lat},${lng}&key=${mapConfig.GOONG_API_KEY}`;
  },
  
  // Hàm helper để lấy URL cho Direction (sử dụng dữ liệu động từ tham số)
  getDirectionUrl: (lat, lng) => {
    return `https://maps.goong.io/dir/?api=1&destination=${lat},${lng}`;
  }
};

export default mapConfig; 