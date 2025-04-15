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

// Interceptor thêm token và log request
apiClient.interceptors.request.use(
  (config) => {
    // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
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
        // console.log(`URL ${config.url} khớp với endpoint pattern ${endpoint.path}`);
        
        // Kiểm tra xem URL có ID không
        const hasId = config.url.split('/').length > 2;
        
        // Endpoint cho phép ID hoặc không có ID
        const isPublic = !hasId || endpoint.allowId;
        // console.log(`URL có ID: ${hasId}, Endpoint cho phép ID: ${endpoint.allowId}, Là public: ${isPublic}`);
        
        return isPublic;
      }
      
      return false;
    });

    // console.log(`[API Request] URL: ${config.url}, Method: ${config.method}`);
    // console.log(`[API Request] Is public endpoint: ${isPublicEndpoint}`);
    
    // Luôn gửi token nếu có token, không phụ thuộc vào endpoint (đảm bảo mọi request đều có token)
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      // Bảo đảm không ghi đè header đã được thiết lập trực tiếp trong API call
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
        // console.log('[API Request] Token attached');
      } else {
        // console.log('[API Request] Token already set in request');
      }
    } else {
      // console.log('[API Request] No token found');
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
    // console.log(`[API Success] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // console.error(
      //   `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      //   error.response.status,
      //   error.response?.data || error.message
      // );
      
      // Xử lý lỗi 401
      if (error.response.status === 401) {
        // console.log('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        
        // Có thể thêm xử lý chuyển hướng đến trang đăng nhập ở đây
      }
      
      // Xử lý lỗi 403 (không có quyền)
      if (error.response.status === 403) {
        // console.log('Bạn không có quyền thực hiện hành động này');
        
        // Thêm thông báo hoặc xử lý cho trường hợp người dùng không có quyền
        const forbiddenEvent = new CustomEvent('api:forbidden', {
          detail: {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            message: error.response?.data?.message || 'Bạn không có quyền thực hiện hành động này'
          }
        });
        window.dispatchEvent(forbiddenEvent);
      }
    } else {
      // console.error(
      //   `[API Network Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      //   error.message
      // );
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
    // console.log('[userAPI] Gọi API lấy danh sách tất cả người dùng');
    return apiClient.get('/users');
  },

  // Lấy thông tin người dùng hiện tại qua API /users/me (CHUẨN REST)
  getCurrentUserMe: () => {
    console.log('[userAPI] Gọi API /users/me');
    return apiClient.get('/users/me');
  },
  
  // Lấy thông tin người dùng hiện tại (sử dụng email từ token)
  getCurrentUser: () => {
    // console.log('[userAPI] Gọi API lấy thông tin người dùng hiện tại');
    
    // Kiểm tra xem API /users/me có hoạt động không
    return userAPI.getCurrentUserMe()
      .catch(error => {
        console.log('[userAPI] API /users/me chưa có sẵn, thử phương án dự phòng');
        
        // Lấy token từ localStorage
        const token = localStorage.getItem('accessToken');
        if (!token) {
          return Promise.reject(new Error('Không tìm thấy token đăng nhập'));
        }
        
        try {
          // Giải mã JWT token (phần payload)
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            return Promise.reject(new Error('Token không hợp lệ'));
          }
          
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload && payload.sub) {
            // Lấy email từ sub trong token
            const email = payload.sub;
            // console.log(`[userAPI] Lấy thông tin người dùng với email: ${email}`);
            
            // Lấy tất cả người dùng (điều này chỉ dành cho ADMIN)
            return apiClient.get('/users')
              .then(response => {
                // Kiểm tra cấu trúc phản hồi
                if (response && response.data) {
                  let users = [];
                  
                  // Trích xuất danh sách người dùng từ phản hồi
                  if (response.data.result && Array.isArray(response.data.result)) {
                    users = response.data.result;
                  } else if (Array.isArray(response.data)) {
                    users = response.data;
                  }
                  
                  // Tìm người dùng có email khớp
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
                
                // Nếu không tìm thấy người dùng, sử dụng cache hoặc đưa ra lỗi
                throw new Error('Không tìm thấy thông tin người dùng');
              })
              .catch(error => {
                console.error('[userAPI] Lỗi khi lấy danh sách người dùng:', error);
                
                // Trường hợp không có quyền ADMIN để lấy danh sách người dùng
                if (error.response && error.response.status === 403) {
                  console.log('[userAPI] Không có quyền lấy danh sách người dùng, thử lấy từ cache hoặc tạo thông tin cơ bản');
                  
                  // Tạo thông tin người dùng cơ bản từ JWT
                  const basicUser = {
                    email: email,
                    role: payload.scope ? payload.scope.replace('SCOPE_', '') : 'USER'
                  };
                  
                  // Thử lấy thông tin từ sessionStorage cache nếu có
                  const cachedUser = sessionStorage.getItem('currentUser');
                  if (cachedUser) {
                    try {
                      const parsedUser = JSON.parse(cachedUser);
                      if (parsedUser.email === email) {
                        return { data: { result: parsedUser } };
                      }
                    } catch (e) {
                      console.error('Lỗi khi parse cached user:', e);
                    }
                  }
                  
                  // Trả về thông tin cơ bản
                  return { data: { result: basicUser } };
                }
                
                return Promise.reject(error);
              });
          } else {
            return Promise.reject(new Error('Token không chứa thông tin người dùng'));
          }
        } catch (e) {
          console.error('[userAPI] Lỗi khi xử lý token:', e);
          return Promise.reject(new Error('Không thể xác định thông tin người dùng từ token'));
        }
      });
  },
  
  // Lấy tt người dùng theo ID
  getUserById: (id) => {
    // console.log(`[userAPI] Gọi API lấy thông tin user với ID: ${id}`);
    return apiClient.get(`/users/${id}`)
      .catch(error => {
        console.error(`[userAPI] Lỗi khi lấy thông tin user ID ${id}:`, error);
        
        // Xử lý lỗi 403 - Người dùng không có quyền truy cập
        if (error.response && error.response.status === 403) {
          // Trigger sự kiện lỗi phân quyền
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
  
  // Lấy người dùng theo firstname (endpoint mới)
  getUserByFirstname: (firstname) => {
    // console.log(`[userAPI] Gọi API lấy thông tin user với firstname: ${firstname}`);
    return apiClient.get(`/users/${firstname}`);
  },
  
  // Lấy người dùng theo lastname (endpoint mới)
  getUserByLastname: (lastname) => {
    // console.log(`[userAPI] Gọi API lấy thông tin user với lastname: ${lastname}`);
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
    return apiClient.get("/stadium");
  },
  
  // Lấy tt chi tiết sân bóng theo ID
  getStadiumById: (stadiumId) => {
    return apiClient.get(`/stadium/${stadiumId}`);
  },

  // Cập nhật sân bóng
  updateStadium: (stadiumId, stadiumData) => apiClient.put(`/stadium/${stadiumId}`, stadiumData),

  // Xóa sân bóng
  deleteStadium: (stadiumId) => apiClient.delete(`/stadium/${stadiumId}`),

  // Lấy các booking của một sân trong một ngày
  getStadiumBooking: (stadiumId, date) => {
    // console.log(`[stadiumAPI] Lấy booking cho sân ${stadiumId} vào ngày ${date}`);
    return apiClient.get(`/stadium/${stadiumId}/booking`, {
      params: { date: date }
    });
  },
};

// API cho loại sân
const typeAPI = {
  // Lấy danh sách loại sân
  getTypes: () => {
    // console.log('[typeAPI] Gọi API lấy danh sách loại sân');
    return apiClient.get('/type');
  },
  
  // Thử endpoint khác nếu trên không hoạt động
  getTypesAlternative: () => {
    // console.log('[typeAPI] Thử API endpoint thay thế');
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
    // console.log("[API Call] GET /location");
    return apiClient.get("/location").then(
      (response) => {
        // console.log("[API Success] GET /location", response.data);
        return response;
      },
      (error) => {
        // console.error("[API Error] GET /location", error);
        return Promise.reject(error);
      }
    );
  },
  
  // Lấy thông tin location theo ID
  getLocationById: (locationId) => {
    // console.log(`[locationAPI] Gọi API lấy thông tin location với ID: ${locationId}`);
    return apiClient.get(`/location/${locationId}`)
      .then(response => {
        // console.log(`[locationAPI] Thành công lấy location với ID ${locationId}:`, response.data);
        return response;
      })
      .catch(error => {
        // console.error(`[locationAPI] Lỗi khi lấy location với ID ${locationId}:`, error);
        return Promise.reject(error);
      });
  },
  
  // Tạo location mới
  createLocation: (locationData) => {
    // console.log('[locationAPI] Gọi API tạo location với dữ liệu:', locationData);
    return apiClient.post('/location', locationData);
  },
  
  // Cập nhật location
  updateLocation: (locationId, locationData) => {
    // console.log(`[locationAPI] Gọi API cập nhật location ID ${locationId}:`, locationData);
    return apiClient.put(`/location/${locationId}`, locationData);
  },
  
  // Xóa location
  deleteLocation: (locationId) => {
    // console.log(`[locationAPI] Gọi API xóa location ID ${locationId}`);
    return apiClient.delete(`/location/${locationId}`);
  }
};

// API cho booking
const bookingAPI = {
  createBooking: (bookingData) => {
    // console.log('[bookingAPI] Gọi API tạo booking với dữ liệu:', bookingData);
    
    // Đảm bảo dữ liệu có định dạng đúng để phù hợp với @JsonProperty trong backend
    const formattedData = {
      user_id: bookingData.user_id || bookingData.userId,
      location_id: bookingData.location_id || bookingData.locationId,
      date_of_booking: bookingData.date_of_booking || bookingData.dateOfBooking,
      start_time: bookingData.start_time || bookingData.startTime,
      end_time: bookingData.end_time || bookingData.endTime
    };
    
    // Đảm bảo start_time có định dạng HH:MM:SS
    if (formattedData.start_time && formattedData.start_time.split(':').length === 2) {
      formattedData.start_time = `${formattedData.start_time}:00`;
    }
    
    // Đảm bảo end_time có định dạng HH:MM:SS - sửa lỗi logic
    if (formattedData.end_time && formattedData.end_time.split(':').length === 2) {
      formattedData.end_time = `${formattedData.end_time}:00`;
    }
    
    // Kiểm tra token trước khi gửi yêu cầu
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    // console.log('[bookingAPI] Token hiện tại:', token ? 'Token có giá trị' : 'Token không tồn tại');
    
    return apiClient.post('/booking', formattedData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        // console.log('[bookingAPI] Tạo booking thành công:', response.data);
        return response;
      })
      .catch(error => {
        // console.error('[bookingAPI] Lỗi khi tạo booking:', error.response?.data || error.message);
        // console.error('[bookingAPI] Status code:', error.response?.status);
        // console.error('[bookingAPI] Headers:', error.config?.headers);
        return Promise.reject(error);
      });
  },
  getBooking: () => apiClient.get("/booking"),
  getBookingById: (bookingId) => {
    console.log(`[bookingAPI] Gọi API lấy booking với ID: ${bookingId}`);
    
    // Kiểm tra token trước khi gửi yêu cầu
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers = {
      'Authorization': token ? `Bearer ${token}` : undefined
    };
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    
    // Thử endpoint chính
    return apiClient.get(`/booking/${bookingId}`, { headers })
      .then(response => {
        console.log(`[bookingAPI] API response thành công từ /booking/${bookingId}:`, response);
        console.log(`[bookingAPI] API response data:`, response.data);
        if (response.data && response.data.result) {
          console.log(`[bookingAPI] API response result:`, response.data.result);
          
          // Kiểm tra và chuẩn hóa result
          if (Array.isArray(response.data.result) && response.data.result.length > 0) {
            console.log(`[bookingAPI] Status từ API:`, response.data.result[0].status);
            // Trả về dữ liệu đã chuẩn hóa
            return {
              ...response,
              data: {
                ...response.data,
                result: response.data.result[0]  // Lấy phần tử đầu tiên của mảng
              }
            };
          }
        }
        return response;
      })
      .catch(error => {
        console.error(`[bookingAPI] Lỗi khi lấy booking với ID ${bookingId}:`, error);
        
        // Thử gọi lại endpoint chính với timestamp (tránh cache)
        return apiClient.get(`/booking/${bookingId}?_=${timestamp}`, { headers })
          .then(response => {
            console.log(`[bookingAPI] API response thành công từ /booking/${bookingId}?_=${timestamp}:`, response.data);
            return response;
          })
          .catch(timestampError => {
            // Thử endpoint thay thế
            return apiClient.get(`/bookings/${bookingId}`, { headers })
              .then(response => {
                console.log(`[bookingAPI] API response thành công từ /bookings/${bookingId}:`, response.data);
                return response;
              })
              .catch(() => {
                // Nếu cả hai endpoint đều thất bại, trả về lỗi gốc
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
    // console.log('[stadiumBookingDetailAPI] Gọi API tạo booking detail với dữ liệu:', detailData);
    
    // Đảm bảo dữ liệu có định dạng đúng để phù hợp với @JsonProperty trong backend
    const formattedData = {
      stadium_booking_id: detailData.stadium_booking_id || detailData.bookingId || detailData.stadiumBookingId,
      type_id: detailData.type_id || detailData.typeId,
      stadium_id: detailData.stadium_id || detailData.stadiumId
    };
    
    // Kiểm tra token trước khi gửi yêu cầu
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    // console.log('[stadiumBookingDetailAPI] Token hiện tại:', token ? 'Token có giá trị' : 'Token không tồn tại');
    
    return apiClient.post('/details', formattedData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        // console.log('[stadiumBookingDetailAPI] Tạo booking detail thành công:', response.data);
        return response;
      })
      .catch(error => {
        // console.error('[stadiumBookingDetailAPI] Lỗi khi tạo booking detail:', error.response?.data || error.message);
        // console.error('[stadiumBookingDetailAPI] Status code:', error.response?.status);
        // console.error('[stadiumBookingDetailAPI] Headers:', error.config?.headers);
        return Promise.reject(error);
      });
  },
  getStadiumBookingDetail: () => apiClient.get("/details"),
  getStadiumBookingDetailById: (detailId) => {
    console.log(`[stadiumBookingDetailAPI] Gọi API lấy chi tiết booking với ID: ${detailId}`);
    
    // Kiểm tra token trước khi gửi yêu cầu
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    
    return apiClient.get(`/details/${detailId}?_=${timestamp}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined
      }
    })
      .then(response => {
        console.log(`[stadiumBookingDetailAPI] Phản hồi thành công:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`[stadiumBookingDetailAPI] Lỗi khi lấy chi tiết booking với ID ${detailId}:`, error.response?.status, error.message);
        return Promise.reject(error);
      });
  },
  
  // API mới: Lấy booking detail theo booking ID (giả định backend đã thêm)
  getStadiumBookingDetailByBookingId: (bookingId) => {
    console.log(`[stadiumBookingDetailAPI] Gọi API lấy chi tiết booking theo BookingId: ${bookingId}`);
    
    // Kiểm tra token trước khi gửi yêu cầu
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    
    return apiClient.get(`/details/booking/${bookingId}?_=${timestamp}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined
      }
    })
      .then(response => {
        console.log(`[stadiumBookingDetailAPI] Phản hồi thành công từ API /details/booking:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`[stadiumBookingDetailAPI] Lỗi khi lấy chi tiết theo bookingId ${bookingId}:`, error.response?.status, error.message);
        return Promise.reject(error);
      });
  },

  // Phương thức getStadiumBookingDetailByBookingId đã bị loại bỏ vì:
  // 1. Backend không có API endpoint nào cho /details/booking/{bookingId}
  // 2. Theo SecurityConfig.java, API /details yêu cầu quyền ADMIN
  // 3. Frontend hiện tạo mock detail từ booking data thay vì gọi API
  
  updateStadiumBookingDetail: (stadiumBookingDetailId, detailData) => apiClient.put(`/details/${stadiumBookingDetailId}`, detailData),
  deleteStadiumBookingDetail: (stadiumBookingDetailId) => apiClient.delete(`/details/${stadiumBookingDetailId}`)
};

// API cho bill
const billAPI = {
  // Endpoint cũ - giữ lại để tương thích ngược
  createBill: (billData) => {
    // console.log('[billAPI] Gọi API tạo bill với dữ liệu:', billData);
    
    // Kiểm tra token trước khi gửi yêu cầu
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    // console.log('[billAPI] Token hiện tại:', token ? 'Token có giá trị' : 'Token không tồn tại');
    
    return apiClient.post('/bill', billData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        // console.log('[billAPI] Tạo bill thành công:', response.data);
        return response;
      })
      .catch(error => {
        // console.error('[billAPI] Lỗi khi tạo bill:', error.response?.data || error.message);
        // console.error('[billAPI] Status code:', error.response?.status);
        // console.error('[billAPI] Headers:', error.config?.headers);
        return Promise.reject(error);
      });
  },
  
  // Endpoint mới cho USER tạo bill
  createUserBill: (billData) => {
    // console.log('[billAPI] Gọi API tạo bill cho USER với dữ liệu:', billData);
    
    // Kiểm tra token trước khi gửi yêu cầu
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    return apiClient.post('/bill/user', billData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        // console.log('[billAPI] Tạo bill USER thành công:', response.data);
        return response;
      })
      .catch(error => {
        // console.error('[billAPI] Lỗi khi tạo bill USER:', error.response?.data || error.message);
        return Promise.reject(error);
      });
  },
  
  // Endpoint mới cho OWNER tạo bill
  createOwnerBill: (billData) => {
    // console.log('[billAPI] Gọi API tạo bill cho OWNER với dữ liệu:', billData);
    
    // Kiểm tra token trước khi gửi yêu cầu
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    return apiClient.post('/bill/owner', billData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        // console.log('[billAPI] Tạo bill OWNER thành công:', response.data);
        return response;
      })
      .catch(error => {
        // console.error('[billAPI] Lỗi khi tạo bill OWNER:', error.response?.data || error.message);
        return Promise.reject(error);
      });
  },
  
  // Gộp getBill và getBills thành một phương thức
  getBills: () => {
    // console.log('[billAPI] Gọi API lấy tất cả hóa đơn');
    return apiClient.get('/bill')
      .then(response => {
        // console.log('[billAPI] Lấy tất cả hóa đơn thành công:', response.data);
        return response;
      })
      .catch(error => {
        // console.error('[billAPI] Lỗi khi lấy tất cả hóa đơn:', error.response?.data || error.message);
        return Promise.reject(error);
      });
  },
  // Giữ lại alias cũ để tương thích ngược
  getBill: function() { return this.getBills(); },
  
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
    // console.log('[evaluationAPI] Gọi API lấy tất cả đánh giá');
    return apiClient.get('/evaluation').then(
      (response) => {
        // console.log('[evaluationAPI] Thành công - Lấy tất cả đánh giá:', response.data);
        return response;
      },
      (error) => {
        // console.error('[evaluationAPI] Lỗi - Lấy tất cả đánh giá:', error.message);
        return Promise.reject(error);
      }
    );
  },
  
  // Lấy tt đánh giá theo ID
  getEvaluationById: (evaluationId) => apiClient.get(`/evaluation/${evaluationId}`),
  
  // Lấy đánh giá theo ID sân
  getEvaluationsByStadiumId: (stadiumId) => {
    // console.log(`[evaluationAPI] Gọi API lấy đánh giá cho sân có ID: ${stadiumId}`);
    
    // Lấy tất cả đánh giá và sau đó lọc theo stadiumId ở phía client
    return apiClient.get('/evaluation').then(response => {
      // console.log('[evaluationAPI] Đã nhận response từ /evaluation');
      
      // Kiểm tra cấu trúc dữ liệu
      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        // Lọc các đánh giá có stadiumId trùng khớp
        const filteredEvaluations = response.data.result.filter(evaluation => 
          evaluation.stadiumId == stadiumId || evaluation.stadium_id == stadiumId
        );
        // console.log(`[evaluationAPI] Đã lọc được ${filteredEvaluations.length} đánh giá cho sân ID ${stadiumId}`);
        
        // Thay thế response.data.result bằng dữ liệu đã lọc
        const newResponse = { ...response, data: { ...response.data, result: filteredEvaluations } };
        return newResponse;
      } else if (response.data && Array.isArray(response.data)) {
        // Trường hợp response.data là một mảng trực tiếp
        const filteredEvaluations = response.data.filter(evaluation => 
          evaluation.stadiumId == stadiumId || evaluation.stadium_id == stadiumId
        );
        // console.log(`[evaluationAPI] Đã lọc được ${filteredEvaluations.length} đánh giá cho sân ID ${stadiumId}`);
        
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
    // console.log("[workScheduleAPI] Đang gọi API lấy lịch làm việc");
    return apiClient.get('/WorkSchedule')
      .then(response => {
        // console.log("[workScheduleAPI] Thành công:", response.data);
        return response;
      })
      .catch(error => {
        // console.error("[workScheduleAPI] Lỗi khi gọi /WorkSchedule:", error.message);
        return Promise.reject(error);
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
    // console.log('[imageAPI] Gọi API lấy tất cả hình ảnh');
    return apiClient.get('/images').then(
      (response) => {
        // console.log('[imageAPI] Thành công - Lấy tất cả hình ảnh:', response.data);
        return response;
      },
      (error) => {
        // console.error('[imageAPI] Lỗi - Lấy tất cả hình ảnh:', error.message);
        return Promise.reject(error);
      }
    );
  },
  
  // Lấy tt hình ảnh theo ID
  getImageById: (imageId) => apiClient.get(`/images/${imageId}`),
  
  // Lấy hình ảnh theo stadiumId
  getImagesByStadiumId: (stadiumId) => {
    // console.log(`[imageAPI] Gọi API lấy ảnh cho sân có ID: ${stadiumId}`);
    
    // Lấy tất cả ảnh và sau đó lọc theo stadiumId ở phía client
    return apiClient.get('/images').then(response => {
      // console.log('[imageAPI] Đã nhận response từ /images');
      
      // Kiểm tra cấu trúc dữ liệu
      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        // Lọc các ảnh có stadiumId trùng khớp
        const filteredImages = response.data.result.filter(img => img.stadiumId === stadiumId);
        // console.log(`[imageAPI] Đã lọc được ${filteredImages.length} ảnh cho sân ID ${stadiumId}`);
        
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