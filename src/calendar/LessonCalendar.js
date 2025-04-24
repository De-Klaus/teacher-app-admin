import React, { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
} from 'react-big-calendar';
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

const LessonCalendar = ({ initialLessons = [] }) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const dataProvider = useDataProvider();
  const [lessons, setLessons] = useState(initialLessons);

  useEffect(() => {
    // Загружаем уроки с сервера (можно убрать, если данные уже передаются через props)
    dataProvider.getList('lessons', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'lessonDate', order: 'ASC' },
      filter: {},
    }).then(({ data }) => {
      setLessons(data);
    });
  }, [dataProvider]);

  // преобразование данных в события
  const events = useMemo(() => {
    return lessons.map((lesson) => {
      const start = new Date(lesson.lessonDate);
      const end = new Date(lesson.lessonDate);
      end.setHours(start.getHours() + 1); // Добавляем 1 час к событию

      return {
        id: lesson.id,
        title: lesson.topic || 'Урок',
        start,
        end,
        resource: lesson,
      };
    });
  }, [lessons]);

  const handleSelectEvent = (event) => {
    redirect(`/lessons/${event.id}/show`);
  };

  const handleSelectSlot = ({ start }) => {
    const date = start.toISOString().split('T')[0];
    const topic = prompt('Введите тему урока:');
    if (!topic) return;

    // создание урока
    create(
      'lessons',
      {
        data: {
          lessonDate: date,
          topic,
          isActual: 1,
        },
      },
      {
        onSuccess: ({ data }) => {
          notify('Урок успешно добавлен', { type: 'success' });
          setLessons((prev) => [...prev, data]);
        },
        onError: (error) => {
          console.error(error);
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
      />
    </div>
  );
};

export default LessonCalendar;
