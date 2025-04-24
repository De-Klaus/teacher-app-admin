import { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';
import LessonCalendar from './LessonCalendar';

const CalendarPage = () => {
  const dataProvider = useDataProvider();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    dataProvider.getList('lessons', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'lessonDate', order: 'ASC' },
      filter: {},
    }).then(({ data }) => {
      console.log('Fetched data:', data);
  
      // Форматируем данные для календаря
      const formatted = data.map(lesson => {
        const startDate = new Date(lesson.lessonDate);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // добавляем 1 час на конец события
        return {
          id: lesson.id,
          title: lesson.topic || `Урок ${lesson.id}`,
          start: startDate,
          end: endDate,
        };
      });
  
      console.log('Formatted events:', formatted);  // Логируем для отладки
      setEvents(formatted);
    }).catch(err => console.error('Error fetching lessons:', err));
  }, [dataProvider]);

  return <LessonCalendar events={events} />;
};

export default CalendarPage;