import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useDataProvider, useNotify } from 'react-admin';
import { useUser } from '../contexts/UserContext';
import FuturisticBackground from '../components/FuturisticBackground';

const TeacherCreatePage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const navigate = useNavigate();
  const { hasRole } = useUser();
  
  const [formData, setFormData] = useState({
    userId: '',
    subject: '',
    timeZone: ''
  });
  
  const [users, setUsers] = useState([]);
  const [timeZones, setTimeZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTimeZones, setLoadingTimeZones] = useState(false);
  const [error, setError] = useState(null);

  // Проверка прав доступа - только для админа
  useEffect(() => {
    if (!hasRole('ADMIN')) {
      notify('Доступ запрещён. Только администраторы могут создавать учителей.', { type: 'error' });
      navigate('/');
      return;
    }
  }, [hasRole, notify, navigate]);

  // Загрузка пользователей с ролью TEACHER без профиля учителя
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await dataProvider.getUsersWithoutTeacher();
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoadingUsers(false);
    }
  }, [dataProvider]);

  // Загрузка часовых поясов
  const loadTimeZones = useCallback(async () => {
    setLoadingTimeZones(true);
    try {
      const response = await dataProvider.getTimeZones();
      setTimeZones(response);
    } catch (error) {
      console.error('Error loading time zones:', error);
      setError('Ошибка загрузки часовых поясов');
    } finally {
      setLoadingTimeZones(false);
    }
  }, [dataProvider]);

  useEffect(() => {
    loadUsers();
    loadTimeZones();
  }, [loadUsers, loadTimeZones]);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUserSelect = (event) => {
    const userId = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      userId: userId
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.userId) {
      setError('Пожалуйста, выберите пользователя');
      return;
    }
    
    if (!formData.subject || !formData.timeZone) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Серверная логика уже исключает пользователей с существующим Teacher

    setLoading(true);
    setError(null);

    try {
      await dataProvider.create('teachers', {
        data: {
          userId: formData.userId,
          subject: formData.subject,
          timeZone: formData.timeZone
        }
      });

      notify('Учитель успешно создан!', { type: 'success' });
      navigate('/teachers');
    } catch (error) {
      console.error('Error creating teacher:', error);
      setError('Ошибка создания учителя. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  // Если пользователь не админ, не показываем страницу
  if (!hasRole('ADMIN')) {
    return null;
  }

  return (
    <FuturisticBackground>
      <Box sx={{ padding: '2em', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ marginBottom: '2em' }}>
          <Typography variant="h4" sx={{ 
            color: '#e5e7eb', 
            fontWeight: 700,
            marginBottom: '1em',
            textAlign: 'center'
          }}>
            👨‍🏫 Создание учителя
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#9ca3af', 
            textAlign: 'center',
            marginBottom: '2em'
          }}>
            Выберите пользователя с ролью TEACHER и укажите предмет и часовой пояс
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

                {!loadingUsers && users.length === 0 && (
                  <Alert severity="info" sx={{ marginBottom: '1em' }}>
                    Нет пользователей с ролью TEACHER без профиля учителя. 
                    Для создания нового учителя сначала зарегистрируйте нового пользователя с ролью TEACHER.
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Выбор пользователя */}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#e5e7eb' }}>
                          {loadingUsers ? 'Загрузка пользователей...' : 'Выберите пользователя'}
                        </InputLabel>
                        <Select
                          value={formData.userId || ''}
                          onChange={handleUserSelect}
                          disabled={loadingUsers}
                          sx={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.12) 100%)',
                            borderRadius: '12px',
                            color: '#e5e7eb',
                            backdropFilter: 'blur(8px)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.25)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(99, 102, 241, 0.6)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(99, 102, 241, 0.8)',
                              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
                            },
                            '& .MuiSelect-select': {
                              background: 'transparent',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                background: 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.95) 100%)',
                                border: '1px solid rgba(99,102,241,0.35)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                                backdropFilter: 'blur(8px)',
                                color: '#e5e7eb',
                              }
                            }
                          }}
                        >
                          {loadingUsers ? (
                            <MenuItem key="loading" disabled sx={{ color: '#9ca3af' }}>
                              <CircularProgress size={20} sx={{ marginRight: 1 }} />
                              Загрузка пользователей...
                            </MenuItem>
                          ) : users.length === 0 ? (
                            <MenuItem key="no-users" disabled sx={{ color: '#9ca3af' }}>
                              Нет пользователей с ролью TEACHER без профиля учителя
                            </MenuItem>
                          ) : (
                            users.map((user) => (
                                <MenuItem
                                  key={user.userId}
                                  value={user.userId}
                                  sx={{
                                    color: '#e5e7eb',
                                    '&:hover': {
                                      background: 'rgba(99,102,241,0.18)'
                                    },
                                    '&.Mui-selected': {
                                      background: 'rgba(16,185,129,0.25) !important',
                                      color: '#e5e7eb'
                                    }
                                  }}
                                >
                                  {user.firstName} {user.lastName} ({user.email})
                                </MenuItem>
                              ))
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Предмет */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Предмет *"
                        value={formData.subject || ''}
                        onChange={handleInputChange('subject')}
                        fullWidth
                        required
                        placeholder="Например: Математика, Физика, Английский язык"
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

                    {/* Часовой пояс */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel sx={{ color: '#e5e7eb' }}>
                          {loadingTimeZones ? 'Загрузка часовых поясов...' : 'Часовой пояс *'}
                        </InputLabel>
                        <Select
                          value={formData.timeZone || ''}
                          onChange={handleInputChange('timeZone')}
                          disabled={loadingTimeZones}
                          sx={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.12) 100%)',
                            borderRadius: '12px',
                            color: '#e5e7eb',
                            backdropFilter: 'blur(8px)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.25)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(99, 102, 241, 0.5)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(99, 102, 241, 0.6)',
                              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                            },
                            '& .MuiSelect-select': {
                              background: 'transparent',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                background: 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.95) 100%)',
                                border: '1px solid rgba(99,102,241,0.35)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                                backdropFilter: 'blur(8px)',
                                color: '#e5e7eb',
                              }
                            }
                          }}
                        >
                          {loadingTimeZones ? (
                            <MenuItem key="loading-tz" disabled sx={{ color: '#9ca3af' }}>
                              <CircularProgress size={20} sx={{ marginRight: 1 }} />
                              Загрузка часовых поясов...
                            </MenuItem>
                          ) : timeZones.length === 0 ? (
                            <MenuItem key="no-timezones" disabled sx={{ color: '#9ca3af' }}>
                              Нет доступных часовых поясов
                            </MenuItem>
                          ) : (
                            timeZones.map((timeZone) => (
                              <MenuItem
                                key={timeZone.value}
                                value={timeZone.value}
                                sx={{
                                  color: '#e5e7eb',
                                  '&:hover': {
                                    background: 'rgba(99,102,241,0.18)'
                                  },
                                  '&.Mui-selected': {
                                    background: 'rgba(16,185,129,0.25) !important',
                                    color: '#e5e7eb'
                                  }
                                }}
                              >
                                {timeZone.label}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Кнопки */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          onClick={() => navigate('/teachers')}
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
                              Создание...
                            </>
                          ) : (
                            '👨‍🏫 Создать учителя'
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

export default TeacherCreatePage;
