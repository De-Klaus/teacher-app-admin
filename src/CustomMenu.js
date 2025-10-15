import * as React from 'react';
import { MenuItemLink, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Box, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';

const CustomMenu = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, rgba(11, 16, 38, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0 16px 16px 0',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
        zIndex: -1,
      }
    }}>
      {/* Header */}
      <Box sx={{
        padding: '2em 1em',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)',
      }}>
        <Typography variant="h6" sx={{
          color: '#e5e7eb',
          fontWeight: 700,
          fontSize: '1.1em',
          letterSpacing: '0.5px',
          textShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
        }}>
          🚀 Smart Platform
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ padding: '1em 0', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        {/* Dashboard */}
        <Box sx={{ marginBottom: '1.5em' }}>
          <MenuItemLink
            to="/"
            primaryText={translate('menu.dashboard')}
            leftIcon={<DashboardIcon sx={{ color: '#6366f1' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 600,
              padding: '12px 1em',
              margin: '4px 0',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              },
            }}
          />
        </Box>

        {/* Users Section */}
        <Box sx={{ marginBottom: '1.5em' }}>
          <Typography variant="subtitle2" sx={{
            color: '#9ca3af',
            fontWeight: 600,
            padding: '0 1em',
            marginBottom: '0.5em',
            fontSize: '0.85em',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            👥 {translate('menu.users')}
          </Typography>
          
          <MenuItemLink
            to="/students"
            primaryText={translate('resources.students.name')}
            leftIcon={<PeopleIcon sx={{ color: '#10b981' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(16, 185, 129, 0.15)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              },
            }}
          />
          
          <MenuItemLink
            to="/teachers"
            primaryText={translate('resources.teachers.name')}
            leftIcon={<PeopleIcon sx={{ color: '#f59e0b' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              },
            }}
          />

          <MenuItemLink
            to="/users/create"
            primaryText={translate('menu.registerUser') || 'Register User'}
            leftIcon={<PersonAddAltIcon sx={{ color: '#8b5cf6' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(139, 92, 246, 0.15)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
              },
            }}
          />
        </Box>

        {/* Lessons Section */}
        <Box sx={{ marginBottom: '1.5em' }}>
          <Typography variant="subtitle2" sx={{
            color: '#9ca3af',
            fontWeight: 600,
            padding: '0 1em',
            marginBottom: '0.5em',
            fontSize: '0.85em',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            🎓 {translate('menu.lessons')}
          </Typography>
          
          <MenuItemLink
            to="/tariffs"
            primaryText={translate('resources.tariffs.name')}
            leftIcon={<BookIcon sx={{ color: '#ef4444' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              },
            }}
          />
          
          <MenuItemLink
            to="/calendar"
            primaryText={translate('menu.calendar')}
            leftIcon={<EventIcon sx={{ color: '#06b6d4' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(6, 182, 212, 0.15)',
                borderColor: 'rgba(6, 182, 212, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
              },
            }}
          />
          
          <MenuItemLink
            to="/lessons"
            primaryText={translate('menu.lesson')}
            leftIcon={<SchoolIcon sx={{ color: '#84cc16' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(132, 204, 22, 0.05)',
              border: '1px solid rgba(132, 204, 22, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(132, 204, 22, 0.15)',
                borderColor: 'rgba(132, 204, 22, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(132, 204, 22, 0.2)',
              },
            }}
          />
          
          <MenuItemLink
            to="/lesson-work"
            primaryText={translate('menu.lessonWork')}
            leftIcon={<WorkIcon sx={{ color: '#f97316' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(249, 115, 22, 0.05)',
              border: '1px solid rgba(249, 115, 22, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(249, 115, 22, 0.15)',
                borderColor: 'rgba(249, 115, 22, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
              },
            }}
          />
          
          <MenuItemLink
            to="/student-create"
            primaryText="Создать ученика"
            leftIcon={<PersonAddAltIcon sx={{ color: '#8b5cf6' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(139, 92, 246, 0.15)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
              },
            }}
          />
        </Box>

        {/* Settings Section */}
        <Box>
          <Typography variant="subtitle2" sx={{
            color: '#9ca3af',
            fontWeight: 600,
            padding: '0 1em',
            marginBottom: '0.5em',
            fontSize: '0.85em',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            ⚙️ {translate('menu.settings')}
          </Typography>
          
          <MenuItemLink
            to="/settings"
            primaryText={translate('menu.settings')}
            leftIcon={<SettingsIcon sx={{ color: '#6b7280' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(107, 114, 128, 0.05)',
              border: '1px solid rgba(107, 114, 128, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(107, 114, 128, 0.15)',
                borderColor: 'rgba(107, 114, 128, 0.3)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(107, 114, 128, 0.2)',
              },
            }}
          />

          <MenuItemLink
            to="/login"
            onClick={(e) => {
              e.preventDefault();
              logout();
              navigate('/login', { replace: true });
            }}
            primaryText={translate('ra.auth.logout')}
            leftIcon={<LogoutIcon sx={{ color: '#ef4444' }} />}
            sx={{
              color: '#e5e7eb',
              fontWeight: 500,
              padding: '10px 1em',
              margin: '2px 0',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CustomMenu;
