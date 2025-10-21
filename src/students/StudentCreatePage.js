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
  Link,
  ContentCopy,
} from '@mui/icons-material';
import { useDataProvider, useNotify } from 'react-admin';
import { useCurrentEntity } from '../hooks/useCurrentEntity';
import FuturisticBackground from '../components/FuturisticBackground';

const StudentCreatePage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { 
    getCurrentTeacherId, 
    canCreateStudents
  } = useCurrentEntity();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claimTokenDialog, setClaimTokenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [claimTokenData, setClaimTokenData] = useState(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    phoneNumber: '',
    city: '',
    timeZone: 'UTC+3',
    grade: 1,
    school: '',
    teacherId: '',
    startDate: '',
    endDate: '',
    agreedRate: ''
  });




  const loadData = useCallback(async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        dataProvider.getList('students', { pagination: { page: 1, perPage: 100 } }),
        dataProvider.getList('teachers', { pagination: { page: 1, perPage: 100 } })
      ]);
      
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
      
      // Load statuses using dataProvider method (same pattern as lesson statuses)
      try {
        const statusesData = await dataProvider.getAllStudentStatuses();
        setStatuses(statusesData);
        console.log('📊 Loaded student statuses from backend:', statusesData);
        console.log('🌐 Backend URL: GET /student-statuses');
      } catch (statusError) {
        console.warn('Error loading student statuses, using fallback:', statusError);
        // Fallback to hardcoded statuses if API fails
        setStatuses([
          { name: 'CREATED_BY_SYSTEM', text: 'Создан админом или учителем', color: 'primary' },
          { name: 'REGISTERED', text: 'Пользователь привязался', color: 'warning' },
          { name: 'ACTIVE', text: 'Участвует в занятиях', color: 'success' },
          { name: 'INACTIVE', text: 'Неактивен', color: 'danger' }
        ]);
      }
      
      // Get current teacher ID from context
      const teacherId = getCurrentTeacherId();
      if (teacherId) {
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
    const currentTeacherId = getCurrentTeacherId();
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '',
      phoneNumber: '',
      city: '',
      timeZone: 'UTC+3',
      grade: 1,
      school: '',
      teacherId: currentTeacherId || '',
      startDate: today,
      endDate: '',
      agreedRate: ''
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
    
    // Validate teacherId is a valid number
    const teacherIdNum = parseInt(formData.teacherId);
    if (isNaN(teacherIdNum) || teacherIdNum <= 0) {
      notify('Некорректный ID учителя', { type: 'warning' });
      return;
    }
    if (!formData.startDate) {
      notify('Введите дату начала обучения', { type: 'warning' });
      return;
    }
    if (!formData.agreedRate || parseFloat(formData.agreedRate) <= 0) {
      notify('Введите корректную ставку оплаты', { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Prepare data according to StudentTeacherSystemRequestDto structure
      const requestData = {
        teacherId: teacherIdNum, // Use validated teacherId
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        agreedRate: parseFloat(formData.agreedRate),
        student: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate || null,
          phoneNumber: formData.phoneNumber || null,
          city: formData.city || null,
          timeZone: formData.timeZone,
          grade: formData.grade,
          school: formData.school || null
        }
      };

      console.log('🔄 Creating student via POST /student-teachers/by-system');
      console.log('📤 Data being sent:', requestData);
      console.log('🌐 Backend URL: POST /student-teachers/by-system');
      console.log('🔍 Teacher ID type:', typeof requestData.teacherId, 'Value:', requestData.teacherId);
      console.log('🔍 Form teacherId:', formData.teacherId);

      await dataProvider.create('student-teachers/by-system', {
        data: requestData
      });
      notify('Ученик и связь с учителем созданы', { type: 'success' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating student:', error);
      notify('Ошибка создания ученика', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '',
      phoneNumber: '',
      city: '',
      timeZone: 'UTC+3',
      grade: 1,
      school: '',
      teacherId: '',
      startDate: '',
      endDate: '',
      agreedRate: ''
    });
    setDialogOpen(false);
  };

  const handleGenerateClaimToken = async (student) => {
    setSelectedStudent(student);
    setGeneratingToken(true);
    try {
      console.log('🔄 Generating claim token for student:', student.id);
      console.log('🌐 Backend URL: POST /students/' + student.id + '/claim-token');
      
      const response = await dataProvider.create(`students/${student.id}/claim-token`, {
        data: {}
      });
      
      setClaimTokenData(response.data);
      setClaimTokenDialog(true);
      notify('Токен для регистрации создан', { type: 'success' });
    } catch (error) {
      console.error('Error generating claim token:', error);
      notify('Ошибка создания токена регистрации', { type: 'error' });
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCloseClaimTokenDialog = () => {
    setClaimTokenDialog(false);
    setSelectedStudent(null);
    setClaimTokenData(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      notify('Ссылка скопирована в буфер обмена', { type: 'success' });
    }).catch(() => {
      notify('Ошибка копирования ссылки', { type: 'error' });
    });
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
  };

  const commonMenuProps = {
    PaperProps: {
      sx: {
        background: 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        border: '1px solid rgba(99,102,241,0.35)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(8px)',
        color: '#e5e7eb',
      }
    }
  };

  const getGradeColor = (grade) => {
    if (grade <= 4) return 'success';
    if (grade <= 8) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.name === status);
    if (statusObj) {
      // Map backend color to Material-UI color
      switch (statusObj.color) {
        case 'primary': return 'primary';
        case 'warning': return 'warning';
        case 'success': return 'success';
        case 'danger': return 'error';
        default: return 'default';
      }
    }
    return 'default';
  };

  const getStatusLabel = (status) => {
    const statusObj = statuses.find(s => s.name === status);
    return statusObj ? statusObj.text : status;
  };


  // Check if user has permission to access this page
  if (!canCreateStudents()) {
    return (
      <FuturisticBackground>
        <Box sx={{ padding: '2em', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ 
            color: '#e5e7eb', 
            fontWeight: 700,
            marginBottom: '1em'
          }}>
            🚫 Доступ запрещён
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#9ca3af', 
            fontWeight: 400
          }}>
            У вас нет прав для управления учениками
          </Typography>
        </Box>
      </FuturisticBackground>
    );
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                                {student.firstName} {student.lastName}
                              </Typography>
                              <Chip
                                label={`${student.grade} класс`}
                                color={getGradeColor(student.grade)}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                              {student.status && (
                                <Chip
                                  label={getStatusLabel(student.status)}
                                  color={getStatusColor(student.status)}
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            sx={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#10b981',
                              '&:hover': {
                                background: 'rgba(16, 185, 129, 0.3)',
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <Edit />
                          </IconButton>
                          {student.status === 'CREATED_BY_SYSTEM' && (
                            <IconButton
                              onClick={() => handleGenerateClaimToken(student)}
                              disabled={generatingToken}
                              sx={{
                                background: 'rgba(99, 102, 241, 0.2)',
                                color: '#6366f1',
                                '&:hover': {
                                  background: 'rgba(99, 102, 241, 0.3)',
                                  transform: 'scale(1.1)',
                                },
                                '&:disabled': {
                                  opacity: 0.6,
                                  transform: 'none',
                                }
                              }}
                              title="Создать ссылку для регистрации"
                            >
                              <Link />
                            </IconButton>
                          )}
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
            ✨ Создать ученика и назначить учителя
            {getCurrentTeacherId() && (
              <Typography variant="body2" sx={{ 
                color: '#10b981', 
                fontWeight: 400, 
                marginTop: '0.5em',
                fontSize: '0.9em'
              }}>
                Ученик будет автоматически назначен текущему учителю с указанной ставкой
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
                  label="Дата начала обучения"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
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
                    {getCurrentTeacherId() ? 'Учитель (текущий)' : 'Учитель'}
                  </InputLabel>
                  <Select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    sx={commonSelectStyles}
                    MenuProps={commonMenuProps}
                  >
                    {teachers.map((teacher) => {
                      const currentTeacherId = getCurrentTeacherId();
                      return (
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
                      );
                    })}
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
                  label="Дата окончания обучения (опционально)"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={commonTextFieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ставка оплаты (руб/час)"
                  type="number"
                  value={formData.agreedRate}
                  onChange={(e) => setFormData({ ...formData, agreedRate: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
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
                    MenuProps={commonMenuProps}
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
              {loading ? 'Создание...' : '✨ Создать ученика и назначить учителя'}
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

        {/* Claim Token Dialog */}
        <Dialog 
          open={claimTokenDialog} 
          onClose={handleCloseClaimTokenDialog}
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
            🔗 Ссылка для регистрации ученика
            {selectedStudent && (
              <Typography variant="body2" sx={{ 
                color: '#10b981', 
                fontWeight: 400, 
                marginTop: '0.5em',
                fontSize: '0.9em'
              }}>
                {selectedStudent.firstName} {selectedStudent.lastName}
              </Typography>
            )}
          </DialogTitle>
          
          <DialogContent sx={{ padding: '2em' }}>
            {claimTokenData && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                  📋 Информация о токене
                </Typography>
                
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1em',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af', marginBottom: '0.5em' }}>
                    ID ученика:
                  </Typography>
                  <Typography sx={{ color: '#e5e7eb', fontWeight: 600, marginBottom: '1em' }}>
                    {claimTokenData.studentId}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#9ca3af', marginBottom: '0.5em' }}>
                    Токен:
                  </Typography>
                  <Typography sx={{ 
                    color: '#e5e7eb', 
                    fontWeight: 600, 
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    wordBreak: 'break-all',
                    marginBottom: '1em'
                  }}>
                    {claimTokenData.claimToken}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#9ca3af', marginBottom: '0.5em' }}>
                    Действует до:
                  </Typography>
                  <Typography sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                    {new Date(claimTokenData.expiresAt).toLocaleString('ru-RU')}
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 600, marginTop: '1em' }}>
                  🔗 Ссылка для регистрации
                </Typography>
                
                <Box sx={{ 
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '12px',
                  padding: '1em',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af', marginBottom: '0.5em' }}>
                    Отправьте эту ссылку ученику для регистрации:
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '0.5em',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Typography sx={{ 
                      color: '#e5e7eb', 
                      fontFamily: 'monospace',
                      fontSize: '0.9em',
                      flex: 1,
                      wordBreak: 'break-all'
                    }}>
                      {`${window.location.origin}/register?token=${claimTokenData.claimToken}`}
                    </Typography>
                    <IconButton
                      onClick={() => copyToClipboard(`${window.location.origin}/register?token=${claimTokenData.claimToken}`)}
                      sx={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#6366f1',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.3)',
                        }
                      }}
                      title="Копировать ссылку"
                    >
                      <ContentCopy />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ 
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  padding: '1em',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                    ✅ Инструкция для ученика:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#e5e7eb', marginTop: '0.5em' }}>
                    1. Перейдите по ссылке выше<br/>
                    2. Заполните форму регистрации<br/>
                    3. Создайте пароль для входа<br/>
                    4. После регистрации статус изменится на "Пользователь привязался"
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            padding: '1em 2em',
            background: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Button 
              onClick={handleCloseClaimTokenDialog} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                color: '#0b1026',
                fontWeight: 700,
                borderRadius: '12px',
                '&:hover': {
                  transform: 'translateY(-1px) scale(1.01)',
                  filter: 'brightness(1.05)',
                }
              }}
            >
              ✨ Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FuturisticBackground>
  );
};

export default StudentCreatePage;
