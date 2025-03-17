import axios from 'axios';


const API_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor thêm token vào header khi request
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

// Interceptor xử lý lỗi phản hồi
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401
    if (error.response && error.response.status === 401) {
      // Có thể logout người dùng 
      console.log('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      localStorage.removeItem('accessToken');
     
    }
    return Promise.reject(error);
  }
);

// API cho xác thực
const authAPI = {
  // Đăng nhập
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Đăng ký 
  register: (userData) => apiClient.post('/users', userData),
  
  // Kiểm tra token
  validateToken: (token) => apiClient.post('/auth/introspect', { token }),
};

// API cho người dùng
const userAPI = {
  // Lấy tt người dùng
  getCurrentUser: (userId) => apiClient.get(`/users/${userId}`),
  
  // Cập nhật tt
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData),
  
  // Xóa 
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
  
  // Lấy danh sách tất cả người dùng (chỉ admin)
  getAllUsers: () => apiClient.get('/users'),
};

// API cho sân bóng
const stadiumAPI = {
  // Tạo sân bóng
  createStadium: (stadiumData) => apiClient.post('/stadium', stadiumData),
  
  // Lấy danh sáchsân bóng
  getStadiums: () => apiClient.get('/stadium'),
  
  // Lấy tt chi tiết sân bóng theo ID
  getStadiumById: (stadiumId) => apiClient.get(`/stadium/${stadiumId}`),
};

// API cho loại sân
const typeAPI = {
  // Lấy danh sách loại sân
  getTypes: () => apiClient.get('/type'),
  
  // Lấy tt loại sân theo ID
  getTypeById: (typeId) => apiClient.get(`/type/${typeId}`),
  
  // Tạo loại sân
  createType: (typeData) => apiClient.post('/type', typeData),
  
  // Cập nhật
  updateType: (typeId, typeData) => apiClient.put(`/type/${typeId}`, typeData),
  
  // Xóa
  deleteType: (typeId) => apiClient.delete(`/type/${typeId}`),
};

// API cho địa điểm sân
const locationAPI = {
  // Lấy danh sách địa điểm
  getLocations: () => apiClient.get('/location'),
  
  // Lấy tt địa điểm theo ID
  getLocationById: (locationId) => apiClient.get(`/location/${locationId}`),
  
  // Tạo địa điểm 
  createLocation: (locationData) => apiClient.post('/location', locationData),
  
  // Cập nhật 
  updateLocation: (locationId, locationData) => apiClient.put(`/location/${locationId}`, locationData),
  
  // Xóa địa
  deleteLocation: (locationId) => apiClient.delete(`/location/${locationId}`),
};

// API cho đặt sân
const bookingAPI = {
  // Tạo đặt sân 
  createBooking: (bookingData) => apiClient.post('/booking', bookingData),
  
  // Lấy tt đặt sân theo ID
  getBookingById: (bookingId) => apiClient.get(`/booking/${bookingId}`),
  
  // Lấy danh sách đặt sân của người dùng
  getUserBookings: (userId) => apiClient.get(`/booking/user/${userId}`),
};

// API cho chi tiết đặt sân
const bookingDetailAPI = {
  // Tạo chi tiết đặt sân
  createBookingDetail: (detailData) => apiClient.post('/booking-details', detailData),
  
  // Lấy tất cả chi tiết đặt sân
  getAllBookingDetails: () => apiClient.get('/booking-details'),
  
  // Lấy chi tiết đặt sân theo ID
  getBookingDetailById: (bookingId, stadiumId, typeId) => 
    apiClient.get(`/booking-details/${bookingId}/${stadiumId}/${typeId}`),
  
  // Lấy tất cả chi tiết đặt sân cho một đặt sân cụ thể
  getBookingDetailsByBookingId: (bookingId) => 
    apiClient.get(`/booking-details/booking/${bookingId}`),
  
  // Cập nhật chi tiết đặt sân
  updateBookingDetail: (bookingId, stadiumId, typeId, detailData) => 
    apiClient.put(`/booking-details/${bookingId}/${stadiumId}/${typeId}`, detailData),
  
  // Xóa chi tiết đặt sân
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