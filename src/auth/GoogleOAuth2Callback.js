import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useNotify } from 'react-admin';
import FuturisticBackground from '../components/FuturisticBackground';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../config';

const GoogleOAuth2Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Получаем токен из URL параметров (если backend передает его в query)
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Ошибка авторизации через Google: ' + errorParam);
          setLoading(false);
          return;
        }

        if (token) {
          // Сохраняем токены
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          }

          notify('Успешная авторизация через Google!', { type: 'success' });

          // Получаем сохраненный URL для редиректа
          const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');

          // Перенаправляем пользователя
          setTimeout(() => {
            navigate(redirectUrl);
            window.location.reload(); // Перезагружаем для обновления состояния
          }, 1000);
        } else {
          // Если токен не в query параметрах, значит он уже установлен через HttpOnly cookie
          // или нужно получить его через API
          notify('Успешная авторизация через Google!', { type: 'success' });
          
          const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');
          
          setTimeout(() => {
            navigate(redirectUrl);
            window.location.reload();
          }, 1000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Ошибка при обработке авторизации');
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, notify]);

  if (error) {
    return (
      <FuturisticBackground>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '2em'
        }}>
          <Alert severity="error" sx={{ maxWidth: '600px' }}>
            {error}
          </Alert>
          <Typography 
            onClick={() => navigate('/login')}
            sx={{ 
              marginTop: '2em',
              color: '#6366f1',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Вернуться на страницу входа
          </Typography>
        </Box>
      </FuturisticBackground>
    );
  }

  return (
    <FuturisticBackground>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '2em'
      }}>
        {loading && (
          <>
            <CircularProgress size={60} sx={{ color: '#6366f1', marginBottom: '2em' }} />
            <Typography variant="h5" sx={{ color: '#e5e7eb', marginBottom: '1em' }}>
              Авторизация через Google...
            </Typography>
            <Typography variant="body1" sx={{ color: '#9ca3af' }}>
              Пожалуйста, подождите
            </Typography>
          </>
        )}
      </Box>
    </FuturisticBackground>
  );
};

export default GoogleOAuth2Callback;

