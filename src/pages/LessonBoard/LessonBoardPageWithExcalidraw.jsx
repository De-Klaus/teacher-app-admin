import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Box, Stack, Typography, IconButton, Alert, Snackbar } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Excalidraw } from '@excalidraw/excalidraw';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API_URL } from '../../config';
import { AUTH_TOKEN_KEY } from '../../config';

export default function LessonBoardPageWithExcalidraw() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const excalidrawRef = useRef(null);
  
  // Состояние компонента
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // WebSocket соединение
  const stompClientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Показать уведомление
  const showSnackbar = useCallback((message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }, []);

  // Подключение к WebSocket
  const connectWebSocket = useCallback(() => {
    if (!lessonId) return;

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.error('No authentication token found');
        setError('Требуется авторизация для подключения к WebSocket');
        return;
      }

      //console.log(`Connecting to WebSocket for lesson ${lessonId}`);
      
      const socket = new SockJS(`${API_URL}/ws-board`);
      const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => console.log('STOMP:', str),
        reconnectDelay: 5000,
        onConnect: (frame) => {
          //console.log('✅ Connected to WebSocket:', frame);
          setIsConnected(true);
          showSnackbar('WebSocket подключен');
          
          // Подписываемся на обновления доски
          const topic = `/topic/lessons/${lessonId}/board`;
          stompClient.subscribe(topic, (message) => {
            try {
              const data = JSON.parse(message.body);
              //console.log('📩 Received board update:', data);
              
              // Обновляем Excalidraw с полученными данными
              if (excalidrawRef.current && data.elements) {
                excalidrawRef.current.updateScene({ 
                  elements: data.elements,
                  appState: data.appState || {}
                });
              }
            } catch (err) {
              console.error('Error parsing WebSocket message:', err);
            }
          });
          
          stompClientRef.current = stompClient;
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame.headers['message']);
          setIsConnected(false);
          setError('Ошибка подключения к WebSocket: ' + frame.headers['message']);
          showSnackbar('Ошибка подключения к WebSocket');
        },
        onWebSocketClose: () => {
          console.warn('⚠️ WebSocket disconnected');
          setIsConnected(false);
          showSnackbar('WebSocket отключен');
        },
      });

      stompClient.activate();
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setError('Ошибка подключения к WebSocket');
      showSnackbar('Ошибка подключения к WebSocket');
    }
  }, [lessonId, showSnackbar]);

  // Отключение от WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.disconnect();
      stompClientRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  }, []);

  // Обработка изменений в Excalidraw
  const handleExcalidrawChange = useCallback((elements, appState) => {
    // Отправляем изменения через WebSocket
    if (!isConnected || !lessonId || !stompClientRef.current) return;

    try {
      const updateData = {
        lessonId: parseInt(lessonId),
        elements,
        appState,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId') || 'anonymous'
      };

      // Отправляем через STOMP на сервер
      stompClientRef.current.publish({
        destination: `/app/lessons/${lessonId}/board`,
        body: JSON.stringify(elements), // Отправляем только elements для совместимости с бэкендом
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });

      //console.log('📤 Sent WebSocket update:', updateData);
    } catch (error) {
      console.error('WebSocket send error:', error);
    }
  }, [isConnected, lessonId]);

  // Сохранение доски
  const handleSave = useCallback(async () => {
    if (!excalidrawRef.current || !lessonId) return;

    setIsSaving(true);
    setError(null);

    try {
      const elements = excalidrawRef.current.getSceneElements();
      
      const response = await fetch(`${API_URL}/api/lessons/${lessonId}/board/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
        },
        body: JSON.stringify(elements)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setLastSaved(new Date());
      showSnackbar('Доска успешно сохранена!');
    } catch (error) {
      console.error('Save error:', error);
      setError('Ошибка при сохранении доски');
      showSnackbar('Ошибка при сохранении доски');
    } finally {
      setIsSaving(false);
    }
  }, [lessonId, showSnackbar]);

  // Загрузка доски
  const handleLoad = useCallback(async () => {
    if (!lessonId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/lessons/${lessonId}/board/load`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const elements = await response.json();
      
      if (excalidrawRef.current && elements) {
        excalidrawRef.current.updateScene({ elements });
        showSnackbar('Доска загружена');
      }
    } catch (error) {
      console.error('Load error:', error);
      setError('Ошибка при загрузке доски');
      showSnackbar('Ошибка при загрузке доски');
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, showSnackbar]);

  // Эффекты
  useEffect(() => {
    if (lessonId) {
      connectWebSocket();
      handleLoad();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [lessonId]); // Убираем функции из зависимостей, чтобы избежать бесконечного цикла

  if (!lessonId) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">
          ID урока не найден. Пожалуйста, перейдите к уроку и откройте доску оттуда.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', position: 'relative' }}>
      {/* Заголовок */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 16px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={() => navigate('/lesson-work')}
            sx={{ color: '#1976d2' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
            Урок #{lessonId} - Интерактивная доска
          </Typography>
          {lastSaved && (
            <Typography variant="caption" sx={{ color: '#666' }}>
              Сохранено: {lastSaved.toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Статус подключения */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: isConnected ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {isConnected ? <WifiIcon fontSize="small" /> : <WifiOffIcon fontSize="small" />}
        {isConnected ? 'WebSocket подключен' : 'WebSocket отключен'}
      </Box>

      {/* Кнопки управления */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Stack>
      </Box>

      {/* Ошибки */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Excalidraw доска */}
      <Box sx={{ height: '100vh', width: '100vw' }}>
        <Excalidraw
          ref={excalidrawRef}
          onChange={handleExcalidrawChange}
          theme="light"
          name={`Lesson ${lessonId} Board`}
        />
      </Box>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
