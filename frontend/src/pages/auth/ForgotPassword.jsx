import { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Link, Container, Alert } from '@mui/material';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        setError('Please enter your email');
        return;
      }
      // TODO: Replace with actual API call
      console.log('Password reset requested for:', email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Request failed');
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
            Reset Password
          </Typography>

          {submitted ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Check your email for password reset instructions
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  disabled={loading}
                  sx={{ mb: 3 }}
                  helperText="Enter your registered email address"
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link href="/login" underline="hover">
              Back to Login
            </Link>
          </Box>
        </Card>
      </Box>
    </Container>
  );
};
