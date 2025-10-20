import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
} from 'react-big-calendar';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Tooltip,
  Paper,
} from '@mui/material';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css';
import { useNotify, useRedirect, useCreate, useDataProvider, useUpdate } from 'react-admin';
import FuturisticBackground from '../components/FuturisticBackground';

const locales = {
  ru: require('date-fns/locale/ru'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Generate consistent colors for students
const studentColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#A9DFBF', '#F9E79F', '#D5DBDB', '#AED6F1', '#FADBD8'
];

const getColorByStudent = (student, studentId) => {
  if (!student && !studentId) {
    return '#D3D3D3';
  }
  
  // If student has a custom color, use it
  if (student?.color) {
    return student.color;
  }
  
  // Generate consistent color based on student ID
  const id = studentId || student?.id;
  if (id) {
    const colorIndex = id % studentColors.length;
    return studentColors[colorIndex];
  }
  
  return '#D3D3D3';
};

const LessonCalendar = ({ initialLessons = [] }) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const [update] = useUpdate();
  const dataProvider = useDataProvider();
  const [lessons, setLessons] = useState(initialLessons);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ topic: '', student: '', time: '', duration: 60 });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateString, setSelectedDateString] = useState('');
  const [students, setStudents] = useState([]);
  const [draggedEvent, setDraggedEvent] = useState(null);

  useEffect(() => {
    // Загружаем уроки
    dataProvider.getList('lessons', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'lessonDate', order: 'ASC' },
      filter: {},
    }).then(({ data }) => {
      setLessons(data);
    }).catch(error => {
      console.error('Error fetching lessons:', error);
    });
  
    // Загружаем студентов
    dataProvider.getList('students', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    }).then(({ data }) => {
      setStudents(data);
    }).catch(error => {
      console.error('Error fetching students:', error);
    });
  }, [dataProvider]);

  const events = useMemo(() => {
    if (!students || students.length === 0) return [];
  
    return lessons
      .filter((lesson) => lesson?.lessonDate || lesson?.scheduledAt)
      .map((lesson) => {
        // Handle both lessonDate and scheduledAt formats
        const lessonDate = lesson.lessonDate || lesson.scheduledAt;
        const start = new Date(lessonDate);
        
        // Calculate end time based on duration or default to 1 hour
        const end = new Date(start);
        const durationMinutes = lesson.durationMinutes || 60;
        end.setMinutes(start.getMinutes() + durationMinutes);
  
        const student = students.find((s) => s.id === lesson.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : 'Ученик';
        const lessonTitle = lesson.topic || `Урок ${lesson.id}`;
        
        // Format time for display
        const timeStr = start.toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        // Create detailed title with topic, student, and time
        const detailedTitle = `${lessonTitle}\n${studentName}\n${timeStr}`;
        
        const backgroundColor = getColorByStudent(student, lesson.studentId);
        const textColor = '#ffffff';
  
        return {
          id: lesson.id,
          title: detailedTitle,
          start,
          end,
          resource: lesson,
          backgroundColor,
          textColor,
          borderColor: backgroundColor,
          student: student,
          studentId: lesson.studentId,
          topic: lesson.topic,
          studentName: studentName,
          time: timeStr,
          duration: durationMinutes,
        };
      });
  }, [lessons, students]);
  

  const handleSelectEvent = (event) => {
    redirect(`/lessons/${event.id}/show`);
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    // Format the selected date for display
    const formattedDate = start.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setSelectedDateString(formattedDate);
    
    // Set default time based on the selected slot
    const defaultTime = start.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    setFormData({
      topic: '',
      student: '',
      time: defaultTime,
      duration: 60
    });
    
    setModalOpen(true);
  };

  // Handle drag and drop to change lesson time
  const handleEventDrop = useCallback(({ event, start, end }) => {
    const lessonId = event.id;
    const originalLesson = lessons.find(l => l.id === lessonId);
    
    if (!originalLesson) return;

    // Calculate new duration
    const durationMinutes = Math.round((end - start) / (1000 * 60));
    
    // Update lesson time
    const updatedLesson = {
      ...originalLesson,
      lessonDate: start.toISOString(),
      scheduledAt: start.toISOString(),
      durationMinutes: durationMinutes
    };

    // Update in backend
    update('lessons', {
      id: lessonId,
      data: updatedLesson
    }, {
      onSuccess: () => {
        notify('Время урока изменено', { type: 'success' });
        // Update local state
        setLessons(prev => prev.map(l => l.id === lessonId ? updatedLesson : l));
      },
      onError: (error) => {
        console.error('Error updating lesson time:', error);
        notify('Ошибка при изменении времени урока', { type: 'error' });
        // Reload lessons to revert changes
        dataProvider.getList('lessons', {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'lessonDate', order: 'ASC' },
          filter: {},
        }).then(({ data }) => {
          setLessons(data);
        });
      }
    });
  }, [lessons, update, notify, dataProvider]);

  // Handle resize to change lesson duration
  const handleEventResize = useCallback(({ event, start, end }) => {
    const lessonId = event.id;
    const originalLesson = lessons.find(l => l.id === lessonId);
    
    if (!originalLesson) return;

    // Calculate new duration
    const durationMinutes = Math.round((end - start) / (1000 * 60));
    
    // Update lesson duration
    const updatedLesson = {
      ...originalLesson,
      durationMinutes: durationMinutes
    };

    // Update in backend
    update('lessons', {
      id: lessonId,
      data: updatedLesson
    }, {
      onSuccess: () => {
        notify('Длительность урока изменена', { type: 'success' });
        // Update local state
        setLessons(prev => prev.map(l => l.id === lessonId ? updatedLesson : l));
      },
      onError: (error) => {
        console.error('Error updating lesson duration:', error);
        notify('Ошибка при изменении длительности урока', { type: 'error' });
        // Reload lessons to revert changes
        dataProvider.getList('lessons', {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'lessonDate', order: 'ASC' },
          filter: {},
        }).then(({ data }) => {
          setLessons(data);
        });
      }
    });
  }, [lessons, update, notify, dataProvider]);

  const handleSubmit = () => {
    console.log('Form data on submit:', formData); // Лог данных формы перед отправкой

    if (!formData.topic || !formData.student || !formData.time || !selectedDate) return;

    const [hours, minutes] = formData.time.split(':');
    const date = new Date(selectedDate);
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    date.setSeconds(0);
    date.setMilliseconds(0);

    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const lessonDate = date.toISOString();

    create(
      'lessons',
      {
        data: {
          lessonDate,
          topic: formData.topic,
          studentId: formData.student,
          durationMinutes: formData.duration || 60,
          isActual: 1,
        },
      },
      {
        onSuccess: ({ data }) => {
          console.log('Lesson created successfully:', data); // Лог успешного создания урока
          notify('Урок успешно добавлен', { type: 'success' });
          setLessons((prev) => [...prev, data]);
          setModalOpen(false);
          setFormData({ topic: '', student: '', time: '', duration: 60 });

          dataProvider.getList('lessons', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'lessonDate', order: 'ASC' },
            filter: {},
          }).then(({ data }) => {
            setLessons(data);
          }).catch(error => {
            console.error('Error fetching lessons after creation:', error); // Лог ошибки при повторном запросе
          });

          redirect('/calendar');
        },
        onError: (error) => {
          console.error('Error creating lesson:', error); // Лог ошибки при создании урока
          notify('Ошибка при добавлении урока', { type: 'error' });
        },
      }
    );
  };

  return (
    <FuturisticBackground>
      <Box sx={{ 
        height: '80vh', 
        padding: '2em',
        position: 'relative',
        zIndex: 1
      }}>
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          height: '100%',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ height: '100%', padding: 0 }}>
            <Box sx={{ 
              padding: '1em',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)'
            }}>
              <Typography variant="h5" sx={{ 
                color: '#e5e7eb', 
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '1em'
              }}>
                📅 Календарь уроков
              </Typography>
              
              {/* Student Legend */}
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
                maxHeight: '60px',
                overflowY: 'auto'
              }}>
                {students.slice(0, 10).map((student) => (
                  <Chip
                    key={student.id}
                    label={`${student.firstName} ${student.lastName}`}
                    sx={{
                      backgroundColor: getColorByStudent(student, student.id),
                      color: '#ffffff',
                      fontSize: '11px',
                      height: '24px',
                      '& .MuiChip-label': {
                        padding: '0 8px',
                        fontWeight: '500'
                      }
                    }}
                  />
                ))}
                {students.length > 10 && (
                  <Chip
                    label={`+${students.length - 10} еще`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#e5e7eb',
                      fontSize: '11px',
                      height: '24px',
                    }}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ height: 'calc(100% - 80px)', padding: '1em' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        draggableAccessor={() => true}
        resizable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        messages={{
          next: '→',
          previous: '←',
          today: 'Сегодня',
          month: 'Месяц',
          week: 'Неделя',
          day: 'День',
          agenda: 'Расписание',
          date: 'Дата',
          time: 'Время',
          event: 'Событие',
          noEventsInRange: 'Нет уроков в этом диапазоне',
          showMore: (total) => `+${total} еще`,
        }}
        style={{ 
          height: '100%',
          color: '#e5e7eb',
          fontFamily: 'Roboto, sans-serif'
        }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        step={15}
        timeslots={4}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.backgroundColor,
            color: event.textColor || '#ffffff',
            borderRadius: '6px',
            border: `2px solid ${event.borderColor}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '12px',
            fontWeight: '500',
            padding: '2px 6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        })}
        components={{
          event: ({ event }) => {
            const tooltipContent = (
              <Paper sx={{
                padding: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                borderRadius: '8px',
                maxWidth: '250px',
                backdropFilter: 'blur(10px)',
              }}>
                <Typography variant="h6" sx={{ 
                  color: event.backgroundColor,
                  fontWeight: '700',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  📚 {event.topic || `Урок ${event.id}`}
                </Typography>
                
                <Box sx={{ marginBottom: '6px' }}>
                  <Typography sx={{ fontSize: '12px', color: '#e5e7eb', fontWeight: '500' }}>
                    👤 Студент: {event.studentName}
                  </Typography>
                </Box>
                
                <Box sx={{ marginBottom: '6px' }}>
                  <Typography sx={{ fontSize: '12px', color: '#e5e7eb' }}>
                    ⏰ Время: {event.time}
                  </Typography>
                </Box>
                
                <Box sx={{ marginBottom: '6px' }}>
                  <Typography sx={{ fontSize: '12px', color: '#e5e7eb' }}>
                    ⏱️ Длительность: {event.duration} минут
                  </Typography>
                </Box>
                
                <Box sx={{ marginBottom: '6px' }}>
                  <Typography sx={{ fontSize: '12px', color: '#e5e7eb' }}>
                    📅 Дата: {event.start.toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                
                {event.resource?.description && (
                  <Box sx={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                      {event.resource.description}
                    </Typography>
                  </Box>
                )}
              </Paper>
            );

            return (
              <Tooltip 
                title={tooltipContent}
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: 'transparent',
                      padding: 0,
                      maxWidth: 'none',
                    }
                  }
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  padding: '4px 6px',
                  minHeight: '40px',
                  cursor: 'pointer',
                }}>
                  {/* Color indicator and topic */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '2px',
                  }}>
                    <Box sx={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: event.backgroundColor,
                      marginRight: '4px',
                      flexShrink: 0,
                    }} />
                    <Typography sx={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: event.textColor || '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      lineHeight: 1.2,
                    }}>
                      {event.topic || `Урок ${event.id}`}
                    </Typography>
                  </Box>
                  
                  {/* Student name */}
                  <Typography sx={{
                    fontSize: '9px',
                    fontWeight: '500',
                    color: event.textColor || '#ffffff',
                    opacity: 0.9,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '1px',
                    lineHeight: 1.1,
                  }}>
                    {event.studentName}
                  </Typography>
                  
                  {/* Time */}
                  <Typography sx={{
                    fontSize: '8px',
                    fontWeight: '400',
                    color: event.textColor || '#ffffff',
                    opacity: 0.8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}>
                    {event.time} ({event.duration}мин)
                  </Typography>
                </Box>
              </Tooltip>
            );
          },
        }}
      />
            </Box>
          </CardContent>
        </Card>

        <Dialog 
          open={modalOpen} 
          onClose={() => setModalOpen(false)}
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
            ✨ Добавить урок
            {selectedDateString && (
              <Typography variant="body2" sx={{
                color: '#9ca3af',
                fontWeight: '400',
                marginTop: '4px',
                fontSize: '14px'
              }}>
                📅 {selectedDateString}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent sx={{ padding: '2em' }}>
          {/* Selected Date Display */}
          {selectedDate && (
            <Box sx={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <Typography sx={{
                color: '#e5e7eb',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                📅 Выбранная дата: {selectedDateString}
              </Typography>
            </Box>
          )}
          
          <TextField
            label="Тема урока"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="Введите тему урока..."
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
          <TextField
            label="Выберите ученика"
            select
            value={formData.student}
            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
            fullWidth
            margin="normal"
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
          >
            {students.map((student) => (
                <MenuItem key={student.id} value={student.id} sx={{ color: '#e5e7eb' }}>
                {student.firstName} {student.middleName} {student.lastName}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Время начала"
              type="time"
              value={formData.time || ''}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              fullWidth
              margin="normal"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
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
            <TextField
              label="Длительность (мин)"
              type="number"
              value={formData.duration || 60}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
              fullWidth
              margin="normal"
              inputProps={{ min: 15, max: 480, step: 15 }}
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
          </Box>
        </DialogContent>
          <DialogActions sx={{ 
            padding: '1em 2em',
            background: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Button 
              onClick={handleSubmit} 
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
              ✨ Сохранить
          </Button>
            <Button 
              onClick={() => setModalOpen(false)} 
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

export default LessonCalendar;