import React, { useMemo, useState, useEffect } from 'react';
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
} from '@mui/material';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css';
import { useNotify, useRedirect, useCreate, useDataProvider } from 'react-admin';
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

const getColorByStudent = (student) => {
  if (!student) {
    return '#D3D3D3'; // дефолтный цвет, если студента нет вообще
  }
  // Если у ученика есть свой цвет, возвращаем его
  if (student.color) {
    return student.color;
  }
  return '#D3D3D3';
};

const LessonCalendar = ({ initialLessons = [] }) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const dataProvider = useDataProvider();
  const [lessons, setLessons] = useState(initialLessons);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ topic: '', student: '', time: '' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [students, setStudents] = useState([]);

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
      .filter((lesson) => lesson?.lessonDate)
      .map((lesson) => {
        const start = new Date(lesson.lessonDate);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);
  
        const student = students.find((s) => s.id === lesson.studentId);
  
        return {
          id: lesson.id,
          title: `${lesson.topic} (${student ? `${student.firstName} ${student.middleName} ${student.lastName}` : 'Ученик'})`,
          start,
          end,
          resource: lesson,
          backgroundColor: getColorByStudent(student),
        };
      });
  }, [lessons, students]);
  

  const handleSelectEvent = (event) => {
    redirect(`/lessons/${event.id}/show`);
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setModalOpen(true);
  };

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
          student: formData.student,
          isActual: 1,
        },
      },
      {
        onSuccess: ({ data }) => {
          console.log('Lesson created successfully:', data); // Лог успешного создания урока
          notify('Урок успешно добавлен', { type: 'success' });
          setLessons((prev) => [...prev, data]);
          setModalOpen(false);
          setFormData({ topic: '', student: '', time: '' });

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
                textAlign: 'center'
              }}>
                📅 Календарь уроков
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 80px)', padding: '1em' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        messages={{
          next: '→',
          previous: '←',
          today: 'Сегодня',
          month: 'Месяц',
          week: 'Неделя',
          day: 'День',
        }}
                style={{ 
                  height: '100%',
                  color: '#e5e7eb'
                }}
        views={['month', 'week', 'day']}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.backgroundColor,
            color: '#000',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
        })}
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
          </DialogTitle>
          <DialogContent sx={{ padding: '2em' }}>
          <TextField
            label="Тема"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
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
          />
          <TextField
            label="Ученик"
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
          <TextField
            label="Время"
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