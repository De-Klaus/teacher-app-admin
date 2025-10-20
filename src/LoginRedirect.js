import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, TextField, Button, InputAdornment } from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './AuthContext';
import { API_URL } from './config';
import './App.css';

const LoginRedirect = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation();
  // const from = location.state?.from?.pathname || '/';

  const [tab, setTab] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/sign-in`, {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.token) throw new Error(data?.message || 'Invalid credentials');
      // Save via AuthContext
      await login(data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // Auto-login after successful registration
      const signInRes = await fetch(`${API_URL}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerForm.email, password: registerForm.password }),
      });
      const signInData = await signInRes.json();
      if (!signInRes.ok || !signInData?.token) throw new Error(signInData?.message || 'Login failed');
      await login(signInData.token);
      navigate('/', { replace: true });

        setRegisterForm({ firstName: '', lastName: '', email: '', password: '' });
        setLoginForm({ email: '', password: '' });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
              Smart platform for teachers and students
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered textColor="inherit" TabIndicatorProps={{ className: 'tab-indicator' }}>
              <Tab icon={<LoginRoundedIcon sx={{ mr: 1 }} />} iconPosition="start" label="Sign In" />
              <Tab icon={<PersonAddAltRoundedIcon sx={{ mr: 1 }} />} iconPosition="start" label="Register" />
            </Tabs>

            {error && <Typography color="error" align="center">{error}</Typography>}

            {tab === 0 && (
              <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
                <TextField fullWidth label="Email" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon /></InputAdornment> }} />
                <TextField fullWidth label="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><LockRoundedIcon /></InputAdornment> }} />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Sign In</Button>
              </Box>
            )}

            {tab === 1 && (
              <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
                <TextField fullWidth label="First name" value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment> }} />
                <TextField fullWidth label="Last name" value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment> }} />
                <TextField fullWidth label="Email" type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon /></InputAdornment> }} />
                <TextField fullWidth label="Password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><LockRoundedIcon /></InputAdornment> }} />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Register</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};

export default LoginRedirect;
