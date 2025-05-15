import React, { createContext, useState, useContext, useEffect} from 'react';
import { useNavigate, Navigate, useLocation} from 'react-router-dom';
import { message } from 'antd';

// 1. Create Auth Context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();

  const [token, setToken] = useState(() => {
    try {
      const stored = localStorage.getItem('token');
      // return stored ? stored : null;
      return stored || null;
    } catch (error) {
      console.error('Token 获取失败', error);
      message.error('登陆状态获取失败');
      return null;
    }
  });

  const login = (userToken) => {
    try {
      localStorage.setItem('token', userToken);
      setToken(userToken);
      navigate('/dashboard');
    } catch (error) {
      console.error('Token 保存失败', error);
      message.error('登陆状态保存失败');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Logout Button Component
export const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  return (
    <button
      onClick={logout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
};

// 4. ProtectedRoute Component
export const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  // 获取当前路径
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      console.log('No token found, redirecting to login');
    }
  }, [token]);

  if (!token) {
    // redirect to login page and to the current path
    return <Navigate to="/login" state={{ from: location }} replace/>;
  }
  return children;
};

// // 2. Custom hook for consuming auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };