import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import apiClient from '../../api/client';

export const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedRole = params.get('role');
    if (selectedRole && ['worker', 'supervisor', 'admin'].includes(selectedRole)) {
      setRole(selectedRole);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        username: cleanUsername,
        password: cleanPassword,
      });

      const userRoleFromBackend = response.data?.role;
      const accessToken = response.data?.access_token;

      if (!accessToken || !userRoleFromBackend) {
        setError('Invalid response received from authentication server.');
        setLoading(false);
        return;
      }

      // Store auth token and user object in local storage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));

      // Update parent React state
      if (setIsAuthenticated) setIsAuthenticated(true);
      if (setUserRole) setUserRole(userRoleFromBackend);

      // Target dashboard selection based on backend user role
      const targetPath =
        userRoleFromBackend === 'admin'
          ? '/admin/dashboard'
          : userRoleFromBackend === 'supervisor'
          ? '/supervisor/dashboard'
          : '/worker/dashboard';

      setLoading(false);
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Login failed. Incorrect username or password.'
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', py: 4 }}>
        <Card sx={{ width: '100%', p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Typography variant="h3" align="center" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
            MineGuard
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 3 }}>
            Offline Mine Worker Safety Companion
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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
              autoFocus
            />

            <FormControl fullWidth margin="normal" disabled={loading}>
              <InputLabel>Role Access</InputLabel>
              <Select value={role} label="Role Access" onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="worker">Worker</MenuItem>
                <MenuItem value="supervisor">Supervisor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

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
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, flexWrap: 'wrap', gap: 1 }}>
            <Link component={RouterLink} to="/register" underline="hover">
              Register New Account
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
