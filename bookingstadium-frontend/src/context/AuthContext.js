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
      
      // Kiểm tra token có hợp lệ không
      try {
        const introspectResponse = await authAPI.introspect({ token });
        
        if (introspectResponse.data && introspectResponse.data.result && introspectResponse.data.result.valid) {
          // Token hợp lệ, lấy thông tin user
          setIsAuthenticated(true);
          
          // Lấy email từ token để hiển thị thông tin cơ bản
          const email = getEmailFromToken(token);
          if (email) {
            // Tạo một đối tượng user cơ bản từ thông tin trong token
            const basicUserInfo = {
              email: email,
              role: { roleName: getRoleFromToken(token) }
            };
            
            setCurrentUser(basicUserInfo);
            
            // Lấy thông tin chi tiết của user từ API
            try {
              const userId = getUserIdFromToken(token);
              if (userId) {
                const userResponse = await userAPI.getUserById(userId);
                if (userResponse.data && userResponse.data.result) {
                  // Cập nhật thông tin người dùng đầy đủ
                  setCurrentUser(userResponse.data.result);
                }
              }
            } catch (userError) {
              console.error("Lỗi khi lấy thông tin chi tiết người dùng:", userError);
              // Vẫn sử dụng thông tin cơ bản nếu không lấy được chi tiết
            }
          }
        } else {
          // Token không hợp lệ
          localStorage.removeItem('accessToken');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Lỗi kiểm tra token:", error);
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setCurrentUser(null);
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
      return payload.sub || '';
    } catch (error) {
      console.error("Lỗi phân tích token:", error);
      return '';
    }
  };
  
  // Hàm lấy userId từ JWT token (nếu có)
  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || '';
    } catch (error) {
      console.error("Lỗi phân tích token:", error);
      return '';
    }
  };
  
  // Hàm lấy role từ JWT token
  const getRoleFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
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
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Email hoặc mật khẩu không chính xác';
        } else if (error.response.status === 404) {
          errorMessage = 'Không tìm thấy tài khoản với email này';
        }
      } else if (error.request) {
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
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 409) {
          errorMessage = 'Email đã tồn tại trong hệ thống';
        }
      } else if (error.request) {
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

  // Cập nhật thông tin người dùng
  const updateUserInfo = async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.updateUser(userId, userData);
      
      if (response.data && response.data.result) {
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...response.data.result
        }));
        return { success: true, data: response.data.result };
      } else {
        throw new Error('Cập nhật thông tin thất bại: phản hồi không hợp lệ');
      }
    } catch (error) {
      let errorMessage = 'Cập nhật thông tin thất bại. Vui lòng thử lại.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
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
    checkAuthStatus,
    updateUserInfo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;