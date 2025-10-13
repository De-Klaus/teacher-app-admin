import React from 'react';
import { Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { fetchUtils } from 'react-admin';
import { API_URL } from '../config';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // minimal payload without roles; roles can be assigned later in admin
      await fetchUtils.fetchJson(`${API_URL}/users`, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }),
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          roles: [],
        }),
      });
      navigate('/');
    } catch (e) {
      const msg = e?.body?.message || e?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Register</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth margin="normal" label="First name" name="firstName" value={form.firstName} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Last name" name="lastName" value={form.lastName} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Button component={RouterLink} to="/" fullWidth sx={{ mt: 1 }}>Back to Sign in</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;


