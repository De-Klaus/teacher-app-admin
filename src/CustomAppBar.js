import React from 'react';
import { AppBar } from 'react-admin';
import { Box, Typography } from '@mui/material';

const CustomAppBar = (props) => (
  <AppBar 
    {...props} 
    userMenu={false}
    sx={{
      background: 'linear-gradient(135deg, rgba(11, 16, 38, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
      '& .MuiToolbar-root': {
        minHeight: 48,
        paddingLeft: '12px',
        paddingRight: '12px',
      },
      // '& .RaAppBar-menuButton': {
      //   display: 'none'
      // },
      '& .RaRefreshButton-root': {   // скрываем кнопку обновления
      display: 'none'
      },
      '& .RaAppBar-title': {
        color: '#e5e7eb',
        fontWeight: 700,
        fontSize: '1.25em',
        letterSpacing: '1px',
        textShadow: '0 0 14px rgba(99, 102, 241, 0.5)',
        marginLeft: '0.5em',
      }
    }}
  >
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: 0,
    }}>
      <Typography variant="h6" sx={{
        color: '#e5e7eb',
        fontWeight: 700,
        fontSize: '1.25em',
        letterSpacing: '1px',
        textShadow: '0 0 14px rgba(99, 102, 241, 0.5)',
        '& .rocket': {
          color: '#f59e0b',
          textShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
        }
      }}>
        <span className="rocket">🚀</span> Smart Platform
      </Typography>
    </Box>
  </AppBar>
);

export default CustomAppBar;


