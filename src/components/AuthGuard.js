import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AUTH_TOKEN_KEY } from '../config';

const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Проверяем валидность токена
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isTokenValid = payload.exp * 1000 > Date.now();
        
        if (isTokenValid) {
          setIsAuthenticated(true);
        } else {
          // Токен истек, очищаем localStorage
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem('auth_refresh_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Невалидный токен, очищаем localStorage
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('auth_refresh_token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Показываем загрузку во время проверки авторизации
  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0f1021 0%, #1a1c3c 40%, #0b1026 100%)'
      }}>
        <CircularProgress sx={{ color: '#6366f1', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#e5e7eb' }}>
          Проверка авторизации...
        </Typography>
      </Box>
    );
  }

  // Если не авторизован, редиректим на /login
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  // Если авторизован, показываем содержимое
  return children;
};

export default AuthGuard;
