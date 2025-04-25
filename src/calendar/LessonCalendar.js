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

  // Преобразование данных в события
  const events = useMemo(() => {
    return lessons
      .filter((lesson) => lesson?.lessonDate)
      .map((lesson) => {
        const start = new Date(lesson.lessonDate);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);

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
    const topic = prompt('Введите тему урока:');
    if (!topic) return;

    // Сохраняем дату как локальное время без временной зоны
    const localStartDate = new Date(start);
    localStartDate.setMinutes(localStartDate.getMinutes() - localStartDate.getTimezoneOffset()); // Преобразуем в локальное время

    const lessonDate = localStartDate.toISOString(); // сохраняем полную дату-время в ISO формате

    create(
      'lessons',
      {
        data: {
          lessonDate,
          topic,
          isActual: 1,
        },
      },
      {
        onSuccess: ({ data }) => {
          notify('Урок успешно добавлен', { type: 'success' });
          setLessons((prev) => [...prev, data]);

          // Обновляем список уроков
          dataProvider.getList('lessons', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'lessonDate', order: 'ASC' },
            filter: {},
          }).then(({ data }) => {
            setLessons(data);
          });

          redirect('/calendar'); // редирект обратно в календарь
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