import axios from 'axios';

// Cấu hình base URL cho API
const API_URL = 'http://localhost:8080/bookingStadium';

// Tạo một instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header cho mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API cho xác thực
const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/users', userData),
  validateToken: (token) => apiClient.post('/auth/introspect', { token }),
};

// API cho người dùng
const userAPI = {
  getCurrentUser: (userId) => apiClient.get(`/users/${userId}`),
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData),
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
  getAllUsers: () => apiClient.get('/users'),
};

// API cho sân bóng
const stadiumAPI = {
  createStadium: (stadiumData) => apiClient.post('/stadium', stadiumData),
  getStadiums: () => apiClient.get('/stadium'),
};

// API cho loại sân
const typeAPI = {
  getTypes: () => apiClient.get('/type'),
  getTypeById: (typeId) => apiClient.get(`/type/${typeId}`),
  createType: (typeData) => apiClient.post('/type', typeData),
  updateType: (typeId, typeData) => apiClient.put(`/type/${typeId}`, typeData),
  deleteType: (typeId) => apiClient.delete(`/type/${typeId}`),
};

// API cho địa điểm sân
const locationAPI = {
  getLocations: () => apiClient.get('/location'),
  getLocationById: (locationId) => apiClient.get(`/location/${locationId}`),
  createLocation: (locationData) => apiClient.post('/location', locationData),
  updateLocation: (locationId, locationData) => apiClient.put(`/location/${locationId}`, locationData),
  deleteLocation: (locationId) => apiClient.delete(`/location/${locationId}`),
};

// API cho đặt sân
const bookingAPI = {
  createBooking: (bookingData) => apiClient.post('/booking', bookingData),
  getBookingById: (bookingId) => apiClient.get(`/booking/${bookingId}`),
};

// API cho chi tiết đặt sân
const bookingDetailAPI = {
  createBookingDetail: (detailData) => apiClient.post('/booking-details', detailData),
  getAllBookingDetails: () => apiClient.get('/booking-details'),
  getBookingDetailById: (bookingId, stadiumId, typeId) => 
    apiClient.get(`/booking-details/${bookingId}/${stadiumId}/${typeId}`),
  getBookingDetailsByBookingId: (bookingId) => 
    apiClient.get(`/booking-details/booking/${bookingId}`),
  updateBookingDetail: (bookingId, stadiumId, typeId, detailData) => 
    apiClient.put(`/booking-details/${bookingId}/${stadiumId}/${typeId}`, detailData),
  deleteBookingDetail: (bookingId, stadiumId, typeId) => 
    apiClient.delete(`/booking-details/${bookingId}/${stadiumId}/${typeId}`),
};

export {
  apiClient,
  authAPI,
  userAPI,
  stadiumAPI,
  typeAPI,
  locationAPI,
  bookingAPI,
  bookingDetailAPI,
};