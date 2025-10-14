import React, { createContext, useContext, useState } from 'react';
import { authService } from './authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = authService.getToken();
  const initialUser = token && authService.isTokenValid(token) ? { token } : null;
  if (!initialUser && token) {
    authService.removeToken();
  }
  const [user, setUser] = useState(initialUser);
  const [loading] = useState(false);

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
