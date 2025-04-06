// Thêm logging và kiểm tra nhiều vị trí lưu token
const login = async (credentials) => {
  try {
    setLoading(true);
    const response = await authAPI.login(credentials);
    console.log('Login Response:', response);
    
    if (response.data && response.data.token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      // Lưu token dưới cả accessToken để tương thích với code cũ
      localStorage.setItem('accessToken', response.data.token);
      console.log('Token đã lưu vào localStorage');
      
      const decodedToken = jwtDecode(response.data.token);
      console.log('Decoded Token:', decodedToken);
      
      // Lưu thông tin người dùng vào state
      setCurrentUser(decodedToken);
      setIsAuthenticated(true);
      return { success: true, user: decodedToken };
    } else {
      console.error('Token không tồn tại trong response:', response.data);
      return { success: false, error: 'Đăng nhập thất bại: Token không hợp lệ' };
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại sau.';
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

// Thêm logging trong hàm checkAuth
const checkAuth = async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  console.log('Checking auth with token:', token ? 'Token exists' : 'No token');
  
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      console.log('Decoded token:', decodedToken);
      
      // Kiểm tra token hết hạn
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log('Token đã hết hạn');
        logout();
        return false;
      }
      
      // Lưu thông tin người dùng vào state
      setCurrentUser(decodedToken);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      logout();
      return false;
    }
  } else {
    setIsAuthenticated(false);
    setCurrentUser(null);
    return false;
  }
};

// Thêm log trong logout
const logout = () => {
  console.log('Logging out - removing tokens and user data');
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  setIsAuthenticated(false);
  setCurrentUser(null);
  console.log('Logout complete');
}; 