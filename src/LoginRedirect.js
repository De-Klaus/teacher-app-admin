import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, TextField, Button, InputAdornment } from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { fetchUtils } from 'react-admin';
import { API_URL } from './config';
import './App.css';

const LoginRedirect = () => {
  const [tab, setTab] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const customLogin = async (email, password) => {
    const response = await fetchUtils.fetchJson(`${API_URL}/auth/sign-in`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }),
    });
    const { token, refreshToken } = response.json;
    if (token) {
      localStorage.setItem('auth_token', token);
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken);
      }
      // Reload the page to trigger authentication check
      window.location.reload();
    } else {
      throw new Error('No token received');
    }
  };

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await customLogin(loginForm.email, loginForm.password);
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
        await customLogin(registerForm.email, registerForm.password);
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

  const appName = 'Smart platform for teachers and students';
  if (typeof document !== 'undefined') {
    document.title = appName;
  }

  return (
    <Box sx={{ p: 0 }}>
      <div className="auth-bg">
        <div className="blob blob--blue" />
        <div className="blob blob--green" />
        <div className="blob blob--purple" />
        <Card className="glass-card" sx={{ width: 480, borderRadius: 4, zIndex: 1 }}>
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
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};

export default LoginRedirect;
