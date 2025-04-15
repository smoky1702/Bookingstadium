import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [forbiddenError, setForbiddenError] = useState(null);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [isUserRole, setIsUserRole] = useState(false);
  const [isOwnerRole, setIsOwnerRole] = useState(false);

  // Lắng nghe sự kiện lỗi 403 (forbidden) từ apiService
  useEffect(() => {
    const handleForbidden = (event) => {
      console.log('Lỗi phân quyền:', event.detail);
      setForbiddenError({
        message: event.detail.message,
        url: event.detail.url,
        method: event.detail.method,
        timestamp: new Date()
      });
      
      // Tự động xóa thông báo lỗi sau 5 giây
      setTimeout(() => {
        setForbiddenError(null);
      }, 5000);
    };
    
    window.addEventListener('api:forbidden', handleForbidden);
    
    // Cleanup
    return () => {
      window.removeEventListener('api:forbidden', handleForbidden);
    };
  }, []);

  // Hàm phân tích JWT token để lấy thông tin
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Lỗi khi phân tích token:', error);
      return null;
    }
  };

  // Lấy user_id từ token (Spring Security không cung cấp user_id trong token)
  const getUserIdFromToken = (token) => {
    // Trong Spring Security chuẩn, token JWT không chứa user_id
    // Chúng ta sẽ cần lấy thông tin này từ API hoặc từ sessionStorage
    try {
      // Kiểm tra cache trước
      const cachedUser = sessionStorage.getItem('currentUser');
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        if (user && (user.id || user.user_id)) {
          return user.id || user.user_id;
        }
      }
      
      // Nếu không có trong cache, trả về null
      return null;
    } catch (error) {
      console.error('Lỗi khi trích xuất user_id từ cache:', error);
      return null;
    }
  };
  
  // Lấy email từ token
  const getEmailFromToken = (token) => {
    try {
      const decoded = parseJwt(token);
      // Email có thể được lưu trong các trường khác nhau tùy thuộc vào cấu hình JWT
      if (decoded) {
        return decoded.sub || decoded.email || decoded.username || null;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi trích xuất email từ token:', error);
      return null;
    }
  };
  
  // Lấy role từ token
  const getRoleFromToken = (token) => {
    try {
      const decoded = parseJwt(token);
      // Role trong Spring Security thường được lưu trong scope
      if (decoded && decoded.scope) {
        const scopes = decoded.scope.split(' ');
        // Tìm role trong các scope
        for (const scope of scopes) {
          if (scope === 'ADMIN' || scope === 'USER' || scope === 'OWNER') {
            return scope;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi trích xuất role từ token:', error);
      return null;
    }
  };

  // Nếu đã có token, tự động đăng nhập khi khởi động
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Nếu không có accessToken, không cần kiểm tra
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      
        // Phân tích JWT token
        const userId = getUserIdFromToken(accessToken); // có thể null
        const email = getEmailFromToken(accessToken);
        const role = getRoleFromToken(accessToken);
        
        if (email) {
          // Cập nhật thông tin người dùng từ token
          setCurrentUser({
            email: email,
            user_id: userId, // có thể null
            role: role,
            firstName: '', // Sẽ được cập nhật khi gọi API chi tiết
            lastName: ''
          });
          
          setIsAuthenticated(true);
          
          // Cập nhật trạng thái role
          setIsUserRole(role === 'USER');
          setIsOwnerRole(role === 'OWNER');
          setIsAdminRole(role === 'ADMIN');
        } else {
          // Token không hợp lệ
          localStorage.removeItem('accessToken');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Hàm kiểm tra xác thực - được gọi từ bên ngoài khi cần
  const checkAuthStatus = useCallback(async () => {
    try {
      // Kiểm tra token hiện tại
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        return false;
      }
      
      // Phân tích JWT token
      const userId = getUserIdFromToken(accessToken);
      const email = getEmailFromToken(accessToken);
      const role = getRoleFromToken(accessToken);
      
      if (email && userId) {
        // Token có vẻ hợp lệ, cập nhật thông tin
        // Sửa: Chỉ cập nhật nếu thông tin thay đổi để tránh vòng lặp
        setCurrentUser(prevUser => {
          // Nếu đã có thông tin giống nhau, không cập nhật
          if (prevUser && 
              prevUser.email === email && 
              prevUser.user_id === userId &&
              prevUser.role === role) {
            return prevUser;
          }
          
          // Nếu thông tin khác, cập nhật
          return {
            email: email,
            user_id: userId,
            role: role,
            firstName: prevUser?.firstName || '',
            lastName: prevUser?.lastName || ''
          };
        });
        
        setIsAuthenticated(true);
        
        // Cập nhật trạng thái role
        setIsUserRole(role === 'USER');
        setIsOwnerRole(role === 'OWNER');
        setIsAdminRole(role === 'ADMIN');
        
        return true;
      } else {
        // Token không hợp lệ
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setCurrentUser(null);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra xác thực:', error);
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setCurrentUser(null);
      return false;
    }
  }, []); // Xóa dependency currentUser để tránh vòng lặp

  // Hàm đăng nhập
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      
      // Debug để xem cấu trúc response từ backend
      console.log('Login response:', response);
      
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
        } else if (error.response.status === 403) {
          errorMessage = 'Tài khoản của bạn không có quyền truy cập';
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
      
      // Đảm bảo vai trò là USER
      const userDataWithRole = {
        ...userData,
        role: 'USER' // Mặc định là USER cho ứng dụng web
      };
      
      const response = await authAPI.register(userDataWithRole);
      
      // Debug để xem cấu trúc response từ backend
      console.log('Register response:', response);
      
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
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        } else if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền cập nhật thông tin này';
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra có phải là user không (phục vụ phân quyền đơn giản)
  const isUser = () => {
    if (!currentUser || !currentUser.role) return false;
    
    // Xử lý nhiều dạng role khác nhau
    if (typeof currentUser.role === 'string') {
      return currentUser.role === 'USER';
    } else if (currentUser.role.roleName) {
      return currentUser.role.roleName === 'USER';
    } else if (currentUser.role.roleId) {
      return currentUser.role.roleId === 'USER';
    }
    
    return false;
  };

  // Hàm cập nhật thông tin user_id trong context
  const setUserInfo = useCallback((userId) => {
    setCurrentUser(prev => {
      if (prev && prev.user_id === userId) {
        return prev; // Không thay đổi nếu giống nhau
      }
      return {
        ...prev,
        user_id: userId
      };
    });
  }, []);

  // Các giá trị và function được cung cấp bởi context
  const value = {
    currentUser,
    loading,
    error,
    forbiddenError,
    isAuthenticated,
    isUser,
    isUserRole,
    isOwnerRole,
    isAdminRole,
    login,
    register,
    logout,
    checkAuthStatus,
    updateUserInfo,
    setUserInfo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;