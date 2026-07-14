import { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Link, Container, Alert } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import apiClient from '../../api/client';

export const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = await apiClient.post('/auth/login', {
        username: username,
        password: password,
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        setIsAuthenticated(true);
        setUserRole(response.data.role);

        if (response.data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/worker/dashboard');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center' }}>
        <Card sx={{ width: '100%', p: 4 }}>
          <Typography variant="h3" align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
            Safety App
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            Worker Login
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              disabled={loading}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              disabled={loading}
              required
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Link component={RouterLink} to="/register" underline="hover">
              Register
            </Link>
            <Link component={RouterLink} to="/forgot-password" underline="hover">
              Forgot Password?
            </Link>
          </Box>
        </Card>
      </Box>
    </Container>
  );
};
