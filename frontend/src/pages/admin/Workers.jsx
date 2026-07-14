import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment, Chip } from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';
import { useState } from 'react';

export const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Manufacturing', status: 'active', safetyScore: 92 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Warehouse', status: 'active', safetyScore: 88 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', department: 'Maintenance', status: 'inactive', safetyScore: 76 },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', department: 'Manufacturing', status: 'active', safetyScore: 95 },
  ]);

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Workers Management
        </Typography>
        <Button variant="contained">Add Worker</Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
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
                <TableCell>{worker.name}</TableCell>
                <TableCell>{worker.email}</TableCell>
                <TableCell>{worker.department}</TableCell>
                <TableCell>
                  <Chip
                    label={worker.status}
                    color={worker.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{worker.safetyScore}%</TableCell>
                <TableCell>
                  <Button size="small" startIcon={<Edit />} />
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
