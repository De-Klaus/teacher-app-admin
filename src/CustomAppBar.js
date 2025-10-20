import React from 'react';
import { AppBar } from 'react-admin';
import { Box, Typography } from '@mui/material';

const CustomAppBar = (props) => (
  <AppBar 
    {...props} 
    userMenu={false}
    sx={{
      background: 'linear-gradient(135deg, rgba(11, 16, 38, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
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
      },
      '& .RaAppBar-menuButton': {
        display: 'none'
      },
      '& .RaAppBar-title': {
        color: '#e5e7eb',
        fontWeight: 700,
        fontSize: '1.5em',
        letterSpacing: '1px',
        textShadow: '0 0 20px rgba(99, 102, 241, 0.6)',
        marginLeft: '1em',
      }
    }}
  >
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '0 2em',
    }}>
      <Typography variant="h6" sx={{
        color: '#e5e7eb',
        fontWeight: 700,
        fontSize: '1.5em',
        letterSpacing: '1px',
        textShadow: '0 0 20px rgba(99, 102, 241, 0.6)',
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


