import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#8b5cf6',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
      primary: '#e5e7eb',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#e5e7eb',
    },
    h2: {
      fontWeight: 700,
      color: '#e5e7eb',
    },
    h3: {
      fontWeight: 700,
      color: '#e5e7eb',
    },
    h4: {
      fontWeight: 700,
      color: '#e5e7eb',
    },
    h5: {
      fontWeight: 700,
      color: '#e5e7eb',
    },
    h6: {
      fontWeight: 700,
      color: '#e5e7eb',
    },
    body1: {
      color: '#e5e7eb',
    },
    body2: {
      color: '#9ca3af',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
          color: '#0b1026',
          fontWeight: 700,
          borderRadius: '12px',
          textTransform: 'none',
          transition: 'transform 0.15s ease, filter 0.15s ease',
          '&:hover': {
            transform: 'translateY(-1px) scale(1.01)',
            filter: 'brightness(1.05)',
          },
        },
        outlined: {
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#e5e7eb',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#e5e7eb',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.15)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.15)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(99, 102, 241, 0.5)',
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(99, 102, 241, 0.6)',
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px',
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#e5e7eb',
            fontWeight: 700,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#e5e7eb',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: '#e5e7eb',
          borderRadius: '8px',
          margin: '4px 8px',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.2)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
            color: '#0b1026',
            fontWeight: 700,
          },
        },
      },
    },
  },
});

export default theme;
