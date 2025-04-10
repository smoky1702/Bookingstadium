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
];

// Interceptor thêm token và log request
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // Kiểm tra xem URL hiện tại có phải là endpoint công khai không
    const isPublicEndpoint = publicEndpoints.some(endpoint => {
      const isGetRequest = config.method?.toLowerCase() === 'get';
      
      // Nếu không phải GET request, không phải public endpoint
      if (!isGetRequest) return false;
      
      // Kiểm tra endpoint path có khớp với URL hiện tại không
      // Sử dụng regex để khớp chính xác với đường dẫn gốc hoặc đường dẫn có ID
      const regex = new RegExp(`^${endpoint.path}(/[\\w-]+)?$`);
      const matches = regex.test(config.url);
      
      if (matches) {
        console.log(`URL ${config.url} khớp với endpoint pattern ${endpoint.path}`);
        
        // Kiểm tra xem URL có ID không
        const hasId = config.url.split('/').length > 2;
        
        // Endpoint cho phép ID hoặc không có ID
        const isPublic = !hasId || endpoint.allowId;
        console.log(`URL có ID: ${hasId}, Endpoint cho phép ID: ${endpoint.allowId}, Là public: ${isPublic}`);
        
        return isPublic;
      }
      
      return false;
    });

    console.log(`[API Request] URL: ${config.url}, Method: ${config.method}`);
    console.log(`[API Request] Is public endpoint: ${isPublicEndpoint}`);
    
    // Chỉ đính kèm token nếu không phải là endpoint công khai GET
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('[API Request] Token attached');
      } else {
        console.log('[API Request] No token found');
      }
    } else {
      console.log('[API Request] Public endpoint - no token needed');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý và log response
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Success] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.status,
        error.response?.data || error.message
      );
    } else {
      console.error(
        `[API Network Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.message
      );
    }
    
    // Xử lý lỗi 401
    if (error.response && error.response.status === 401) {
      console.log('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      localStorage.removeItem('token');
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
  // Lấy danh sách tất cả người dùng (admin)
  getAllUsers: () => {
    console.log('[userAPI] Gọi API lấy danh sách tất cả người dùng');
    return apiClient.get('/users');
  },

  // Lấy thông tin người dùng từ API (không cần ID)
  getCurrentUser: () => {
    console.log('[userAPI] Gọi API lấy thông tin người dùng hiện tại');
    return apiClient.get('/users');
  },
  
  // Lấy tt người dùng theo ID
  getUserById: (id) => {
    console.log(`[userAPI] Gọi API lấy thông tin user với ID: ${id}`);
    return apiClient.get(`/users/${id}`);
  },
  
  // Lấy người dùng theo firstname (endpoint mới)
  getUserByFirstname: (firstname) => {
    console.log(`[userAPI] Gọi API lấy thông tin user với firstname: ${firstname}`);
    return apiClient.get(`/users/${firstname}`);
  },
  
  // Lấy người dùng theo lastname (endpoint mới)
  getUserByLastname: (lastname) => {
    console.log(`[userAPI] Gọi API lấy thông tin user với lastname: ${lastname}`);
    return apiClient.get(`/users/${lastname}`);
  },
  
  // Cập nhật tt
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData),
  
  // Xóa 
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
};

// API cho sân bóng
const stadiumAPI = {
  // Tạo sân bóng
  createStadium: (stadiumData) => apiClient.post('/stadium', stadiumData),
  
  // Lấy danh sách sân bóng
  getStadiums: () => {
    console.log("[API Call] GET /stadium");
    return apiClient.get("/stadium").then(
      (response) => {
        console.log("[API Success] GET /stadium", response.data);
        return response;
      },
      (error) => {
        console.error("[API Error] GET /stadium", error);
        return Promise.reject(error);
      }
    );
  },
  
  // API endpoint thay thế cho stadiums 
  getStadiumsAlternative: () => {
    console.log("[API Call] GET /stadiums (API thay thế)");
    return apiClient.get("/stadiums").then(
      (response) => {
        console.log("[API Success] GET /stadiums (API thay thế)", response.data);
        return response;
      },
      (error) => {
        console.error("[API Error] GET /stadiums (API thay thế)", error);
        return Promise.reject(error);
      }
    );
  },
  
  // Lấy danh sách stadium với thông tin location đầy đủ
  getStadiumsWithLocations: () => {
    console.log("[API Call] GET /stadium/with-locations");
    return apiClient.get("/stadium/with-locations").then(
      (response) => {
        console.log("[API Success] GET /stadium/with-locations", response.data);
        return response;
      },
      (error) => {
        console.error("[API Error] GET /stadium/with-locations", error);
        return Promise.reject(error);
      }
    );
  },
  
  // Lấy tt chi tiết sân bóng theo ID
  getStadiumById: (stadiumId) => {
    console.log(`[API Call] GET /stadium/${stadiumId}`);
    return apiClient.get(`/stadium/${stadiumId}`).then(
      (response) => {
        console.log(`[API Success] GET /stadium/${stadiumId}`, response.data);
        return response;
      },
      (error) => {
        console.error(`[API Error] GET /stadium/${stadiumId}`, error);
        return Promise.reject(error);
      }
    );
  },

  // API endpoint thay thế cho getStadiumById
  getStadiumByIdAlternative: (stadiumId) => {
    console.log(`[API Call] GET /stadiums/${stadiumId} (API thay thế)`);
    return apiClient.get(`/stadiums/${stadiumId}`).then(
      (response) => {
        console.log(`[API Success] GET /stadiums/${stadiumId} (API thay thế)`, response.data);
        return response;
      },
      (error) => {
        console.error(`[API Error] GET /stadiums/${stadiumId} (API thay thế)`, error);
        return Promise.reject(error);
      }
    );
  },

  // Cập nhật sân bóng
  updateStadium: (stadiumId, stadiumData) => apiClient.put(`/stadium/${stadiumId}`, stadiumData),

  // Xóa sân bóng
  deleteStadium: (stadiumId) => apiClient.delete(`/stadium/${stadiumId}`),
  
  // Lấy danh sách stadium_location (mối quan hệ stadium và location)
  getStadiumLocations: () => {
    console.log("[API Call] GET /stadium-location");
    return apiClient.get("/stadium-location").then(
      (response) => {
        console.log("[API Success] GET /stadium-location", response.data);
        return response;
      },
      (error) => {
        console.error("[API Error] GET /stadium-location", error);
        return Promise.reject(error);
      }
    );
  },
  
  // Lấy thông tin stadium_location theo stadium ID
  getStadiumLocationByStadiumId: (stadiumId) => {
    console.log(`[API Call] GET /stadium_location/stadium/${stadiumId}`);
    return apiClient.get(`/stadium_location/stadium/${stadiumId}`).then(
      (response) => {
        console.log(`[API Success] GET /stadium_location/stadium/${stadiumId}`, response.data);
        return response;
      }, 
      (error) => {
        console.error(`[API Error] GET /stadium_location/stadium/${stadiumId}`, error);
        return Promise.reject(error);
      }
    );
  },

  // Lấy các booking của một sân trong một ngày
  getStadiumBooking: (stadiumId, date) => apiClient.get(`/stadium/${stadiumId}/booking?date=${date}`),
};

// API cho loại sân
const typeAPI = {
  // Lấy danh sách loại sân
  getTypes: () => {
    console.log('[typeAPI] Gọi API lấy danh sách loại sân');
    return apiClient.get('/type');
  },
  
  // Thử endpoint khác nếu trên không hoạt động
  getTypesAlternative: () => {
    console.log('[typeAPI] Thử API endpoint thay thế');
    return apiClient.get('/types');
  },
  
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
  getLocations: () => {
    console.log("[API Call] GET /location");
    return apiClient.get("/location").then(
      (response) => {
        console.log("[API Success] GET /location", response.data);
        return response;
      },
      (error) => {
        console.error("[API Error] GET /location", error);
        return Promise.reject(error);
      }
    );
  },
  
  // API endpoint thay thế cho locations
  getLocationsAlternative: () => {
    console.log("[API Call] GET /locations (API thay thế)");
    return apiClient.get("/locations").then(
      (response) => {
        console.log("[API Success] GET /locations (API thay thế)", response.data);
        return response;
      },
      (error) => {
        console.error("[API Error] GET /locations (API thay thế)", error);
        return Promise.reject(error);
      }
    );
  },

  // Thử endpoint Stadium_Location nếu cần
  getStadiumLocations: () => {
    console.log('[locationAPI] Thử lấy từ Stadium_Location');
    return apiClient.get('/stadium_location');
  },
  
  // Lấy tt địa điểm theo ID
  getLocationById: (locationId) => {
    console.log(`[API Call] GET /location/${locationId}`);
    return apiClient.get(`/location/${locationId}`).then(
      (response) => {
        console.log(`[API Success] GET /location/${locationId}`, response.data);
        return response;
      },
      (error) => {
        console.error(`[API Error] GET /location/${locationId}`, error);
        return Promise.reject(error);
      }
    );
  },
  
  // API endpoint thay thế cho getLocationById
  getLocationByIdAlternative: (locationId) => {
    console.log(`[API Call] GET /locations/${locationId} (API thay thế)`);
    return apiClient.get(`/locations/${locationId}`).then(
      (response) => {
        console.log(`[API Success] GET /locations/${locationId} (API thay thế)`, response.data);
        return response;
      },
      (error) => {
        console.error(`[API Error] GET /locations/${locationId} (API thay thế)`, error);
        return Promise.reject(error);
      }
    );
  },
  
  // Tạo địa điểm 
  createLocation: (locationData) => apiClient.post('/location', locationData),
  
  // Cập nhật 
  updateLocation: (locationId, locationData) => apiClient.put(`/location/${locationId}`, locationData),
  
  // Xóa địa
  deleteLocation: (locationId) => apiClient.delete(`/location/${locationId}`),
};

// API cho booking
const bookingAPI = {
  createBooking: (bookingData) => apiClient.post('/booking', bookingData),
  getBooking: () => apiClient.get("/booking"),
  getBookingById: (bookingId) => apiClient.get(`/booking/${bookingId}`),
  updateBooking: (bookingId, bookingData) => apiClient.put(`/booking/${bookingId}`, bookingData),
  deleteBooking: (bookingId) => apiClient.delete(`/booking/${bookingId}`),
  getUserBookings: (userId) => apiClient.get(`/booking/user/${userId}`)
};

// API cho booking detail
const stadiumBookingDetailAPI = {
  createStadiumBookingDetail: (detailData) => apiClient.post('/details', detailData),
  getStadiumBookingDetail: () => apiClient.get("/details"),
  getStadiumBookingDetailById: (stadiumBookingDetailId) => apiClient.get(`/details/${stadiumBookingDetailId}`),
  updateStadiumBookingDetail: (stadiumBookingDetailId, detailData) => apiClient.put(`/details/${stadiumBookingDetailId}`, detailData),
  deleteStadiumBookingDetail: (stadiumBookingDetailId) => apiClient.delete(`/details/${stadiumBookingDetailId}`)
};

// API cho bill
const billAPI = {
  createBill: (billData) => apiClient.post('/bill', billData),
  getBill: () => apiClient.get("/bill"),
  getBillById: (billId) => apiClient.get(`/bill/${billId}`),
  updateBill: (billId, billData) => apiClient.put(`/bill/update/${billId}`, billData),
  paidBill: (billId, billData) => apiClient.put(`/bill/paid/${billId}`, billData),
  deleteBill: (billId) => apiClient.delete(`/bill/${billId}`)
};

// API cho đánh giá
const evaluationAPI = {
  // Tạo đánh giá
  createEvaluation: (evaluationData) => apiClient.post('/evaluation', evaluationData),
  
  // Lấy danh sách đánh giá
  getEvaluations: () => {
    console.log('[evaluationAPI] Gọi API lấy tất cả đánh giá');
    return apiClient.get('/evaluation').then(
      (response) => {
        console.log('[evaluationAPI] Thành công - Lấy tất cả đánh giá:', response.data);
        return response;
      },
      (error) => {
        console.error('[evaluationAPI] Lỗi - Lấy tất cả đánh giá:', error.message);
        // Thử lại với URL thay thế
        console.log('[evaluationAPI] Thử lại với URL thay thế /evaluations');
        return apiClient.get('/evaluations').then(
          (response) => {
            console.log('[evaluationAPI] Thành công - Lấy tất cả đánh giá (URL thay thế):', response.data);
            return response;
          },
          (altError) => {
            console.error('[evaluationAPI] Lỗi - Lấy tất cả đánh giá (URL thay thế):', altError.message);
            return Promise.reject(altError);
          }
        );
      }
    );
  },
  
  // Lấy tt đánh giá theo ID
  getEvaluationById: (evaluationId) => apiClient.get(`/evaluation/${evaluationId}`),
  
  // Lấy đánh giá theo ID sân
  getEvaluationsByStadiumId: (stadiumId) => {
    console.log(`[evaluationAPI] Gọi API lấy đánh giá cho sân có ID: ${stadiumId}`);
    
    // Lấy tất cả đánh giá và sau đó lọc theo stadiumId ở phía client
    return apiClient.get('/evaluation').then(response => {
      console.log('[evaluationAPI] Đã nhận response từ /evaluation');
      
      // Kiểm tra cấu trúc dữ liệu
      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        // Lọc các đánh giá có stadiumId trùng khớp
        const filteredEvaluations = response.data.result.filter(evaluation => 
          evaluation.stadiumId == stadiumId || evaluation.stadium_id == stadiumId
        );
        console.log(`[evaluationAPI] Đã lọc được ${filteredEvaluations.length} đánh giá cho sân ID ${stadiumId}`);
        
        // Thay thế response.data.result bằng dữ liệu đã lọc
        const newResponse = { ...response, data: { ...response.data, result: filteredEvaluations } };
        return newResponse;
      } else if (response.data && Array.isArray(response.data)) {
        // Trường hợp response.data là một mảng trực tiếp
        const filteredEvaluations = response.data.filter(evaluation => 
          evaluation.stadiumId == stadiumId || evaluation.stadium_id == stadiumId
        );
        console.log(`[evaluationAPI] Đã lọc được ${filteredEvaluations.length} đánh giá cho sân ID ${stadiumId}`);
        
        // Tạo cấu trúc response mới
        const newResponse = { ...response, data: { result: filteredEvaluations } };
        return newResponse;
      }
      
      return response;
    });
  },
  
  // Cập nhật đánh giá
  updateEvaluation: (evaluationId, evaluationData) => apiClient.put(`/evaluation/${evaluationId}`, evaluationData),
  
  // Xóa đánh giá
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
  // Tạo lịch làm việc
  createWorkSchedule: (workScheduleData) => apiClient.post('/WorkSchedule', workScheduleData),
  
  // Lấy danh sách lịch làm việc
  getWorkSchedule: () => {
    console.log("[workScheduleAPI] Đang gọi API lấy lịch làm việc");
    return apiClient.get('/WorkSchedule')
      .then(response => {
        console.log("[workScheduleAPI] Thành công:", response.data);
        return response;
      })
      .catch(error => {
        console.error("[workScheduleAPI] Lỗi khi gọi /WorkSchedule:", error.message);
        
        // Thử endpoint thứ hai: /workSchedule (chữ w viết thường)
        console.log("[workScheduleAPI] Thử lại với endpoint /workSchedule");
        return apiClient.get('/workSchedule')
          .then(response => {
            console.log("[workScheduleAPI] Thành công với /workSchedule:", response.data);
            return response;
          })
          .catch(error2 => {
            console.error("[workScheduleAPI] Lỗi khi gọi /workSchedule:", error2.message);
            
            // Thử endpoint thứ ba: /work-schedule (kebab-case)
            console.log("[workScheduleAPI] Thử lại với endpoint /work-schedule");
            return apiClient.get('/work-schedule')
              .then(response => {
                console.log("[workScheduleAPI] Thành công với /work-schedule:", response.data);
                return response;
              })
              .catch(error3 => {
                console.error("[workScheduleAPI] Lỗi khi gọi /work-schedule:", error3.message);
                
                // Trả về lỗi ban đầu nếu tất cả endpoint đều thất bại
                return Promise.reject(error);
              });
          });
      });
  },
  
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
  
  // Lấy danh sách hình ảnh
  getImages: () => {
    console.log('[imageAPI] Gọi API lấy tất cả hình ảnh');
    return apiClient.get('/images').then(
      (response) => {
        console.log('[imageAPI] Thành công - Lấy tất cả hình ảnh:', response.data);
        return response;
      },
      (error) => {
        console.error('[imageAPI] Lỗi - Lấy tất cả hình ảnh:', error.message);
        return Promise.reject(error);
      }
    );
  },
  
  // Lấy tt hình ảnh theo ID
  getImageById: (imageId) => apiClient.get(`/images/${imageId}`),
  
  // Lấy hình ảnh theo stadiumId
  getImagesByStadiumId: (stadiumId) => {
    console.log(`[imageAPI] Gọi API lấy ảnh cho sân có ID: ${stadiumId}`);
    
    // Lấy tất cả ảnh và sau đó lọc theo stadiumId ở phía client
    return apiClient.get('/images').then(response => {
      console.log('[imageAPI] Đã nhận response từ /images');
      
      // Kiểm tra cấu trúc dữ liệu
      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        // Lọc các ảnh có stadiumId trùng khớp
        const filteredImages = response.data.result.filter(img => img.stadiumId === stadiumId);
        console.log(`[imageAPI] Đã lọc được ${filteredImages.length} ảnh cho sân ID ${stadiumId}`);
        
        // Thay thế response.data.result bằng dữ liệu đã lọc
        const newResponse = { ...response, data: { ...response.data, result: filteredImages } };
        return newResponse;
      }
      
      return response;
    });
  },
  
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