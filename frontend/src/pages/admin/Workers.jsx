import { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment, Chip, Alert, CircularProgress } from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { toWorkerRows } from './adminData';

export const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const response = await apiClient.get('/admin/workers');
        setWorkers(toWorkerRows(response.data));
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load workers');
      } finally {
        setLoading(false);
      }
    };

    loadWorkers();
  }, []);

  const filteredWorkers = useMemo(() => workers.filter((worker) => {
    const haystack = `${worker.fullName} ${worker.email} ${worker.department}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  }), [workers, searchTerm]);

  const handleDelete = async (id) => {
    try {
      await apiClient.put(`/admin/workers/${id}/status?is_active=false`);
      setWorkers((prev) => prev.map((worker) => worker.id === id ? { ...worker, status: 'inactive' } : worker));
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update worker');
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Workers Management
        </Typography>
        <Button variant="contained" onClick={() => navigate('/admin/worker-details')}>View Details</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Safety Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell>{worker.fullName}</TableCell>
                <TableCell>{worker.email}</TableCell>
                <TableCell>{worker.department}</TableCell>
                <TableCell>
                  <Chip
                    label={worker.status}
                    color={worker.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{worker.safetyScore.toFixed(1)}%</TableCell>
                <TableCell>
                  <Button size="small" startIcon={<Edit />} onClick={() => navigate('/admin/worker-details')} />
                  <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(worker.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
