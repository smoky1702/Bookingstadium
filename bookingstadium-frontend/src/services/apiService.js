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
};

// API cho người dùng
const userAPI = {
  // Lấy tt người dùng theo ID
  getCurrentUser: (userId) => apiClient.get(`/users/${userId}`),
  
  // Thêm API lấy người dùng theo email nếu backend hỗ trợ
  getUserByEmail: (email) => apiClient.get(`/users/email/${email}`),
  
  // Cập nhật tt
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData),
  
  // Xóa 
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
  
  // Lấy danh sách tất cả người dùng (chỉ admin)
  getAllUsers: () => apiClient.get('/users'),

  // Thêm API phân quyền người dùng (dành cho admin)
  assignUserRole: (userId, roleData) => apiClient.put(`/users/${userId}/role`, roleData),
  
  // Cập nhật vai trò người dùng
  updateUserRole: (userId, roleData) => apiClient.put(`/users/${userId}/role`, roleData)
};

// API cho sân bóng
const stadiumAPI = {
  // Tạo sân bóng
  createStadium: (stadiumData) => apiClient.post('/stadium', stadiumData),
  
  // Lấy danh sách sân bóng
  getStadiums: () => apiClient.get('/stadium'),
  
  // Lấy tt chi tiết sân bóng theo ID
  getStadiumById: (stadiumId) => apiClient.get(`/stadium/${stadiumId}`),

  // Cập nhật sân bóng
  updateStadium: (stadiumId, stadiumData) => apiClient.put(`/stadium/${stadiumId}`, stadiumData),

  // Xóa sân bóng
  deleteStadium: (stadiumId) => apiClient.delete(`/stadium/${stadiumId}`),

  // Cập nhật trạng thái sân
  updateStadiumStatus: (stadiumId, statusData) => apiClient.patch(`/stadium/${stadiumId}/status`, statusData),
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

  // Lấy tất cả đơn đặt sân (chỉ admin)
  getAllBookings: () => apiClient.get('/booking'),

  // Cập nhật trạng thái đặt sân
  updateBookingStatus: (bookingId, statusData) => apiClient.patch(`/booking/${bookingId}/status`, statusData),

  // Hủy đặt sân
  cancelBooking: (bookingId) => apiClient.patch(`/booking/${bookingId}/cancel`, {}),

  // Xác nhận đặt sân
  confirmBooking: (bookingId) => apiClient.patch(`/booking/${bookingId}/confirm`, {}),
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

// API cho thống kê (dành cho admin)
const statisticsAPI = {
  // Lấy tổng quan thống kê
  getDashboardStats: () => apiClient.get('/admin/statistics/dashboard'),

  // Lấy thống kê theo người dùng
  getUserStats: () => apiClient.get('/admin/statistics/users'),

  // Lấy thống kê theo sân bóng
  getStadiumStats: () => apiClient.get('/admin/statistics/stadiums'),

  // Lấy thống kê theo đặt sân
  getBookingStats: () => apiClient.get('/admin/statistics/bookings'),

  // Lấy thống kê doanh thu
  getRevenueStats: (params) => apiClient.get('/admin/statistics/revenue', { params }),
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
  statisticsAPI,
};