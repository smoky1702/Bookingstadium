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
      
      if (response.data.result && response.data.result.valid) {
        // Lấy thông tin người dùng từ token (lấy userId từ token)
        const userId = getUserIdFromToken(token);
        if (userId) {
          try {
            const userResponse = await userAPI.getCurrentUser(userId);
            setCurrentUser(userResponse.data.result);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Error fetching user data:", error);
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        }
      } else {
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub; // Giả sử rằng subject (sub) trong JWT là userId
    } catch (error) {
      console.error("Error parsing token:", error);
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
        throw new Error('Login failed: Invalid response');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to login. Please try again.');
      return { success: false, error: error.response?.data?.message || 'Failed to login' };
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
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
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