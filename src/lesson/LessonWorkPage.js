import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Add,
  Edit,
  School,
  Person,
  Schedule,
  AttachMoney,
} from '@mui/icons-material';
import { useDataProvider, useNotify } from 'react-admin';
import FuturisticBackground from '../components/FuturisticBackground';

const LessonWorkPage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    studentId: '',
    teacherId: '',
    duration: 60,
    price: 0,
    status: 'PLANNED',
    homework: '',
    feedback: ''
  });

  const loadData = useCallback(async () => {
    try {
      const [lessonsRes, studentsRes, teachersRes] = await Promise.all([
        dataProvider.getList('lessons', { pagination: { page: 1, perPage: 100 } }),
        dataProvider.getList('students', { pagination: { page: 1, perPage: 100 } }),
        dataProvider.getList('teachers', { pagination: { page: 1, perPage: 100 } })
      ]);
      
      setLessons(lessonsRes.data);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      notify('Ошибка загрузки данных', { type: 'error' });
    }
  }, [dataProvider, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PLANNED': return 'Запланирован';
      case 'COMPLETED': return 'Проведён';
      case 'CANCELLED': return 'Отменён';
      default: return status;
    }
  };

  const handleStartLesson = (lesson) => {
    setCurrentLesson(lesson);
    setIsTimerRunning(true);
    setTimerSeconds(0);
    notify('Урок начат', { type: 'success' });
  };

  const handlePauseLesson = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleStopLesson = () => {
    setIsTimerRunning(false);
    setCurrentLesson(null);
    setTimerSeconds(0);
    notify('Урок завершён', { type: 'success' });
  };

  const handleCreateLesson = () => {
    setFormData({
      topic: '',
      studentId: '',
      teacherId: '',
      duration: 60,
      price: 0,
      status: 'PLANNED',
      homework: '',
      feedback: ''
    });
    setDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    try {
      await dataProvider.create('lessons', {
        data: {
          ...formData,
          scheduledAt: new Date().toISOString(),
        }
      });
      notify('Урок создан', { type: 'success' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      notify('Ошибка создания урока', { type: 'error' });
    }
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
            🎓 Работа с уроками
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Current Lesson Timer */}
          {currentLesson && (
            <Grid item xs={12}>
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
                    🎯 Текущий урок
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ 
                        color: '#6366f1', 
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}>
                        {formatTime(timerSeconds)}
                      </Typography>
                      <Typography sx={{ color: '#e5e7eb' }}>
                        {currentLesson.topic || 'Урок'}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        onClick={handlePauseLesson}
                        sx={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                          color: '#0b1026',
                          margin: '0 8px',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        {isTimerRunning ? <Pause /> : <PlayArrow />}
                      </IconButton>
                      <IconButton
                        onClick={handleStopLesson}
                        sx={{
                          background: 'rgba(239, 68, 68, 0.8)',
                          color: 'white',
                          '&:hover': {
                            background: 'rgba(239, 68, 68, 1)',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Stop />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Lessons List */}
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
                    📚 Список уроков
                  </Typography>
                  <Button
                    onClick={handleCreateLesson}
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
                    ✨ Новый урок
                  </Button>
                </Box>
                
                <List>
                  {lessons.map((lesson, index) => (
                    <React.Fragment key={lesson.id}>
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
                            <School />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                                {lesson.topic || `Урок ${lesson.id}`}
                              </Typography>
                              <Chip
                                label={getStatusText(lesson.status)}
                                color={getStatusColor(lesson.status)}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Person fontSize="small" sx={{ color: '#9ca3af' }} />
                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                  {students.find(s => s.id === lesson.studentId)?.firstName || 'Ученик'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Schedule fontSize="small" sx={{ color: '#9ca3af' }} />
                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                  {lesson.durationMinutes} мин
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AttachMoney fontSize="small" sx={{ color: '#9ca3af' }} />
                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                  {lesson.price} ₽
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <Box>
                          <IconButton
                            onClick={() => handleStartLesson(lesson)}
                            disabled={lesson.status !== 'PLANNED'}
                            sx={{
                              background: 'rgba(99, 102, 241, 0.2)',
                              color: '#6366f1',
                              margin: '0 4px',
                              '&:hover': {
                                background: 'rgba(99, 102, 241, 0.3)',
                                transform: 'scale(1.1)',
                              },
                              '&:disabled': {
                                background: 'rgba(107, 114, 128, 0.2)',
                                color: '#6b7280',
                              }
                            }}
                          >
                            <PlayArrow />
                          </IconButton>
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
                      {index < lessons.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
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
                    <Typography sx={{ color: '#9ca3af' }}>Всего уроков:</Typography>
                    <Typography sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                      {lessons.length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Проведено:</Typography>
                    <Typography sx={{ color: '#10b981', fontWeight: 600 }}>
                      {lessons.filter(l => l.status === 'COMPLETED').length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Запланировано:</Typography>
                    <Typography sx={{ color: '#6366f1', fontWeight: 600 }}>
                      {lessons.filter(l => l.status === 'PLANNED').length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Общая сумма:</Typography>
                    <Typography sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                      {lessons.reduce((sum, lesson) => sum + (lesson.price || 0), 0)} ₽
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Create Lesson Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
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
            ✨ Создать новый урок
          </DialogTitle>
          <DialogContent sx={{ padding: '2em' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Тема урока"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  fullWidth
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
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(99, 102, 241, 0.6)',
                      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#e5e7eb' }}>Ученик</InputLabel>
                  <Select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    sx={{
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
                    }}
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id} sx={{ color: '#e5e7eb' }}>
                        {student.firstName} {student.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#e5e7eb' }}>Учитель</InputLabel>
                  <Select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    sx={{
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
                    }}
                  >
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id} sx={{ color: '#e5e7eb' }}>
                        {teacher.firstName} {teacher.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Длительность (мин)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  fullWidth
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
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(99, 102, 241, 0.6)',
                      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Цена (₽)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  fullWidth
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
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(99, 102, 241, 0.6)',
                      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            padding: '1em 2em',
            background: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Button 
              onClick={handleSaveLesson} 
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
              ✨ Создать урок
            </Button>
            <Button 
              onClick={() => setDialogOpen(false)} 
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
          </DialogActions>
        </Dialog>
      </Box>
    </FuturisticBackground>
  );
};

export default LessonWorkPage;
