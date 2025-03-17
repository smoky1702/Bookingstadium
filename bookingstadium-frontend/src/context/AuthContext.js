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
      const response = await authAPI.validateToken({ token });
      
      if (response.data && response.data.result && response.data.result.valid) {
        // Lấy thông tin người dùng từ token (lấy userId từ token)
        const userId = getUserIdFromToken(token);
        if (userId) {
          try {
            const userResponse = await userAPI.getCurrentUser(userId);
            if (userResponse.data && userResponse.data.result) {
              setCurrentUser(userResponse.data.result);
              setIsAuthenticated(true);
            } else {
              console.error("Không thể lấy thông tin người dùng từ phản hồi");
              localStorage.removeItem('accessToken');
              setIsAuthenticated(false);
              setCurrentUser(null);
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } else {
          console.error("Không thể lấy userId từ token");
          localStorage.removeItem('accessToken');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        console.log("Token không hợp lệ hoặc đã hết hạn");
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

  // Hàm này parse JWT token để lấy userId
  const getUserIdFromToken = (token) => {
    try {
      // Giải mã JWT payload (phần thứ hai của token sau dấu chấm)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Lấy user_id từ claim "user_id" trong token
      // Nếu không có, thử lấy từ claim "sub" (subject)
      return payload.user_id || payload.sub;
    } catch (error) {
      console.error("Lỗi phân tích token:", error);
      return null;
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
        localStorage.setItem('accessToken', response.data.result.token);
        
        // Sau khi đăng nhập thành công, kiểm tra lại trạng thái xác thực
        await checkAuthStatus();
        
        return { success: true };
      } else {
        throw new Error('Đăng nhập thất bại: phản hồi không hợp lệ');
      }
    } catch (error) {
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        // Nếu có phản hồi từ server
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