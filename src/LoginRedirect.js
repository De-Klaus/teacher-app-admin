import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, TextField, Button, InputAdornment } from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './AuthContext';
import { API_URL } from './config';
import './App.css';

const LoginRedirect = () => {
  const { login } = useAuth(); // Используем AuthContext
  const [tab, setTab] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ===================== LOGIN =====================
  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginForm.email, loginForm.password); // login через AuthContext
    } catch (err) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // ===================== REGISTER =====================
  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      // После успешной регистрации — автоматически логиним пользователя
      await login(registerForm.email, registerForm.password);

      // Сбрасываем формы
      setRegisterForm({ firstName: '', lastName: '', email: '', password: '' });
      setLoginForm({ email: '', password: '' });

    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const appName = 'Smart platform for teachers and students';
  if (typeof document !== 'undefined') document.title = appName;

  if (loading) return <LoadingSpinner text="Processing..." />;

  return (
    <Box sx={{ p: 0 }}>
      <div className="auth-bg">
        <div className="blob blob--blue" />
        <div className="blob blob--green" />
        <div className="blob blob--purple" />
        <Card className="glass-card" sx={{ width: 480, borderRadius: 4, zIndex: 1 }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 800, color: '#0f172a' }}>
              {appName}
            </Typography>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              centered
              textColor="inherit"
              TabIndicatorProps={{ className: 'tab-indicator' }}
            >
              <Tab icon={<LoginRoundedIcon sx={{ mr: 1 }} />} iconPosition="start" label="Sign In" />
              <Tab icon={<PersonAddAltRoundedIcon sx={{ mr: 1 }} />} iconPosition="start" label="Register" />
            </Tabs>

            {error && (
              <Typography color="error" variant="body2" align="center" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            {tab === 0 && (
              <Box component="form" onSubmit={onLoginSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon /></InputAdornment> }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockRoundedIcon /></InputAdornment> }}
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>
                  Sign In
                </Button>
              </Box>
            )}

            {tab === 1 && (
              <Box component="form" onSubmit={onRegisterSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="First name"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment> }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Last name"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment> }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon /></InputAdornment> }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockRoundedIcon /></InputAdornment> }}
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>
                  Register
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};

export default LoginRedirect;
