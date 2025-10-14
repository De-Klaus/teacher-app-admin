import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from './authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token && authService.isTokenValid(token)) {
      setUser({ token });
    } else {
      authService.removeToken();
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    authService.setToken(token);
    setUser({ token });
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


