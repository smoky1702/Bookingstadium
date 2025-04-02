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
  introspect: (token) => apiClient.post('/auth/introspect', { token }),
  
  // Lấy token mới
  refreshToken: (token) => apiClient.post('/auth/token', { token }),
};

// API cho người dùng
const userAPI = {
  // Lấy tt người dùng theo ID
  getUserById: (userId) => apiClient.get(`/users/${userId}`),
  
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
  
  // Lấy danh sách sân bóng
  getStadiums: () => apiClient.get('/stadium'),
  
  // Lấy tt chi tiết sân bóng theo ID
  getStadiumById: (stadiumId) => apiClient.get(`/stadium/${stadiumId}`),

  // Cập nhật sân bóng
  updateStadium: (stadiumId, stadiumData) => apiClient.put(`/stadium/${stadiumId}`, stadiumData),

  // Xóa sân bóng
  deleteStadium: (stadiumId) => apiClient.delete(`/stadium/${stadiumId}`),
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
  
  // Lấy danh sách đặt sân
  getBookings: () => apiClient.get('/booking'),
  
  // Lấy tt đặt sân theo ID
  getBookingById: (bookingId) => apiClient.get(`/booking/${bookingId}`),
  
  // Cập nhật đặt sân
  updateBooking: (bookingId, bookingData) => apiClient.put(`/booking/${bookingId}`, bookingData),
  
  // Xóa đặt sân
  deleteBooking: (bookingId) => apiClient.delete(`/booking/${bookingId}`),
};

// API cho chi tiết đặt sân
const stadiumBookingDetailAPI = {
  // Tạo chi tiết đặt sân
  createStadiumBookingDetail: (detailData) => apiClient.post('/details', detailData),
  
  // Lấy danh sách chi tiết đặt sân
  getStadiumBookingDetails: () => apiClient.get('/details'),
  
  // Lấy tt chi tiết đặt sân theo ID
  getStadiumBookingDetailById: (detailId) => apiClient.get(`/details/${detailId}`),
  
  // Cập nhật chi tiết đặt sân
  updateStadiumBookingDetail: (detailId, detailData) => apiClient.put(`/details/${detailId}`, detailData),
  
  // Xóa chi tiết đặt sân
  deleteStadiumBookingDetail: (detailId) => apiClient.delete(`/details/${detailId}`),
};

// API cho hóa đơn
const billAPI = {
  // Tạo hóa đơn
  createBill: (billData) => apiClient.post('/bill', billData),
  
  // Lấy danh sách hóa đơn
  getBills: () => apiClient.get('/bill'),
  
  // Lấy tt hóa đơn theo ID
  getBillById: (billId) => apiClient.get(`/bill/${billId}`),
  
  // Cập nhật hóa đơn
  updateBill: (billId, billData) => apiClient.put(`/bill/update/${billId}`, billData),
  
  // Thanh toán hóa đơn
  payBill: (billId, paymentData) => apiClient.put(`/bill/paid/${billId}`, paymentData),
  
  // Xóa hóa đơn
  deleteBill: (billId) => apiClient.delete(`/bill/${billId}`),
};

// API cho đánh giá
const evaluationAPI = {
  // Tạo đánh giá
  createEvaluation: (evaluationData) => apiClient.post('/evaluation', evaluationData),
  
  // Lấy danh sách đánh giá
  getEvaluations: () => apiClient.get('/evaluation'),
  
  // Lấy tt đánh giá theo ID
  getEvaluationById: (evaluationId) => apiClient.get(`/evaluation/${evaluationId}`),
  
  // Cập nhật đánh giá
  updateEvaluation: (evaluationId, evaluationData) => apiClient.put(`/evaluation/${evaluationId}`, evaluationData),
  
  // Xóa đánh giá
  deleteEvaluation: (evaluationId) => apiClient.delete(`/evaluation/${evaluationId}`),
};

// API cho phương thức thanh toán
const paymentMethodAPI = {
  // Tạo phương thức thanh toán
  createPaymentMethod: (paymentMethodData) => apiClient.post('/PaymentMethod', paymentMethodData),
  
  // Lấy danh sách phương thức thanh toán
  getPaymentMethods: () => apiClient.get('/PaymentMethod'),
  
  // Lấy tt phương thức thanh toán theo ID
  getPaymentMethodById: (paymentMethodId) => apiClient.get(`/PaymentMethod/${paymentMethodId}`),
  
  // Cập nhật phương thức thanh toán
  updatePaymentMethod: (paymentMethodId, paymentMethodData) => apiClient.put(`/PaymentMethod/${paymentMethodId}`, paymentMethodData),
  
  // Xóa phương thức thanh toán
  deletePaymentMethod: (paymentMethodId) => apiClient.delete(`/PaymentMethod/${paymentMethodId}`),
};

// API cho lịch làm việc
const workScheduleAPI = {
  // Tạo lịch làm việc
  createWorkSchedule: (workScheduleData) => apiClient.post('/WorkSchedule', workScheduleData),
  
  // Lấy danh sách lịch làm việc
  getWorkSchedules: () => apiClient.get('/WorkSchedule'),
  
  // Lấy tt lịch làm việc theo ID
  getWorkScheduleById: (workScheduleId) => apiClient.get(`/WorkSchedule/${workScheduleId}`),
  
  // Cập nhật lịch làm việc
  updateWorkSchedule: (workScheduleId, workScheduleData) => apiClient.put(`/WorkSchedule/${workScheduleId}`, workScheduleData),
  
  // Xóa lịch làm việc
  deleteWorkSchedule: (workScheduleId) => apiClient.delete(`/WorkSchedule/${workScheduleId}`),
};

// API cho hình ảnh
const imageAPI = {
  // Upload hình ảnh
  uploadImage: (locationId, file) => {
    const formData = new FormData();
    formData.append('imageUrl', file);
    formData.append('locationId', locationId);
    return apiClient.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Lấy danh sách hình ảnh
  getImages: () => apiClient.get('/images'),
  
  // Lấy tt hình ảnh theo ID
  getImageById: (imageId) => apiClient.get(`/images/${imageId}`),
  
  // Xóa hình ảnh
  deleteImage: (imageId) => apiClient.delete(`/images/${imageId}`),
};

export {
  apiClient,
  authAPI,
  userAPI,
  stadiumAPI,
  typeAPI,
  locationAPI,
  bookingAPI,
  stadiumBookingDetailAPI,
  billAPI,
  evaluationAPI,
  paymentMethodAPI,
  workScheduleAPI,
  imageAPI,
};