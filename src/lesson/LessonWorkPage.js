import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useCurrentEntity } from '../hooks/useCurrentEntity';
import FuturisticBackground from '../components/FuturisticBackground';

const LessonWorkPage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const navigate = useNavigate();
  const { 
    currentEntity, 
    entityType, 
    getCurrentEntity,
    canPerformAction,
    getEntitySpecificData
  } = useCurrentEntity();
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [studentsByTeacher, setStudentsByTeacher] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [statuses] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    durationMinutes: 60,
    price: 0,
    status: { name: 'SCHEDULED' },
    homework: '',
    feedback: '',
    scheduledAt: ''
  });
  const [editFormData, setEditFormData] = useState({
    studentId: '',
    teacherId: '',
    durationMinutes: 60,
    price: 0,
    status: { name: 'SCHEDULED' },
    homework: '',
    feedback: '',
    scheduledAt: ''
  });


  // Get current teacher ID from global context
  const getCurrentTeacherId = useCallback(() => {
    if (entityType === 'TEACHER' && currentEntity) {
      return currentEntity.id;
    }
    return null;
  }, [entityType, currentEntity]);

  // Check if user can create lessons and students
  const canCreate = useCallback(() => {
    return canPerformAction('CREATE_LESSONS') || canPerformAction('CREATE_STUDENTS');
  }, [canPerformAction]);

  // Check if user can see students
  const canSeeStudents = useCallback(() => {
    return canPerformAction('VIEW_STUDENTS');
  }, [canPerformAction]);

  const loadData = useCallback(async () => {
    try {
      const promises = [
        dataProvider.getList('lessons', { pagination: { page: 1, perPage: 100 } }),
        dataProvider.getList('teachers', { pagination: { page: 1, perPage: 100 } }),
        dataProvider.getAllStatuses()
      ];
      
      // Only load students if user has permission
      if (canSeeStudents()) {
        promises.push(dataProvider.getList('students', { pagination: { page: 1, perPage: 100 } }));
      }
      
      const results = await Promise.all(promises);
      const [lessonsRes, teachersRes, , studentsRes] = results;
      
      // Load entity-specific lessons if entity is available
      let entityLessons = [];
      if (currentEntity && entityType) {
        entityLessons = await getEntitySpecificData(dataProvider, 'LESSONS');
      }
      
      // Set lessons based on entity type
      //console.log('Current entityType:', entityType);
      //console.log('Current entityLessons:', entityLessons);
      //console.log('Current entityType length:', entityLessons.length);
      if (entityType === 'TEACHER' && entityLessons.length > 0) {
        setLessons(entityLessons);
      } else if (entityType === 'STUDENT' && entityLessons.length > 0) {
        setLessons(entityLessons);
      } else {
        setLessons(lessonsRes.data);
      }
      
      setTeachers(teachersRes.data);
      
      // Only set students if user has permission
      if (canSeeStudents() && studentsRes) {
        setStudents(studentsRes.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      notify('Ошибка загрузки данных', { type: 'error' });
    }
  }, [dataProvider, notify, canSeeStudents, currentEntity, entityType, getEntitySpecificData]);

  // Initialize entity on mount
  useEffect(() => {
    const initializeEntity = async () => {
      if (dataProvider) {
        await getCurrentEntity(dataProvider);
      }
    };
    initializeEntity();
  }, [getCurrentEntity, dataProvider]);

  useEffect(() => {
    // Defer data loading until entity type is known (prevents null logs)
    loadData();
  }, [loadData, entityType]);

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
    // Handle both old string format and new object format
    const statusName = typeof status === 'object' ? status.name : status;
    switch (statusName) {
      case 'SCHEDULED': return 'primary';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    // Handle both old string format and new object format
    if (typeof status === 'object' && status.text) {
      return status.text;
    }
    const statusName = typeof status === 'object' ? status.name : status;
    switch (statusName) {
      case 'SCHEDULED': return 'Запланирован';
      case 'IN_PROGRESS': return 'В процессе';
      case 'COMPLETED': return 'Проведён';
      case 'CANCELLED': return 'Отменён';
      default: return statusName;
    }
  };

  // Helper function to get status name from status object or string
  const getStatusName = (status) => {
    return typeof status === 'object' ? status.name : status;
  };

  const handleStartLesson = async (lesson) => {
    try {
      // Call backend to start lesson (change status to IN_PROGRESS)
      await dataProvider.startLesson(lesson.id);
      
      setCurrentLesson(lesson);
      setIsTimerRunning(true);
      setTimerSeconds(0);
      notify('Урок начат', { type: 'success' });
      
      
      // Reload lessons to get updated status
      loadData();
    } catch (error) {
      console.error('Error starting lesson:', error);
      notify('Ошибка начала урока', { type: 'error' });
    }
  };

  const handlePauseLesson = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleStopLesson = async () => {
    try {
      // Call backend to complete lesson (change status to COMPLETED)
      await dataProvider.completeLesson(currentLesson.id);
      
      setIsTimerRunning(false);
      setCurrentLesson(null);
      setTimerSeconds(0);
      notify('Урок завершён', { type: 'success' });
      
      
      // Reload lessons to get updated status
      loadData();
    } catch (error) {
      console.error('Error completing lesson:', error);
      notify('Ошибка завершения урока', { type: 'error' });
    }
  };

  const handleCancelLesson = async (lesson) => {
    try {
      // Call backend to cancel lesson (change status to CANCELED)
      await dataProvider.cancelLesson(lesson.id);
      
      notify('Урок отменён', { type: 'success' });
      
      // Reload lessons to get updated status
      loadData();
    } catch (error) {
      console.error('Error canceling lesson:', error);
      notify('Ошибка отмены урока', { type: 'error' });
    }
  };

  const handleCreateLesson = () => {
    // Set default scheduled time to tomorrow at 10:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const defaultDateTime = tomorrow.toISOString().slice(0, 16);
    
    setFormData({
      studentId: '',
      teacherId: currentEntity.id || '',
      durationMinutes: 60,
      price: 0,
      status: { name: 'SCHEDULED' },
      homework: '',
      feedback: '',
      scheduledAt: defaultDateTime
    });
    setStudentsByTeacher([]);
    setDialogOpen(true);
  };

  useEffect(() => {
    const loadStudentsForTeacher = async () => {
      if (!dialogOpen) return;
      if (!formData.teacherId) {
        setStudentsByTeacher([]);
        setLoadingStudents(false);
        return;
      }
      setLoadingStudents(true);
      try {
        const list = await dataProvider.getStudentsByTeacher(formData.teacherId);
        setStudentsByTeacher(list);
      } catch (e) {
        console.error('Error loading students:', e);
        notify(String(e?.message || 'Ошибка загрузки учеников'), { type: 'warning' });
        setStudentsByTeacher([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudentsForTeacher();
  }, [dialogOpen, formData.teacherId, dataProvider, notify]);

  const handleSaveLesson = async () => {
    try {
      // Convert datetime-local value to ISO string for backend
      const scheduledAt = formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : new Date().toISOString();
      
      const lessonData = {
        ...formData,
        scheduledAt: scheduledAt,
      };

      // console.log('Отправляем на создание урока:', lessonData);

      await dataProvider.create('lessons', {
          data: lessonData,
      });
      
      // await dataProvider.create('lessons', {
      //   data: {
      //     ...formData,
      //     scheduledAt,
      //   }
      // });
      notify('Урок создан', { type: 'success' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      notify('Ошибка создания урока', { type: 'error' });
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    
    // Format the scheduledAt date for datetime-local input
    const scheduledDate = lesson.scheduledAt ? new Date(lesson.scheduledAt).toISOString().slice(0, 16) : '';
    
    setEditFormData({
      studentId: lesson.studentId || '',
      teacherId: lesson.teacherId || '',
      durationMinutes: lesson.durationMinutes || 60,
      price: lesson.price || 0,
      status: lesson.status || { name: 'SCHEDULED' },
      homework: lesson.homework || '',
      feedback: lesson.feedback || '',
      scheduledAt: scheduledDate
    });
    setEditDialogOpen(true);
  };

  const handleSaveEditLesson = async () => {
    try {
      // Convert datetime-local value to ISO string for backend
      const scheduledAt = editFormData.scheduledAt ? new Date(editFormData.scheduledAt).toISOString() : new Date().toISOString();
      
      const lessonData = {
        ...editFormData,
        scheduledAt: scheduledAt,
      };

      await dataProvider.update('lessons', {
        id: editingLesson.id,
        data: lessonData,
      });
      
      notify('Урок обновлён', { type: 'success' });
      setEditDialogOpen(false);
      setEditingLesson(null);
      loadData();
    } catch (error) {
      notify('Ошибка обновления урока', { type: 'error' });
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
                      <Button
                        onClick={() => navigate(`/lesson/${currentLesson.id}/board`)}
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                          color: '#0b1026',
                          margin: '0 8px',
                          fontWeight: 700,
                          '&:hover': {
                            transform: 'scale(1.05)',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                          },
                        }}
                      >
                        🎨 Доска
                      </Button>
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
                  {canCreate() && (
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
                  )}
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
                              {canSeeStudents() && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Person fontSize="small" sx={{ color: '#9ca3af' }} />
                                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                    {students.find(s => s.id === lesson.studentId)?.firstName || 'Ученик'}
                                  </Typography>
                                </Box>
                              )}
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
                          primaryTypographyProps={{ component: 'span' }}
                          secondaryTypographyProps={{ component: 'span' }}
                        />
                        {canCreate() && (
                          <Box>
                            <IconButton
                              onClick={() => handleStartLesson(lesson)}
                              disabled={getStatusName(lesson.status) !== 'SCHEDULED'}
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
                              onClick={() => handleEditLesson(lesson)}
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
                            <IconButton
                              onClick={() => handleCancelLesson(lesson)}
                              disabled={getStatusName(lesson.status) === 'CANCELLED' || getStatusName(lesson.status) === 'COMPLETED'}
                              sx={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                margin: '0 4px',
                                '&:hover': {
                                  background: 'rgba(239, 68, 68, 0.3)',
                                  transform: 'scale(1.1)',
                                },
                                '&:disabled': {
                                  background: 'rgba(107, 114, 128, 0.2)',
                                  color: '#6b7280',
                                }
                              }}
                            >
                              <Stop />
                            </IconButton>
                            <IconButton
                              onClick={() => navigate(`/lesson/${lesson.id}/board`)}
                              sx={{
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#8b5cf6',
                                margin: '0 4px',
                                '&:hover': {
                                  background: 'rgba(139, 92, 246, 0.3)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                              title="Открыть доску"
                            >
                              🎨
                            </IconButton>
                          </Box>
                        )}
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
                      {lessons.filter(l => getStatusName(l.status) === 'COMPLETED').length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Запланировано:</Typography>
                    <Typography sx={{ color: '#6366f1', fontWeight: 600 }}>
                      {lessons.filter(l => getStatusName(l.status) === 'SCHEDULED').length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>В процессе:</Typography>
                    <Typography sx={{ color: '#f59e0b', fontWeight: 600 }}>
                      {lessons.filter(l => getStatusName(l.status) === 'IN_PROGRESS').length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#9ca3af' }}>Отменено:</Typography>
                    <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>
                      {lessons.filter(l => getStatusName(l.status) === 'CANCELED').length}
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

        {/* Create Lesson Dialog - Only show if user can create */}
        {canCreate() && (
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
            {currentEntity && entityType === 'TEACHER' && (
              <Typography variant="body2" sx={{ 
                color: '#10b981', 
                fontWeight: 400, 
                marginTop: '0.5em',
                fontSize: '0.9em'
              }}>
                 {/* Урок будет автоматически назначен текущему учителю:{currentEntity.firstName} {currentEntity.lastName} */}
              </Typography>
            )}
            {currentEntity && entityType === 'STUDENT' && (
              <Typography variant="body2" sx={{ 
                color: '#6366f1', 
                fontWeight: 400, 
                marginTop: '0.5em',
                fontSize: '0.9em'
              }}>
                Создание урока для ученика: {currentEntity.firstName} {currentEntity.lastName}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent sx={{ padding: '2em' }}>
            <Grid container spacing={2}>
              
              <Grid item xs={12} sm={12}>
                <FormControl fullWidth disabled={!formData.teacherId || loadingStudents}>
                  <InputLabel sx={{ color: '#e5e7eb' }}>
                    {loadingStudents ? 'Загрузка учеников...' : 'Ученик'}
                  </InputLabel>
                  <Select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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
                    {loadingStudents ? (
                      <MenuItem disabled sx={{ color: '#9ca3af' }}>
                        Загрузка учеников...
                      </MenuItem>
                    ) : studentsByTeacher.length === 0 && formData.teacherId ? (
                      <MenuItem disabled sx={{ color: '#9ca3af' }}>
                        У этого учителя нет учеников
                      </MenuItem>
                    ) : (
                      studentsByTeacher.map((student) => (
                        <MenuItem
                          key={student.id}
                          value={student.id}
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
                          {student.firstName} {student.lastName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Дата и время урока"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.12) 100%)',
                      borderRadius: '12px',
                      color: '#e5e7eb',
                      backdropFilter: 'blur(8px)',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#e5e7eb',
                    },
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
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={entityType === 'TEACHER' && currentEntity}>
                  <InputLabel sx={{ color: '#e5e7eb' }}>
                    {currentEntity && entityType === 'TEACHER' ? 'Учитель' : 'Учитель'}
                  </InputLabel>
                  <Select
                    value={
                      entityType === 'TEACHER' && currentEntity
                        ? currentEntity.id // автоматически подставляем текущего учителя
                        : formData.id
                    }
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value, studentId: '' })}
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
                              background: teacher.id === currentTeacherId ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)',
                            }
                          }}
                        >
                          {teacher.firstName} {teacher.lastName}
                          {teacher.teacherId === currentTeacherId && ' (текущий)'}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Длительность (мин)"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
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
              
              <Grid item xs={12}>
                <TextField
                  label="Обратная связь"
                  multiline
                  rows={3}
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
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
        )}

        {/* Edit Lesson Dialog */}
        {editDialogOpen && (
          <Dialog 
            open={editDialogOpen} 
            onClose={() => setEditDialogOpen(false)}
            maxWidth="md" 
            fullWidth
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.95) 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }
            }}
          >
            <DialogTitle sx={{ 
              color: '#e5e7eb', 
              fontWeight: 700, 
              textAlign: 'center',
              background: 'rgba(99,102,241,0.1)',
              borderBottom: '1px solid rgba(99,102,241,0.2)'
            }}>
              ✏️ Редактировать урок
            </DialogTitle>
            <DialogContent sx={{ padding: '2em' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#e5e7eb' }}>Ученик</InputLabel>
                    <Select
                      value={editFormData.studentId}
                      onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
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
                      {students.map((student) => (
                        <MenuItem 
                          key={student.id} 
                          value={student.id} 
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
                          {student.firstName} {student.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Дата и время урока"
                    type="datetime-local"
                    value={editFormData.scheduledAt}
                    onChange={(e) => setEditFormData({ ...editFormData, scheduledAt: e.target.value })}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.12) 100%)',
                        borderRadius: '12px',
                        color: '#e5e7eb',
                        backdropFilter: 'blur(8px)',
                      },
                      '& .MuiInputLabel-root': {
                        color: '#e5e7eb',
                      },
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
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Длительность (мин)"
                    type="number"
                    value={editFormData.durationMinutes}
                    onChange={(e) => setEditFormData({ ...editFormData, durationMinutes: parseInt(e.target.value) })}
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
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: parseInt(e.target.value) })}
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
                    <InputLabel sx={{ color: '#e5e7eb' }}>Статус</InputLabel>
                    <Select
                      value={editFormData.status.name}
                      onChange={(e) => setEditFormData({ ...editFormData, status: { name: e.target.value } })}
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
                      {statuses.map((status) => (
                        <MenuItem 
                          key={status.name}
                          value={status.name} 
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
                          {status.text}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Домашнее задание"
                    multiline
                    rows={3}
                    value={editFormData.homework}
                    onChange={(e) => setEditFormData({ ...editFormData, homework: e.target.value })}
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
                
                <Grid item xs={12}>
                  <TextField
                    label="Обратная связь"
                    multiline
                    rows={3}
                    value={editFormData.feedback}
                    onChange={(e) => setEditFormData({ ...editFormData, feedback: e.target.value })}
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
                onClick={handleSaveEditLesson} 
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
                ✏️ Сохранить изменения
              </Button>
              <Button 
                onClick={() => setEditDialogOpen(false)} 
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
        )}

      </Box>
    </FuturisticBackground>
  );
};

export default LessonWorkPage;
