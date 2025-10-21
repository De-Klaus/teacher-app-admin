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
  Tooltip,
  Paper,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css';
import { useNotify, useRedirect, useCreate, useDataProvider, useUpdate } from 'react-admin';
import { useCurrentEntity } from '../hooks/useCurrentEntity';
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
  const { 
    currentEntity, 
    entityType, 
    getCurrentEntity
  } = useCurrentEntity();
  const [lessons, setLessons] = useState(initialLessons);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ topic: '', student: '', time: '', duration: 60, teacherId: '' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateString, setSelectedDateString] = useState('');
  const [students, setStudents] = useState([]);
  const [studentsByTeacher, setStudentsByTeacher] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);

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
    // Загружаем уроки
    dataProvider.getList('lessons', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'scheduledAt', order: 'ASC' },
      filter: {},
    }).then(({ data }) => {
      setLessons(data);
    }).catch(error => {
      console.error('❌ Error fetching lessons:', error);
    });
  
    // Загружаем студентов
    dataProvider.getList('students', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    }).then(({ data }) => {
      
      setStudents(data);
    }).catch(error => {
      console.error('❌ Error fetching students:', error);
    });
  }, [dataProvider]);

  const events = useMemo(() => {
    if (!students || students.length === 0) return [];
  
    return lessons
      .filter((lesson) => lesson?.scheduledAt)
      .map((lesson) => {
        // Use only scheduledAt field
        const start = new Date(lesson.scheduledAt);
        
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
    // Find the lesson data
    const lesson = lessons.find(l => l.id === event.id);
    if (!lesson) return;

    // Set the selected date to the lesson's scheduled time
    const lessonDate = new Date(lesson.scheduledAt);
    setSelectedDate(lessonDate);
    
    // Format the selected date for display
    const formattedDate = lessonDate.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setSelectedDateString(formattedDate);
    
    // Set form data with lesson information for editing
    setFormData({
      topic: lesson.topic || '',
      student: lesson.studentId || '',
      time: lessonDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: lesson.durationMinutes || 60,
      teacherId: lesson.teacherId || ''
    });
    
    // Set editing lesson ID
    setEditingLessonId(lesson.id);
    setModalOpen(true);
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
    
    // Set default teacher if current entity is a teacher
    const defaultTeacherId = entityType === 'TEACHER' && currentEntity ? currentEntity.id : '';
    
    setFormData({
      topic: '',
      student: '',
      time: defaultTime,
      duration: 60,
      teacherId: defaultTeacherId
    });
    
    // Clear editing lesson ID for new lesson
    setEditingLessonId(null);
    setModalOpen(true);
  };

  // Handle date change from date picker
  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setSelectedDate(newDate);
    
    // Update the formatted date string
    const formattedDate = newDate.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setSelectedDateString(formattedDate);
    setIsEditingDate(false);
  };

  // Toggle date editing mode
  const toggleDateEdit = () => {
    setIsEditingDate(!isEditingDate);
  };

  // Load students for the selected teacher
  useEffect(() => {
    const loadStudentsForTeacher = async () => {
      if (!modalOpen) return;
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
  }, [modalOpen, formData.teacherId, dataProvider, notify]);

  // Handle drag and drop to change lesson time and day
  const handleEventDrop = useCallback(({ event, start, end }) => {
    const lessonId = event.id;
    const originalLesson = lessons.find(l => l.id === lessonId);
    
    if (!originalLesson) return;

    // Calculate new duration
    const durationMinutes = Math.round((end - start) / (1000 * 60));
    
    // Round to 15-minute increments
    const roundedStart = new Date(start);
    const minutes = roundedStart.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    roundedStart.setMinutes(roundedMinutes, 0, 0);
    
    // Check if day changed
    const originalDate = new Date(originalLesson.scheduledAt);
    const dayChanged = originalDate.toDateString() !== roundedStart.toDateString();
    
    // Format for display
    const newTime = roundedStart.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const newDate = roundedStart.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Prepare update data
    const updateData = {
      scheduledAt: roundedStart.toISOString(),
      durationMinutes: durationMinutes
    };

    // Update in backend
    console.log('🔄 Updating lesson time via PUT /lessons/' + lessonId);
    console.log('📤 Data being sent:', updateData);
    
    update('lessons', {
      id: lessonId,
      data: updateData
    }, {
      onSuccess: () => {
        console.log('✅ Lesson time updated successfully');
        const message = dayChanged 
          ? `Урок "${originalLesson.topic || `Урок ${lessonId}`}" перемещен на ${newDate} в ${newTime}`
          : `Урок "${originalLesson.topic || `Урок ${lessonId}`}" перемещен на ${newTime}`;
        notify(message, { type: 'success' });
        // Update local state
        setLessons(prev => prev.map(l => l.id === lessonId ? {
          ...l,
          scheduledAt: roundedStart.toISOString(),
          durationMinutes: durationMinutes
        } : l));
      },
      onError: (error) => {
        console.error('Error updating lesson time:', error);
        notify('Ошибка при изменении времени урока', { type: 'error' });
        // Reload lessons to revert changes
        dataProvider.getList('lessons', {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'scheduledAt', order: 'ASC' },
          filter: {},
        }).then(({ data }) => {
          setLessons(data);
        });
      }
    });
  }, [lessons, update, notify, dataProvider]);

  // Handle resize to change lesson duration (15-minute increments)
  const handleEventResize = useCallback(({ event, start, end }) => {
    const lessonId = event.id;
    const originalLesson = lessons.find(l => l.id === lessonId);
    
    if (!originalLesson) return;

    // Calculate new duration and round to 15-minute increments
    const durationMinutes = Math.round((end - start) / (1000 * 60));
    const roundedDuration = Math.round(durationMinutes / 15) * 15;
    
    // Ensure minimum duration of 15 minutes
    const finalDuration = Math.max(roundedDuration, 15);
    
    // Prepare update data
    const updateData = {
      durationMinutes: finalDuration
    };

    // Update in backend
    console.log('🔄 Updating lesson duration via PUT /lessons/' + lessonId);
    console.log('📤 Data being sent:', updateData);
    
    update('lessons', {
      id: lessonId,
      data: updateData
    }, {
      onSuccess: () => {
        console.log('✅ Lesson duration updated successfully');
        notify(`Длительность урока "${originalLesson.topic || `Урок ${lessonId}`}" изменена на ${finalDuration} минут`, { type: 'success' });
        // Update local state
        setLessons(prev => prev.map(l => l.id === lessonId ? {
          ...l,
          durationMinutes: finalDuration
        } : l));
      },
      onError: (error) => {
        console.error('Error updating lesson duration:', error);
        notify('Ошибка при изменении длительности урока', { type: 'error' });
        // Reload lessons to revert changes
        dataProvider.getList('lessons', {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'scheduledAt', order: 'ASC' },
          filter: {},
        }).then(({ data }) => {
          setLessons(data);
        });
      }
    });
  }, [lessons, update, notify, dataProvider]);

  const handleSubmit = () => {

    if (!formData.topic || !formData.student || !formData.time || !selectedDate) return;

    const [hours, minutes] = formData.time.split(':');
    const date = new Date(selectedDate);
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    date.setSeconds(0);
    date.setMilliseconds(0);

    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const lessonDate = date.toISOString();

    const lessonData = {
      scheduledAt: lessonDate, // Use only scheduledAt field
          topic: formData.topic,
      studentId: formData.student,
      teacherId: formData.teacherId || (entityType === 'TEACHER' && currentEntity ? currentEntity.id : ''),
      durationMinutes: formData.duration || 60,
    };

    if (editingLessonId) {
      
      update('lessons', {
        id: editingLessonId,
        data: lessonData
      }, {
        onSuccess: ({ data }) => {
          notify('Урок успешно обновлен', { type: 'success' });
          setLessons(prev => prev.map(l => l.id === editingLessonId ? data : l));
          setModalOpen(false);
          setFormData({ topic: '', student: '', time: '', duration: 60, teacherId: '' });
          setEditingLessonId(null);

          dataProvider.getList('lessons', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'scheduledAt', order: 'ASC' },
            filter: {},
          }).then(({ data }) => {
            setLessons(data);
          }).catch(error => {
            console.error('Error fetching lessons after update:', error);
          });

          redirect('/calendar');
        },
        onError: (error) => {
          console.error('Error updating lesson:', error);
          notify('Ошибка при обновлении урока', { type: 'error' });
        },
      });
    } else {
      // Create new lesson via POST /lessons      
      create('lessons', {
        data: lessonData,
      }, {
        onSuccess: ({ data }) => {
          notify('Урок успешно добавлен', { type: 'success' });
          setLessons((prev) => [...prev, data]);
          setModalOpen(false);
          setFormData({ topic: '', student: '', time: '', duration: 60, teacherId: '' });

          dataProvider.getList('lessons', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'scheduledAt', order: 'ASC' },
            filter: {},
          }).then(({ data }) => {
            setLessons(data);
          }).catch(error => {
            console.error('Error fetching lessons after creation:', error);
          });

          redirect('/calendar');
        },
        onError: (error) => {
          console.error('Error creating lesson:', error);
          notify('Ошибка при добавлении урока', { type: 'error' });
        },
      });
      }
  };

  return (
    <FuturisticBackground>
      <Box sx={{ 
        height: '100vh', 
        padding: '0.5em',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
            <Box sx={{ 
              padding: '0.5em',
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
            <Box sx={{ flex: 1, padding: '0.5em', display: 'flex', flexDirection: 'column' }}>
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
          flex: 1,
          color: '#e5e7eb',
          fontFamily: 'Roboto, sans-serif'
        }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="week"
        step={30}
        timeslots={1}
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
            {editingLessonId ? '✏️ Редактировать урок' : '✨ Добавить урок'}
            {selectedDateString && (
              <Typography variant="body2" sx={{
                color: '#9ca3af',
                fontWeight: '400',
                marginTop: '4px',
                fontSize: '14px'
              }}>
                {/* 📅 {selectedDateString} */}
              </Typography>
            )}
            {currentEntity && entityType === 'TEACHER' && (
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginTop: '12px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box sx={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}>
                    <Typography sx={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                      👨‍🏫
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ 
                      color: '#10b981', 
                      fontWeight: '600', 
                      fontSize: '14px',
                      lineHeight: 1.2
                    }}>
                      {/* 🎯 Урок будет назначен: Текущий учитель: */}
                    </Typography>
                    <Typography sx={{ 
                      color: '#e5e7eb', 
                      fontWeight: '500', 
                      fontSize: '13px',
                      marginTop: '2px',
                      opacity: 0.9
                    }}>
                      {/* Урок будет назначен: <span style={{ color: '#10b981', fontWeight: '600' }}>{currentEntity.firstName} {currentEntity.lastName}</span> */}
                      <span style={{ color: '#10b981', fontWeight: '600' }}>{currentEntity.firstName} {currentEntity.lastName}</span>
                    </Typography>
                  </Box>
                </Box>
              </Box>
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
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <Typography sx={{
                  color: '#e5e7eb',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {/* 📅 Выбранная дата: {selectedDateString} */}
                  {selectedDateString}
                </Typography>
                <IconButton
                  onClick={toggleDateEdit}
                  size="small"
                  sx={{
                    color: '#6366f1',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {/* Date Picker (shown when editing) */}
              {isEditingDate && (
                <Box sx={{ marginTop: '12px' }}>
                  <TextField
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
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
              )}
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
            label={loadingStudents ? 'Загрузка учеников...' : 'Выберите ученика'}
            select
            value={formData.student}
            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
            fullWidth
            margin="normal"
            disabled={!formData.teacherId || loadingStudents}
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
                <MenuItem key={student.id} value={student.id} sx={{ color: '#e5e7eb' }}>
                  {student.firstName} {student.middleName} {student.lastName}
                </MenuItem>
              ))
            )}
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
              {editingLessonId ? '✏️ Обновить' : '✨ Сохранить'}
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