import React from 'react';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { API_URL } from '../config';

const GoogleLoginButton = ({ onSuccess, sx }) => {
  const handleGoogleLogin = () => {
    // Сохраняем текущий URL для редиректа после авторизации
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    // Перенаправляем на Google OAuth2 через Spring Security
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  return (
    <Button
      variant="contained"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      sx={{
        background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
        color: 'white',
        fontWeight: 700,
        borderRadius: '12px',
        padding: '12px 24px',
        textTransform: 'none',
        fontSize: '16px',
        '&:hover': {
          background: 'linear-gradient(135deg, #3367d6 0%, #2d8e47 100%)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(66, 133, 244, 0.3)',
        },
        transition: 'all 0.3s ease',
        ...sx
      }}
    >
      Войти через Google
    </Button>
  );
};

export default GoogleLoginButton;

