import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';

const COLORS = ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0', '#00bcd4'];

export const SupervisorSafetyAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get('/supervisor/analytics/summary');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Safety Analytics & Intelligence</Typography>
          <Typography variant="body2" color="text.secondary">Historical trend analytics, gas exposure metrics & risk distributions</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAnalytics}>Refresh Analytics</Button>
      </Box>

      <Grid container spacing={3}>
        {/* Daily Incidents Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Daily Incidents (Last 7 Days)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.daily_incidents || []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="incidents" fill="#e91e63" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Safety Score Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Worker Safety Score Distribution</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.safety_score_distribution || []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="workers" fill="#4caf50" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gas Trend */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Gas Exposure Trend (ppm)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data?.gas_trend || []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="methane" stroke="#ff9800" strokeWidth={2} name="Methane (CH₄)" />
                  <Line type="monotone" dataKey="co" stroke="#f44336" strokeWidth={2} name="Carbon Monoxide (CO)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Near Miss Analysis */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Hazard / Near Miss Categorization</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={data?.near_miss_analysis || []} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {(data?.near_miss_analysis || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
