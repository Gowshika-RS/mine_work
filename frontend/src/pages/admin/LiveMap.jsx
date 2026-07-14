import { Box, Card, CardContent, Typography } from '@mui/material';

export const LiveMap = () => {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Live Map
      </Typography>

      <Card sx={{ height: 600 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Live map with real-time worker locations will be integrated here
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
