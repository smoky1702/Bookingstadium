import axios from 'axios';

// Sửa để trỏ trực tiếp đến backend không có context path
const API_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Danh sách các endpoint công khai không cần xác thực
const publicEndpoints = [
  { path: '/stadium', allowId: true },
  { path: '/type', allowId: true }, 
  { path: '/location', allowId: true },
  { path: '/images', allowId: true },
  { path: '/evaluation', allowId: true },
  { path: '/PaymentMethod', allowId: true },
  { path: '/WorkSchedule', allowId: true },
  { path: '/auth/login', allowId: false },
  { path: '/auth/token', allowId: false },
  { path: '/auth/introspect', allowId: false },
  { path: '/users', allowId: false }, // Cho phép đăng ký người dùng
];

// Interceptor thêm token
apiClient.interceptors.request.use(
  (config) => {
    const isPublicEndpoint = publicEndpoints.some(endpoint => {
      const isGetRequest = config.method?.toLowerCase() === 'get';
      if (!isGetRequest) return false;
      const regex = new RegExp(`^${endpoint.path}(/[\\w-]+)?$`);
      const matches = regex.test(config.url);
      if (matches) {
        const hasId = config.url.split('/').length > 2;
        return !hasId || endpoint.allowId;
      }
      return false;
    });
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
      }
      
      if (error.response.status === 403) {
        const forbiddenEvent = new CustomEvent('api:forbidden', {
          detail: {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            message: error.response?.data?.message || 'Bạn không có quyền thực hiện hành động này'
          }
        });
        window.dispatchEvent(forbiddenEvent);
      }
    }
    
    return Promise.reject(error);
  }
);

// API cho xác thực
const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/users', userData),
  introspect: (token) => apiClient.post('/auth/introspect', { token }),
  refreshToken: (token) => apiClient.post('/auth/token', { token }),
};

// API cho người dùng
const userAPI = {
  getAllUsers: () => {
    return apiClient.get('/users');
  },

  getCurrentUserMe: () => {
    return apiClient.get('/users/me');
  },
  
  getCurrentUser: () => {
    return userAPI.getCurrentUserMe()
      .catch(error => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          return Promise.reject(new Error('Không tìm thấy token đăng nhập'));
        }
        
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            return Promise.reject(new Error('Token không hợp lệ'));
          }
          
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload && payload.sub) {
            const email = payload.sub;
            
            return apiClient.get('/users')
              .then(response => {
                if (response && response.data) {
                  let users = [];
                  
                  if (response.data.result && Array.isArray(response.data.result)) {
                    users = response.data.result;
                  } else if (Array.isArray(response.data)) {
                    users = response.data;
                  }
                  
                  const currentUser = users.find(user => user.email === email);
                  
                  if (currentUser) {
                    return {
                      ...response,
                      data: {
                        ...response.data,
                        result: currentUser
                      }
                    };
                  }
                }
                
                throw new Error('Không tìm thấy thông tin người dùng');
              })
              .catch(error => {
                if (error.response && error.response.status === 403) {
                  const basicUser = {
                    email: email,
                    role: payload.scope ? payload.scope.replace('SCOPE_', '') : 'USER'
                  };
                  
                  const cachedUser = sessionStorage.getItem('currentUser');
                  if (cachedUser) {
                    try {
                      const parsedUser = JSON.parse(cachedUser);
                      if (parsedUser.email === email) {
                        return { data: { result: parsedUser } };
                      }
                    } catch (e) {
                      // Xử lý im lặng
                    }
                  }
                  
                  return { data: { result: basicUser } };
                }
                
                return Promise.reject(error);
              });
          } else {
            return Promise.reject(new Error('Token không chứa thông tin người dùng'));
          }
        } catch (e) {
          return Promise.reject(new Error('Không thể xác định thông tin người dùng từ token'));
        }
      });
  },
  
  getUserById: (id) => {
    return apiClient.get(`/users/${id}`)
      .catch(error => {
        if (error.response && error.response.status === 403) {
          const forbiddenEvent = new CustomEvent('api:forbidden', {
            detail: {
              url: `/users/${id}`,
              method: 'GET',
              message: 'Bạn không có quyền xem thông tin của người dùng này'
            }
          });
          window.dispatchEvent(forbiddenEvent);
        }
        
        return Promise.reject(error);
      });
  },
  
  getUserByFirstname: (firstname) => {
    return apiClient.get(`/users/${firstname}`);
  },
  
  getUserByLastname: (lastname) => {
    return apiClient.get(`/users/${lastname}`);
  },
  
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData),
  
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
};

// API cho sân bóng
const stadiumAPI = {
  createStadium: (stadiumData) => apiClient.post('/stadium', stadiumData),
  
  getStadiums: () => {
    return apiClient.get("/stadium");
  },
  
  getStadiumById: (stadiumId) => {
    return apiClient.get(`/stadium/${stadiumId}`);
  },

  updateStadium: (stadiumId, stadiumData) => apiClient.put(`/stadium/${stadiumId}`, stadiumData),

  deleteStadium: (stadiumId) => apiClient.delete(`/stadium/${stadiumId}`),

  getStadiumBooking: (stadiumId, date) => {
    return apiClient.get(`/stadium/${stadiumId}/booking`, {
      params: { date: date }
    });
  },
};

// API cho loại sân
const typeAPI = {
  getTypes: () => {
    return apiClient.get('/type');
  },
  
  getTypesAlternative: () => {
    return apiClient.get('/types');
  },
  
  getTypeById: (typeId) => apiClient.get(`/type/${typeId}`),
  
  createType: (typeData) => apiClient.post('/type', typeData),
  
  updateType: (typeId, typeData) => apiClient.put(`/type/${typeId}`, typeData),
  
  deleteType: (typeId) => apiClient.delete(`/type/${typeId}`),
};

// API cho địa điểm sân
const locationAPI = {
  getLocations: () => {
    return apiClient.get("/location");
  },
  
  getLocationById: (locationId) => {
    return apiClient.get(`/location/${locationId}`);
  },
  
  createLocation: (locationData) => {
    return apiClient.post('/location', locationData);
  },
  
  updateLocation: (locationId, locationData) => {
    return apiClient.put(`/location/${locationId}`, locationData);
  },
  
  deleteLocation: (locationId) => {
    return apiClient.delete(`/location/${locationId}`);
  }
};

// API cho booking
const bookingAPI = {
  createBooking: (bookingData) => {
    const formattedData = {
      user_id: bookingData.user_id || bookingData.userId,
      location_id: bookingData.location_id || bookingData.locationId,
      date_of_booking: bookingData.date_of_booking || bookingData.dateOfBooking,
      start_time: bookingData.start_time || bookingData.startTime,
      end_time: bookingData.end_time || bookingData.endTime
    };
    
    if (formattedData.start_time && formattedData.start_time.split(':').length === 2) {
      formattedData.start_time = `${formattedData.start_time}:00`;
    }
    
    if (formattedData.end_time && formattedData.end_time.split(':').length === 2) {
      formattedData.end_time = `${formattedData.end_time}:00`;
    }
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    return apiClient.post('/booking', formattedData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  getBooking: () => apiClient.get("/booking"),
  
  getBookingById: (bookingId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers = {
      'Authorization': token ? `Bearer ${token}` : undefined
    };
    
    const timestamp = new Date().getTime();
    
    return apiClient.get(`/booking/${bookingId}`, { headers })
      .catch(error => {
        return apiClient.get(`/booking/${bookingId}?_=${timestamp}`, { headers })
          .catch(timestampError => {
            return apiClient.get(`/bookings/${bookingId}`, { headers })
              .catch(() => {
                return Promise.reject(error);
              });
          });
      });
  },
  
  updateBooking: (bookingId, bookingData) => apiClient.put(`/booking/${bookingId}`, bookingData),
  
  deleteBooking: (bookingId) => apiClient.delete(`/booking/${bookingId}`),
  
  getUserBooking: (userId) => apiClient.get(`/user/${userId}`)
};

// API cho booking detail
const stadiumBookingDetailAPI = {
  createStadiumBookingDetail: (detailData) => {
    const formattedData = {
      stadium_booking_id: detailData.stadium_booking_id || detailData.bookingId || detailData.stadiumBookingId,
      type_id: detailData.type_id || detailData.typeId,
      stadium_id: detailData.stadium_id || detailData.stadiumId
    };
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    return apiClient.post('/details', formattedData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  getStadiumBookingDetail: () => apiClient.get("/details"),
  
  getStadiumBookingDetailById: (detailId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const timestamp = new Date().getTime();
    
    return apiClient.get(`/details/${detailId}?_=${timestamp}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined
      }
    });
  },
  
  getStadiumBookingDetailByBookingId: (bookingId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const timestamp = new Date().getTime();
    
    return apiClient.get(`/details/booking/${bookingId}?_=${timestamp}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined
      }
    });
  },
  
  updateStadiumBookingDetail: (stadiumBookingDetailId, detailData) => apiClient.put(`/details/${stadiumBookingDetailId}`, detailData),
  
  deleteStadiumBookingDetail: (stadiumBookingDetailId) => apiClient.delete(`/details/${stadiumBookingDetailId}`)
};

// API cho bill
const billAPI = {
  createBill: (billData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    return apiClient.post('/bill', billData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  createUserBill: (billData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    return apiClient.post('/bill/user', billData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  createOwnerBill: (billData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    return apiClient.post('/bill/owner', billData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  getBills: () => {
    return apiClient.get('/bill');
  },
  
  getBill: function() { return this.getBills(); },
  
  getBillById: (billId) => apiClient.get(`/bill/${billId}`),
  
  updateBill: (billId, billData) => apiClient.put(`/bill/update/${billId}`, billData),
  
  paidBill: (billId, billData) => apiClient.put(`/bill/paid/${billId}`, billData),
  
  deleteBill: (billId) => apiClient.delete(`/bill/${billId}`)
};

// API cho đánh giá
const evaluationAPI = {
  createEvaluation: (evaluationData) => apiClient.post('/evaluation', evaluationData),
  
  getEvaluations: () => {
    return apiClient.get('/evaluation');
  },
  
  getEvaluationById: (evaluationId) => apiClient.get(`/evaluation/${evaluationId}`),
  
  getEvaluationsByStadiumId: (stadiumId) => {
    return apiClient.get('/evaluation').then(response => {
      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        const filteredEvaluations = response.data.result.filter(evaluation => 
          evaluation.stadiumId == stadiumId || evaluation.stadium_id == stadiumId
        );
        
        const newResponse = { ...response, data: { ...response.data, result: filteredEvaluations } };
        return newResponse;
      } else if (response.data && Array.isArray(response.data)) {
        const filteredEvaluations = response.data.filter(evaluation => 
          evaluation.stadiumId == stadiumId || evaluation.stadium_id == stadiumId
        );
        
        const newResponse = { ...response, data: { result: filteredEvaluations } };
        return newResponse;
      }
      
      return response;
    });
  },
  
  updateEvaluation: (evaluationId, evaluationData) => apiClient.put(`/evaluation/${evaluationId}`, evaluationData),
  
  deleteEvaluation: (evaluationId) => apiClient.delete(`/evaluation/${evaluationId}`),
};

// API cho payment method
const paymentMethodAPI = {
  createPaymentMethod: (paymentMethodData) => apiClient.post('/PaymentMethod', paymentMethodData),
  getPaymentMethod: () => apiClient.get("/PaymentMethod"),
  getPaymentMethodById: (paymentMethodId) => apiClient.get(`/PaymentMethod/${paymentMethodId}`),
  updatePaymentMethod: (paymentMethodId, paymentMethodData) => apiClient.put(`/PaymentMethod/${paymentMethodId}`, paymentMethodData),
  deletePaymentMethod: (paymentMethodId) => apiClient.delete(`/PaymentMethod/${paymentMethodId}`)
};

// API cho lịch làm việc
const workScheduleAPI = {
  createWorkSchedule: (workScheduleData) => apiClient.post('/WorkSchedule', workScheduleData),
  getWorkSchedule: () => apiClient.get('/WorkSchedule'),
  getWorkScheduleById: (workScheduleId) => apiClient.get(`/WorkSchedule/${workScheduleId}`),
  updateWorkSchedule: (workScheduleId, workScheduleData) => apiClient.put(`/WorkSchedule/${workScheduleId}`, workScheduleData),
  deleteWorkSchedule: (workScheduleId) => apiClient.delete(`/WorkSchedule/${workScheduleId}`),
};

// API cho hình ảnh
const imageAPI = {
  uploadImage: (stadiumId, file) => {
    const formData = new FormData();
    formData.append('imageUrl', file);
    formData.append('stadiumId', stadiumId);
    return apiClient.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getImages: () => {
    return apiClient.get('/images');
  },
  
  getImageById: (imageId) => apiClient.get(`/images/${imageId}`),
  
  getImagesByStadiumId: (stadiumId) => {
    return apiClient.get('/images').then(response => {
      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        const filteredImages = response.data.result.filter(img => img.stadiumId === stadiumId);
        const newResponse = { ...response, data: { ...response.data, result: filteredImages } };
        return newResponse;
      }
      
      return response;
    });
  },
  
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