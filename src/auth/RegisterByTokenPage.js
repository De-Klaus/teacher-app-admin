import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNotify } from 'react-admin';
import FuturisticBackground from '../components/FuturisticBackground';
import { API_URL } from '../config';

const RegisterByTokenPage = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);

  // Получаем токен из URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setTokenValid(true); // Сразу считаем токен валидным
    } else {
      setError('Токен регистрации не найден в URL');
    }
  }, [searchParams]);


  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Валидация
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Отправляем данные регистрации на бэкенд
      const response = await fetch(`${API_URL}/users/register-by-token?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Сохраняем токены в localStorage
        if (data.accessToken) {
          localStorage.setItem('authToken', data.accessToken);
        }
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        setSuccess(true);
        notify('Регистрация успешно завершена!', { type: 'success' });
        
        // Перенаправляем на главную страницу через 2 секунды
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else if (response.status === 401) {
        setError('Недействительный или истекший токен регистрации');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка регистрации. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError('Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };


  // Показываем ошибку, если токен недействителен
  if (!tokenValid) {
    return (
      <FuturisticBackground>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          padding: '2em'
        }}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            padding: '2em',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <Typography variant="h4" sx={{ color: '#ef4444', marginBottom: '1em' }}>
              ❌ Ошибка регистрации
            </Typography>
            <Typography variant="body1" sx={{ color: '#e5e7eb', marginBottom: '2em' }}>
              {error || 'Недействительный токен регистрации'}
            </Typography>
            <Button
              onClick={() => navigate('/')}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                color: '#0b1026',
                fontWeight: 700,
                borderRadius: '12px',
                '&:hover': {
                  transform: 'translateY(-1px) scale(1.01)',
                  filter: 'brightness(1.05)',
                },
              }}
            >
              Вернуться на главную
            </Button>
          </Card>
        </Box>
      </FuturisticBackground>
    );
  }

  // Показываем успех
  if (success) {
    return (
      <FuturisticBackground>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          padding: '2em'
        }}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            padding: '2em',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <Typography variant="h4" sx={{ color: '#10b981', marginBottom: '1em' }}>
              ✅ Регистрация успешна!
            </Typography>
            <Typography variant="body1" sx={{ color: '#e5e7eb', marginBottom: '2em' }}>
              Ваш аккаунт успешно создан. Вы будете перенаправлены на главную страницу.
            </Typography>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Card>
        </Box>
      </FuturisticBackground>
    );
  }

  return (
    <FuturisticBackground>
      <Box sx={{ padding: '2em', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ marginBottom: '2em', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ 
            color: '#e5e7eb', 
            fontWeight: 700,
            marginBottom: '1em'
          }}>
            🎓 Регистрация студента
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#9ca3af',
            marginBottom: '2em'
          }}>
            Завершите регистрацию, заполнив форму ниже
          </Typography>
        </Box>

        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
              <CardContent sx={{ padding: '2em' }}>
                {error && (
                  <Alert severity="error" sx={{ marginBottom: '1em' }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Имя */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Имя *"
                        value={formData.firstName}
                        onChange={handleInputChange('firstName')}
                        fullWidth
                        required
                        sx={{
                          '& .MuiInputBase-root': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#e5e7eb',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#e5e7eb',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.6)',
                            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                          },
                        }}
                      />
                    </Grid>

                    {/* Фамилия */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Фамилия *"
                        value={formData.lastName}
                        onChange={handleInputChange('lastName')}
                        fullWidth
                        required
                        sx={{
                          '& .MuiInputBase-root': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#e5e7eb',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#e5e7eb',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.6)',
                            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                          },
                        }}
                      />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12}>
                      <TextField
                        label="Email *"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        fullWidth
                        required
                        sx={{
                          '& .MuiInputBase-root': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#e5e7eb',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#e5e7eb',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.6)',
                            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                          },
                        }}
                      />
                    </Grid>

                    {/* Пароль */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Пароль *"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        fullWidth
                        required
                        sx={{
                          '& .MuiInputBase-root': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#e5e7eb',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#e5e7eb',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.6)',
                            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                          },
                        }}
                      />
                    </Grid>

                    {/* Подтверждение пароля */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Подтвердите пароль *"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        fullWidth
                        required
                        sx={{
                          '& .MuiInputBase-root': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#e5e7eb',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#e5e7eb',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(99, 102, 241, 0.6)',
                            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                          },
                        }}
                      />
                    </Grid>

                    {/* Кнопки */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          onClick={() => navigate('/')}
                          variant="outlined"
                          sx={{
                            color: '#e5e7eb',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '12px',
                            '&:hover': {
                              background: 'rgba(99, 102, 241, 0.2)',
                              borderColor: 'rgba(99, 102, 241, 0.5)',
                            },
                          }}
                        >
                          Отмена
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                            color: '#0b1026',
                            fontWeight: 700,
                            borderRadius: '12px',
                            '&:hover': {
                              transform: 'translateY(-1px) scale(1.01)',
                              filter: 'brightness(1.05)',
                            },
                            '&:disabled': {
                              background: 'rgba(107, 114, 128, 0.3)',
                              color: '#6b7280',
                            },
                          }}
                        >
                          {loading ? (
                            <>
                              <CircularProgress size={20} sx={{ marginRight: 1 }} />
                              Регистрация...
                            </>
                          ) : (
                            '🎓 Зарегистрироваться'
                          )}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </FuturisticBackground>
  );
};

export default RegisterByTokenPage;
