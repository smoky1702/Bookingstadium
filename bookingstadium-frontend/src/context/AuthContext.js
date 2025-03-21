import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra xem người dùng đã đăng nhập chưa (khi refresh trang)
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      
      // Từ token đã xác định người dùng đã đăng nhập
      // Đặt isAuthenticated = true ngay lập tức
      setIsAuthenticated(true);
      
      try {
        // Lấy email từ token để hiển thị thông tin cơ bản
        const email = getEmailFromToken(token);
        if (email) {
          // Lấy role từ token
          const role = getRoleFromToken(token);
          
          // Tạo một đối tượng user cơ bản từ thông tin trong token
          const basicUserInfo = {
            email: email,
            // Các thông tin khác sẽ được điền sau
            firstname: '',
            lastname: '',
            role: { roleName: role }
          };
          
          setCurrentUser(basicUserInfo);
          
          // Nếu backend hỗ trợ API lấy thông tin user bằng email, bạn có thể gọi
          try {
            const userResponse = await userAPI.getUserByEmail(email);
            if (userResponse.data && userResponse.data.result) {
              // Cập nhật thông tin người dùng với dữ liệu đầy đủ từ API
              const fullUserInfo = {
                ...userResponse.data.result,
                role: { roleName: role } // Đảm bảo giữ lại thông tin vai trò từ token
              };
              setCurrentUser(fullUserInfo);
            }
          } catch (userError) {
            console.error("Lỗi khi lấy thông tin chi tiết người dùng:", userError);
            // Sử dụng thông tin cơ bản nếu không lấy được thông tin chi tiết
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        // Không cần xóa token ở đây, vì người dùng vẫn đã đăng nhập
        // Chỉ thiếu thông tin chi tiết
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái xác thực:", error);
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm lấy email từ JWT token
  const getEmailFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("JWT payload:", payload);
      return payload.sub || '';
    } catch (error) {
      console.error("Lỗi phân tích token:", error);
      return '';
    }
  };
  
  // Hàm lấy role từ JWT token
  const getRoleFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("JWT payload:", payload);
      // Từ scope trả về, lấy ra role name
      // Giả sử scope trả về là "ADMIN", "USER", hoặc "MANAGER"
      return payload.scope || 'USER';
    } catch (error) {
      console.error("Lỗi phân tích token:", error);
      return 'USER';
    }
  };

  // Kiểm tra xác thực khi component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Hàm đăng nhập
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      console.log("Login response:", response);
      
      if (response.data && response.data.result && response.data.result.token) {
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', response.data.result.token);
        
        // Đặt isAuthenticated = true
        setIsAuthenticated(true);
        
        // Lấy thông tin cơ bản từ token
        const userEmail = getEmailFromToken(response.data.result.token);
        const userRole = getRoleFromToken(response.data.result.token);
        
        // Tạo đối tượng user cơ bản
        setCurrentUser({
          email: userEmail,
          role: { roleName: userRole },
          firstname: userEmail.split('@')[0], // Tạm thời dùng phần đầu email làm tên
          lastname: ''
        });
        
        return { success: true };
      } else {
        throw new Error('Đăng nhập thất bại: phản hồi không hợp lệ');
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        // Nếu có phản hồi từ server
        console.log("Error response:", error.response);
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Email hoặc mật khẩu không chính xác';
        } else if (error.response.status === 404) {
          errorMessage = 'Không tìm thấy tài khoản với email này';
        }
      } else if (error.request) {
        // Nếu request được gửi nhưng không nhận được phản hồi
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng ký
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      if (response.data && response.data.result) {
        return { success: true, data: response.data };
      } else {
        throw new Error('Đăng ký thất bại: phản hồi không hợp lệ');
      }
    } catch (error) {
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        // Nếu có phản hồi từ server
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 409) {
          errorMessage = 'Email đã tồn tại trong hệ thống';
        }
      } else if (error.request) {
        // Nếu request được gửi nhưng không nhận được phản hồi
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem('accessToken');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Các giá trị và function được cung cấp bởi context
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;