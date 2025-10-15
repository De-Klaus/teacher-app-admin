import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Edit,
  School,
  Person,
  LocationOn,
  Phone,
} from '@mui/icons-material';
import { useDataProvider, useNotify } from 'react-admin';
import { useAuth } from '../AuthContext';
import FuturisticBackground from '../components/FuturisticBackground';

const StudentCreatePage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    city: '',
    timeZone: 'UTC+3',
    grade: 1,
    school: '',
    teacherId: '',
    birthDate: '',
  });

  // Function to decode JWT token and get current teacher ID
  const getCurrentTeacherId = useCallback(() => {
    if (!user?.token) return null;
    try {
      const parts = user.token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);
      console.log('JWT payload:', payload);
      // Assuming the teacher ID is in the payload, adjust field name as needed
      return payload.teacherId || payload.id || payload.userId || null;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        dataProvider.getList('students', { pagination: { page: 1, perPage: 100 } }),
        dataProvider.getList('teachers', { pagination: { page: 1, perPage: 100 } })
      ]);
      
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
      
      // Get current teacher ID from JWT token
      const teacherId = getCurrentTeacherId();
      if (teacherId) {
        setCurrentTeacherId(teacherId);
        console.log('Current teacher ID:', teacherId);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      notify('Ошибка загрузки данных', { type: 'error' });
    }
  }, [dataProvider, notify, getCurrentTeacherId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateStudent = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      city: '',
      timeZone: 'UTC+3',
      grade: 1,
      school: '',
      teacherId: currentTeacherId || '',
      birthDate: '',
    });
    setDialogOpen(true);
  };

  const handleSaveStudent = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      notify('Введите имя и фамилию ученика', { type: 'warning' });
      return;
    }
    if (!formData.teacherId) {
      notify('Выберите учителя', { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await dataProvider.create('students', {
        data: {
          ...formData,
          userId: Math.random().toString(36).substr(2, 9), // Generate temporary userId
        }
      });
      notify('Ученик создан', { type: 'success' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      notify('Ошибка создания ученика', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      city: '',
      timeZone: 'UTC+3',
      grade: 1,
      school: '',
      teacherId: '',
      birthDate: '',
    });
    setDialogOpen(false);
  };

  const commonTextFieldStyles = {
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
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(99, 102, 241, 0.6)',
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
    },
  };

  const commonSelectStyles = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#e5e7eb',
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
  };

  const getGradeColor = (grade) => {
    if (grade <= 4) return 'success';
    if (grade <= 8) return 'warning';
    return 'error';
  };


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
            👥 Управление учениками
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Students List */}
          <Grid item xs={12} md={8}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
                  <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 700 }}>
                    📚 Список учеников
                  </Typography>
                  <Button
                    onClick={handleCreateStudent}
                    variant="contained"
                    startIcon={<Add />}
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
                    ✨ Новый ученик
                  </Button>
                </Box>
                
                <List>
                  {students.map((student, index) => (
                    <React.Fragment key={student.id}>
                      <ListItem sx={{ 
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        margin: '8px 0',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.1)',
                        }
                      }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                            color: '#0b1026'
                          }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                                {student.firstName} {student.lastName}
                              </Typography>
                              <Chip
                                label={`${student.grade} класс`}
                                color={getGradeColor(student.grade)}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <School fontSize="small" sx={{ color: '#9ca3af' }} />
                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                  {student.school || 'Школа не указана'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOn fontSize="small" sx={{ color: '#9ca3af' }} />
                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                  {student.city || 'Город не указан'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Phone fontSize="small" sx={{ color: '#9ca3af' }} />
                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                  {student.phoneNumber || 'Телефон не указан'}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          primaryTypographyProps={{ component: 'span' }}
                          secondaryTypographyProps={{ component: 'span' }}
                        />
                        <Box>
                          <IconButton
                            sx={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#10b981',
                              margin: '0 4px',
                              '&:hover': {
                                background: 'rgba(16, 185, 129, 0.3)',
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < students.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 700, marginBottom: '1em' }}>
                  📊 Статистика
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Всего учеников:</Typography>
                    <Typography sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                      {students.length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Начальная школа:</Typography>
                    <Typography sx={{ color: '#10b981', fontWeight: 600 }}>
                      {students.filter(s => s.grade <= 4).length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Средняя школа:</Typography>
                    <Typography sx={{ color: '#f59e0b', fontWeight: 600 }}>
                      {students.filter(s => s.grade > 4 && s.grade <= 8).length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Старшая школа:</Typography>
                    <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>
                      {students.filter(s => s.grade > 8).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Create Student Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }
          }}
        >
          <DialogTitle sx={{ 
            color: '#e5e7eb', 
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            ✨ Создать нового ученика
            {currentTeacherId && (
              <Typography variant="body2" sx={{ 
                color: '#10b981', 
                fontWeight: 400, 
                marginTop: '0.5em',
                fontSize: '0.9em'
              }}>
                Ученик будет автоматически назначен текущему учителю
              </Typography>
            )}
          </DialogTitle>
          
          <DialogContent sx={{ padding: '2em' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Имя"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  fullWidth
                  required
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Фамилия"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  fullWidth
                  required
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Телефон"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  fullWidth
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Город"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  fullWidth
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#e5e7eb' }}>
                    {currentTeacherId ? 'Учитель (текущий)' : 'Учитель'}
                  </InputLabel>
                  <Select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    sx={commonSelectStyles}
                  >
                    {teachers.map((teacher) => (
                      <MenuItem 
                        key={teacher.id} 
                        value={teacher.id} 
                        sx={{ 
                          color: '#e5e7eb',
                          background: teacher.id === currentTeacherId ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                          '&:hover': {
                            background: teacher.id === currentTeacherId ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.1)',
                          }
                        }}
                      >
                        {teacher.firstName} {teacher.lastName}
                        {teacher.id === currentTeacherId && ' (текущий)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Класс"
                  type="number"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) || 1 })}
                  fullWidth
                  inputProps={{ min: 1, max: 11 }}
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Школа"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  fullWidth
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Дата рождения"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#e5e7eb' }}>Часовой пояс</InputLabel>
                  <Select
                    value={formData.timeZone}
                    onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                    sx={commonSelectStyles}
                  >
                    <MenuItem value="UTC+3" sx={{ color: '#e5e7eb' }}>UTC+3 (Москва)</MenuItem>
                    <MenuItem value="UTC+5" sx={{ color: '#e5e7eb' }}>UTC+5 (Екатеринбург)</MenuItem>
                    <MenuItem value="UTC+7" sx={{ color: '#e5e7eb' }}>UTC+7 (Красноярск)</MenuItem>
                    <MenuItem value="UTC+8" sx={{ color: '#e5e7eb' }}>UTC+8 (Иркутск)</MenuItem>
                    <MenuItem value="UTC+9" sx={{ color: '#e5e7eb' }}>UTC+9 (Якутск)</MenuItem>
                    <MenuItem value="UTC+10" sx={{ color: '#e5e7eb' }}>UTC+10 (Владивосток)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            padding: '1em 2em',
            background: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Button 
              onClick={handleSaveStudent} 
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
                  opacity: 0.6,
                  transform: 'none',
                }
              }}
            >
              {loading ? 'Создание...' : '✨ Создать ученика'}
            </Button>
            <Button 
              onClick={handleClose} 
              variant="outlined"
              disabled={loading}
              sx={{
                color: '#e5e7eb',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.2)',
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                },
                '&:disabled': {
                  opacity: 0.6,
                }
              }}
            >
              Отмена
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FuturisticBackground>
  );
};

export default StudentCreatePage;
