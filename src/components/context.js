import React, { createContext, useState, useContext} from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

// 1. Create Auth Context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const api_url = process.env.REACT_APP_API_URL;

  const [token, setToken] = useState(() => {
    // Initialize from localStorage or null
    const stored = localStorage.getItem('token');
    //return stored ? JSON.parse(stored) : null;
    return stored ? stored : null;
  });

  const login = (userToken) => {
    // localStorage.setItem('token', JSON.stringify(userToken));
    localStorage.setItem('token', userToken);
    setToken(userToken);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  // // Redirect to dashboard if user is authenticated (token is present)
  // useEffect(() => {
  //     if (token) {
  //       navigate('/dashboard');
  //     }
  //   }, [token, navigate]);
  

  return (
    <AuthContext.Provider value={{ api_url, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// // 2. Custom hook for consuming auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// 3. Logout Button Component
export const LogoutButton = () => {
  // const { logout } = useAuth();
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
  // const { token } = useAuth();
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
