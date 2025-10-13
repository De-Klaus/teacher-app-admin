import React, { useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './App.css';

const LoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login after a short delay
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f1021 0%, #1a1c3c 40%, #0b1026 100%)'
    }}>
      <div className="auth-bg">
        <div className="blob blob--blue" />
        <div className="blob blob--green" />
        <div className="blob blob--purple" />
        <Card className="glass-card" sx={{ width: 460, borderRadius: 4, zIndex: 1 }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: 0.4, color: '#0f172a' }}>
              Smart platform for teachers and students
            </Typography>
            <Typography variant="h6" align="center" sx={{ color: '#6366f1', mt: 2 }}>
              Требуется авторизация
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#6b7280', mt: 1, mb: 3 }}>
              Для доступа к приложению необходимо войти в систему
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={handleLoginClick}
                sx={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                  color: '#0b1026',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                Перейти к авторизации
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};

export default LoginRedirect;
