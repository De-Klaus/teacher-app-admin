import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useDataProvider, useNotify } from 'react-admin';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useUser } from '../contexts/UserContext';

const GoogleCalendarSync = ({ onSyncComplete }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { getUserId } = useUser();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [error, setError] = useState(null);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  // Проверка подключения к Google
  const checkConnection = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setIsChecking(false);
      return;
    }

    try {
      setIsChecking(true);
      const result = await dataProvider.checkGoogleConnection(userId);
      setIsConnected(result.connected || false);
      if (result.lastSync) {
        setLastSyncTime(new Date(result.lastSync));
      }
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  }, [dataProvider, getUserId]);

  // Синхронизация календаря
  const handleSync = async () => {
    const userId = getUserId();
    if (!userId) {
      notify('Ошибка: пользователь не авторизован', { type: 'error' });
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const events = await dataProvider.syncGoogleCalendar(userId);
      
      setLastSyncTime(new Date());
      notify(`Синхронизировано событий: ${events.length || 0}`, { type: 'success' });
      
      // Вызываем callback для обновления календаря
      if (onSyncComplete) {
        onSyncComplete(events);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setError(error.message || 'Ошибка синхронизации');
      notify('Ошибка синхронизации с Google Calendar', { type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Отключение Google аккаунта
  const handleDisconnect = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      await dataProvider.disconnectGoogle(userId);
      setIsConnected(false);
      setLastSyncTime(null);
      notify('Google аккаунт отключен', { type: 'success' });
      setDisconnectDialogOpen(false);
    } catch (error) {
      console.error('Disconnect error:', error);
      notify('Ошибка отключения Google аккаунта', { type: 'error' });
    }
  };

  // Автоматическая синхронизация каждые 10 минут
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        handleSync();
      }, 10 * 60 * 1000); // 10 минут

      return () => clearInterval(interval);
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Проверка подключения при монтировании
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  if (isChecking) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography sx={{ color: '#9ca3af' }}>
          Проверка подключения к Google...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ marginBottom: '1em' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* Статус подключения */}
        <Chip
          icon={isConnected ? <CloudDoneIcon /> : <CloudOffIcon />}
          label={isConnected ? 'Google подключен' : 'Google не подключен'}
          color={isConnected ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />

        {/* Время последней синхронизации */}
        {lastSyncTime && (
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            Последняя синхронизация: {lastSyncTime.toLocaleString('ru-RU')}
          </Typography>
        )}

        {/* Кнопки */}
        {isConnected ? (
          <>
            <Button
              variant="contained"
              startIcon={isSyncing ? <CircularProgress size={16} /> : <SyncIcon />}
              onClick={handleSync}
              disabled={isSyncing}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                color: '#0b1026',
                fontWeight: 700,
                borderRadius: '12px',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  filter: 'brightness(1.05)',
                },
                '&:disabled': {
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: '#6b7280',
                },
              }}
            >
              {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<LinkOffIcon />}
              onClick={() => setDisconnectDialogOpen(true)}
              sx={{
                color: '#ef4444',
                borderColor: '#ef4444',
                borderRadius: '12px',
                '&:hover': {
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderColor: '#dc2626',
                },
              }}
            >
              Отключить
            </Button>
          </>
        ) : (
          <GoogleLoginButton />
        )}
      </Box>

      {/* Информационное сообщение */}
      {!isConnected && (
        <Alert severity="info" sx={{ marginTop: '1em' }}>
          Подключите Google аккаунт для автоматической синхронизации событий календаря
        </Alert>
      )}

      {/* Диалог подтверждения отключения */}
      <Dialog 
        open={disconnectDialogOpen} 
        onClose={() => setDisconnectDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ color: '#e5e7eb' }}>
          Отключить Google аккаунт?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#9ca3af' }}>
            После отключения автоматическая синхронизация с Google Calendar будет остановлена.
            Вы сможете подключить аккаунт заново в любое время.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDisconnectDialogOpen(false)}
            sx={{ color: '#9ca3af' }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDisconnect}
            variant="contained"
            sx={{
              background: '#ef4444',
              '&:hover': { background: '#dc2626' }
            }}
          >
            Отключить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoogleCalendarSync;

