import React, { useState, useEffect } from "react";
import './App.css';
import { useTranslate } from 'react-admin';
import { Admin, Resource } from 'react-admin';
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, Tabs, Tab, TextField, Button, Typography, InputAdornment, CircularProgress } from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useLogin, fetchUtils } from 'react-admin';
import { API_URL } from './config';
import { CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import dataProvider from './dataProvider';
import authProvider from './authProvider';
import i18nProvider from './i18nProvider';
import CustomLayout from './CustomLayout';
import Dashboard from './Dashboard';
import LoginRedirect from './LoginRedirect';

import CalendarPage from './calendar/CalendarPage';

import StudentList from './students/StudentList';
import StudentCreate from './students/StudentCreate';
import StudentEdit from './students/StudentEdit';
import StudentShow from './students/StudentShow';

import TeacherList from './teachers/TeacherList';
import TeacherCreate from './teachers/TeacherCreate';
import TeacherEdit from './teachers/TeacherEdit';
import TeacherShow from './teachers/TeacherShow';

import TariffList from './tariffs/TariffList';
import TariffCreate from './tariffs/TariffCreate';
import TariffEdit from './tariffs/TariffEdit';
import TariffShow from './tariffs/TariffShow';

import LessonList from './lesson/LessonList';
import LessonEdit from './lesson/LessonEdit';
import LessonShow from './lesson/LessonShow';
import LessonCreate from './lesson/LessonCreate';
import UserCreate from './users/UserCreate';

const LoginPage = () => {
  const translate = useTranslate();
  const login = useLogin();
  const [tab, setTab] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username: loginForm.email, password: loginForm.password });
    } catch (e) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetchUtils.fetchJson(`${API_URL}/users`, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }),
        body: JSON.stringify({
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          email: registerForm.email,
          password: registerForm.password,
          roles: [],
        }),
      });
      // After successful registration, automatically log in the user
      try {
        await login({ username: registerForm.email, password: registerForm.password });
        // Clear forms
        setRegisterForm({ firstName: '', lastName: '', email: '', password: '' });
        setLoginForm({ email: '', password: '' });
      } catch (loginError) {
        // If auto-login fails, switch to login tab with prefilled email
        setLoginForm({ email: registerForm.email, password: '' });
        setTab(0);
        setError('Registration successful! Please log in with your credentials.');
      }
    } catch (e) {
      const msg = e?.body?.message || e?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const appName = translate('app.name', { _: 'Smart platform for teachers and students' });
  if (typeof document !== 'undefined') {
    document.title = appName;
  }


  return (
    <Box sx={{
      p: 2,
    }}>
      <div className="auth-bg">
        <div className="blob blob--blue" />
        <div className="blob blob--green" />
        <div className="blob blob--purple" />
        <Card className="glass-card" sx={{ width: 460, borderRadius: 4, zIndex: 1 }}>
          <CardContent>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: 0.4, color: '#0f172a' }}>{appName}</Typography>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered textColor="inherit" TabIndicatorProps={{ className: 'tab-indicator' }}>
            <Tab icon={<LoginRoundedIcon sx={{ mr: 1 }} />} iconPosition="start" label="Sign In" />
            <Tab icon={<PersonAddAltRoundedIcon sx={{ mr: 1 }} />} iconPosition="start" label="Register" />
          </Tabs>
          {error && (
            <Typography color="error" variant="body2" align="center" sx={{ mt: 1 }}>{error}</Typography>
          )}
          {tab === 0 && (
            <Box component="form" onSubmit={onLoginSubmit} sx={{ mt: 2 }}>
              <TextField className="futuristic-input" fullWidth margin="normal" label="Email" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required InputProps={{ startAdornment: (<InputAdornment position="start"><EmailRoundedIcon /></InputAdornment>) }} />
              <TextField className="futuristic-input" fullWidth margin="normal" label="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required InputProps={{ startAdornment: (<InputAdornment position="start"><LockRoundedIcon /></InputAdornment>) }} />
              <Button className="neon-btn" type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 1 }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Typography align="center" variant="body2" sx={{ mt: 1 }}>
                New here? <Button onClick={() => setTab(1)} size="small">Create account</Button>
              </Typography>
            </Box>
          )}
          {tab === 1 && (
            <Box component="form" onSubmit={onRegisterSubmit} sx={{ mt: 2 }}>
              <TextField className="futuristic-input" fullWidth margin="normal" label="First name" value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} required InputProps={{ startAdornment: (<InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment>) }} />
              <TextField className="futuristic-input" fullWidth margin="normal" label="Last name" value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} required InputProps={{ startAdornment: (<InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment>) }} />
              <TextField className="futuristic-input" fullWidth margin="normal" label="Email" type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required InputProps={{ startAdornment: (<InputAdornment position="start"><EmailRoundedIcon /></InputAdornment>) }} />
              <TextField className="futuristic-input" fullWidth margin="normal" label="Password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required InputProps={{ startAdornment: (<InputAdornment position="start"><LockRoundedIcon /></InputAdornment>) }} />
              <Button className="neon-btn" type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 1 }}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
              <Typography align="center" variant="body2" sx={{ mt: 1 }}>
                Already have an account? <Button onClick={() => setTab(0)} size="small">Sign in</Button>
              </Typography>
            </Box>
          )}
          <Typography align="center" variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            <Link to="/register">Open standalone registration</Link>
          </Typography>
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh_token');
          setIsAuthenticated(false);
        }
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking
  if (isAuthenticated === null) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0f1021 0%, #1a1c3c 40%, #0b1026 100%)'
      }}>
        <CircularProgress sx={{ color: '#6366f1', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#e5e7eb' }}>Проверка аутентификации...</Typography>
      </Box>
    );
  }

  // Show login redirect if not authenticated
  if (!isAuthenticated) {
    return <LoginRedirect />;
  }

  // Show main app if authenticated
  return (
    <Admin 
      dashboard={Dashboard} 
      dataProvider={dataProvider} 
      authProvider={authProvider}
      layout={CustomLayout}
      i18nProvider={i18nProvider}
      loginPage={LoginPage}
    >
      <CustomRoutes>
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </CustomRoutes>
      <Resource
          name="students"
          options={{ label: 'resources.students.name' }}
          list={StudentList}
          create={StudentCreate}
          edit={StudentEdit}
          show={StudentShow}
      />
      <Resource
          name="teachers"
          list={TeacherList}
          create={TeacherCreate}
          edit={TeacherEdit}
          show={TeacherShow}
      />
      <Resource 
            name="tariffs" 
            list={TariffList} 
            create={TariffCreate} 
            edit={TariffEdit} 
            show={TariffShow} />
      <Resource
          name="lessons"
          list={LessonList}
          create={LessonCreate}
          edit={LessonEdit}
          show={LessonShow} />
      <Resource
          name="users"
          create={UserCreate}
      />
    </Admin>
  );
};

export default App;