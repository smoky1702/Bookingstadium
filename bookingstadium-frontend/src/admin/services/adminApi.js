import axios from 'axios';

const API_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Thêm interceptor để debug request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request để debug
    console.log(`DEBUG - API Request [${config.method.toUpperCase()}] ${config.url}`, 
      config.data ? config.data : 'No data');
    
    return config;
  },
  (error) => {
    console.error('DEBUG - Request Error:', error);
    return Promise.reject(error);
  }
);

// Xử lý response
apiClient.interceptors.response.use(
  (response) => {
    // Log response để debug
    console.log(`DEBUG - API Response [${response.status}] ${response.config.url}`, 
      response.data ? response.data : 'No data');
    
    return response;
  },
  (error) => {
    console.error('DEBUG - Response Error:', error);
    
    if (error.response) {
      console.error('DEBUG - Response Error Details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Xử lý lỗi 401 (Unauthorized)
      if (error.response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// API cho xác thực
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
};

// API cho người dùng
export const userAPI = {
  getAllUsers: () => apiClient.get('/users'),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateRole: (userId, roleData) => apiClient.put(`/users/role/${userId}`, roleData),
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
};

// API cho loại sân
export const typeAPI = {
  getTypes: () => apiClient.get('/type'),
  getTypeById: (typeId) => apiClient.get(`/type/${typeId}`),
  createType: (typeData) => apiClient.post('/type', typeData),
  updateType: (typeId, typeData) => apiClient.put(`/type/${typeId}`, typeData, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  deleteType: (typeId) => apiClient.delete(`/type/${typeId}`),
};

// API cho sân
export const stadiumAPI = {
  getAllStadiums: () => apiClient.get('/stadium'),
  getStadiumById: (id) => apiClient.get(`/stadium/${id}`),
  createStadium: (data) => apiClient.post('/stadium', data),
  updateStadium: (id, data) => apiClient.put(`/stadium/${id}`, data),
  deleteStadium: (id) => apiClient.delete(`/stadium/${id}`),
  getStadiumBookings: (id, date) => apiClient.get(`/stadium/${id}/booking?date=${date}`),
};

// API cho địa điểm sân
export const locationAPI = {
  getAllLocations: () => apiClient.get('/location'),
  getLocationById: (id) => apiClient.get(`/location/${id}`),
  createLocation: (data) => apiClient.post('/location', data),
  updateLocation: (id, data) => apiClient.put(`/location/${id}`, data),
  deleteLocation: (id) => apiClient.delete(`/location/${id}`),
};

// API cho đặt sân
export const bookingAPI = {
  getAllBookings: () => apiClient.get('/booking'),
  getBookingById: (id) => apiClient.get(`/booking/${id}`),
  updateBooking: (id, data) => apiClient.put(`/booking/${id}`, data),
  deleteBooking: (id) => apiClient.delete(`/booking/${id}`),
};

// API cho chi tiết đặt sân
export const bookingDetailAPI = {
  getAllBookingDetails: () => apiClient.get('/details'),
  getBookingDetailById: (id) => apiClient.get(`/details/${id}`),
  getBookingDetailByBookingId: (bookingId) => apiClient.get(`/details/booking/${bookingId}`),
  createBookingDetail: (data) => apiClient.post('/details', data),
  updateBookingDetail: (id, data) => apiClient.put(`/details/${id}`, data),
  deleteBookingDetail: (id) => apiClient.delete(`/details/${id}`),
};

// API cho hóa đơn
export const billAPI = {
  getAllBills: () => apiClient.get('/bill'),
  getBillById: (id) => apiClient.get(`/bill/${id}`),
  updateBill: (id, data) => apiClient.put(`/bill/update/${id}`, data),
  deleteBill: (id) => apiClient.delete(`/bill/${id}`),
};

// API cho phương thức thanh toán
export const paymentMethodAPI = {
  getPaymentMethods: () => apiClient.get('/PaymentMethod'),
  getPaymentMethodById: (id) => apiClient.get(`/PaymentMethod/${id}`),
  createPaymentMethod: (data) => apiClient.post('/PaymentMethod', data),
  updatePaymentMethod: (id, data) => apiClient.put(`/PaymentMethod/${id}`, data),
  deletePaymentMethod: (id) => apiClient.delete(`/PaymentMethod/${id}`),
};

// API cho hình ảnh
export const imageAPI = {
  getImages: () => apiClient.get('/images'),
  getImageById: (id) => apiClient.get(`/images/${id}`),
  getImagesByStadiumId: (stadiumId) => apiClient.get(`/images/stadium/${stadiumId}`),
  uploadImage: (data) => {
    const formData = new FormData();
    formData.append('imageUrl', data.file);
    formData.append('stadiumId', data.stadiumId);
    return apiClient.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteImage: (id) => apiClient.delete(`/images/${id}`),
};

// API cho đánh giá
export const evaluationAPI = {
  getAllEvaluations: () => apiClient.get('/evaluation'),
  getEvaluationById: (id) => apiClient.get(`/evaluation/${id}`),
  deleteEvaluation: (id) => apiClient.delete(`/evaluation/${id}`),
};

// API cho lịch làm việc
export const workScheduleAPI = {
  getAllWorkSchedules: () => apiClient.get('/WorkSchedule'),
  getWorkScheduleById: (id) => apiClient.get(`/WorkSchedule/${id}`),
  createWorkSchedule: (data) => apiClient.post('/WorkSchedule', data),
  updateWorkSchedule: (id, data) => apiClient.put(`/WorkSchedule/${id}`, data),
  deleteWorkSchedule: (id) => apiClient.delete(`/WorkSchedule/${id}`),
}; 