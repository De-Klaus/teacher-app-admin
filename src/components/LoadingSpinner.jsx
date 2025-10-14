import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ text = 'Загрузка...' }) => (
  <Box sx={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #0f1021 0%, #1a1c3c 40%, #0b1026 100%)'
  }}>
    <CircularProgress sx={{ color: '#6366f1', mb: 2 }} />
    <Typography variant="h6" sx={{ color: '#e5e7eb' }}>{text}</Typography>
  </Box>
);

export default LoadingSpinner;


