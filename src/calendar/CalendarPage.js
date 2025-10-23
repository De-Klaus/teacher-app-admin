import { useEffect, useState, useCallback } from 'react';
import { useDataProvider } from 'react-admin';
import { Box, Card, CardContent, Typography } from '@mui/material';
import LessonCalendar from './LessonCalendar';
import GoogleCalendarSync from './GoogleCalendarSync';
import FuturisticBackground from '../components/FuturisticBackground';

const CalendarPage = () => {
  const dataProvider = useDataProvider();
  const [events, setEvents] = useState([]);

  const loadLessons = useCallback(() => {
    dataProvider.getList('lessons', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'lessonDate', order: 'ASC' },
      filter: {},
    }).then(({ data }) => {
  
      // Форматируем данные для календаря
      const formatted = data.map(lesson => {
        const startDate = new Date(lesson.lessonDate);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // добавляем 1 час на конец события
        return {
          id: lesson.id,
          title: lesson.topic || `Урок ${lesson.id}`,
          start: startDate,
          end: endDate,
          resource: lesson, // Сохраняем оригинальные данные
        };
      });
  
      setEvents(formatted);
    }).catch(err => console.error('Error fetching lessons:', err));
  }, [dataProvider]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Обработчик успешной синхронизации
  const handleSyncComplete = useCallback(() => {
    // Перезагружаем уроки после синхронизации
    loadLessons();
  }, [loadLessons]);

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
            📅 Календарь уроков
          </Typography>
        </Box>

        {/* Google Calendar Sync */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          marginBottom: '2em',
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ 
              color: '#e5e7eb', 
              fontWeight: 700,
              marginBottom: '1em' 
            }}>
              🔗 Синхронизация с Google Calendar
            </Typography>
            <GoogleCalendarSync onSyncComplete={handleSyncComplete} />
          </CardContent>
        </Card>

        {/* Calendar */}
        <LessonCalendar events={events} />
      </Box>
    </FuturisticBackground>
  );
};

export default CalendarPage;