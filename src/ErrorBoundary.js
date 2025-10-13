import React from 'react';
import { Alert, Box, Typography, Button } from '@mui/material';
import { useTranslate } from 'react-admin';

const ErrorBoundary = ({ error, resetError }) => {
  const translate = useTranslate();

  const getErrorTitle = (errorMessage) => {
    if (errorMessage.includes('Access denied')) {
      return 'Access Denied';
    } else if (errorMessage.includes('Authentication failed')) {
      return 'Authentication Error';
    } else if (errorMessage.includes('Server error')) {
      return 'Server Error';
    } else if (errorMessage.includes('Not found')) {
      return 'Not Found';
    } else if (errorMessage.includes('Client error')) {
      return 'Request Error';
    }
    return 'Error';
  };

  const getErrorSeverity = (errorMessage) => {
    if (errorMessage.includes('Access denied')) {
      return 'warning';
    } else if (errorMessage.includes('Authentication failed')) {
      return 'error';
    } else if (errorMessage.includes('Server error')) {
      return 'error';
    } else if (errorMessage.includes('Not found')) {
      return 'info';
    } else if (errorMessage.includes('Client error')) {
      return 'warning';
    }
    return 'error';
  };

  const getActionButton = (errorMessage) => {
    if (errorMessage.includes('Authentication failed')) {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.href = '/login'}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      );
    } else if (errorMessage.includes('Server error') || errorMessage.includes('Client error')) {
      return (
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={resetError}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      );
    }
    return null;
  };

  if (!error) return null;

  const errorMessage = error.message || error.toString();
  const title = getErrorTitle(errorMessage);
  const severity = getErrorSeverity(errorMessage);
  const actionButton = getActionButton(errorMessage);

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
      <Alert severity={severity} sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1">
          {errorMessage}
        </Typography>
        {actionButton}
      </Alert>
    </Box>
  );
};

export default ErrorBoundary;

