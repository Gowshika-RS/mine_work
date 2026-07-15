import { Box, Typography } from '@mui/material';
import { RiskLevelCard } from '../../components/RiskLevelCard';

export const RiskAnalysis = () => {
  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Worker Risk Analysis
      </Typography>
      <RiskLevelCard />
    </Box>
  );
};
