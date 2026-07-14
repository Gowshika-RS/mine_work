import { Box, Grid, Typography } from '@mui/material';
import { HazardReporter } from '../../components/HazardReporter';
import { HazardHistory } from '../../components/HazardHistory';

export const Hazards = () => {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Hazard Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <HazardReporter />
        </Grid>
        <Grid item xs={12} lg={7}>
          <HazardHistory />
        </Grid>
      </Grid>
    </Box>
  );
};
