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
} from '@mui/material';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNotify, useRedirect, useCreate, useDataProvider } from 'react-admin';

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
    <div style={{ height: '80vh', padding: '1em' }}>
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
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.backgroundColor,
            color: '#000',
          },
        })}
      />

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Добавить урок</DialogTitle>
        <DialogContent>
          <TextField
            label="Тема"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Ученик"
            select
            value={formData.student}
            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
            fullWidth
            margin="normal"
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Сохранить
          </Button>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LessonCalendar;