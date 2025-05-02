import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Phân tích JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const payload = JSON.parse(jsonPayload);
        const currentTime = Math.floor(Date.now() / 1000);

        // Kiểm tra token hết hạn
        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem('accessToken');
          setIsAuthenticated(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Kiểm tra quyền ADMIN
        const hasAdminScope = payload.scope && payload.scope.includes('ADMIN');
        setIsAuthenticated(true);
        setIsAdmin(hasAdminScope);
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    // Redirect to login with return URL
    return <Navigate to="/admin/login" state={{ from: location }} />;
  }

  return children;
};

export default AuthGuard; 