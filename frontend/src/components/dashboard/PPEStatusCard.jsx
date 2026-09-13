import React from 'react';
import { Paper, Box, Typography, Chip, Button, Stack } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PPEStatusCard = ({ ppeRecord }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const hasRecord = ppeRecord?.has_record ?? true;
  const isPassed = ppeRecord?.passed ?? true;
  const confidence = ppeRecord?.confidence_score || 96.5;
  const missingItems = ppeRecord?.missing_equipment || [];

  // Default PPE items state
  const items = [
    { label: 'Safety Helmet', key: 'helmet', ok: !missingItems.includes('Safety Helmet') },
    { label: 'High-Vis Vest', key: 'vest', ok: !missingItems.includes('Reflective Safety Vest') },
    { label: 'Respirator Mask', key: 'mask', ok: !missingItems.includes('Face Mask') },
    { label: 'Safety Goggles', key: 'goggles', ok: !missingItems.includes('Safety Goggles') },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <VerifiedUserIcon sx={{ color: '#059669', fontSize: 22 }} />
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b' }}>
            {t('dashboard.ppeVerification', 'PPE VERIFICATION')}
          </Typography>
        </Box>
        <Chip
          label={isPassed ? 'COMPLIANT ✅' : 'ACTION NEEDED ⚠️'}
          size="small"
          sx={{
            bgcolor: isPassed ? '#ecfdf5' : '#fef2f2',
            color: isPassed ? '#047857' : '#dc2626',
            fontWeight: 800,
            fontSize: '0.7rem',
            border: `1px solid ${isPassed ? '#a7f3d0' : '#fca5a5'}`
          }}
        />
      </Box>

      <Box p={1.8} borderRadius={2} bgcolor="#f8fafc" border="1px solid #e2e8f0" mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight="700" color="#0f172a">
            {isPassed ? 'Pre-Shift PPE Checklist Passed' : 'Missing Required PPE Gear'}
          </Typography>
          <Typography variant="caption" fontWeight="700" color="#059669">
            {confidence}% AI Score
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1}>
          {items.map((item) => (
            <Chip
              key={item.key}
              icon={item.ok ? <CheckCircleIcon sx={{ color: '#059669 !important', fontSize: '0.85rem' }} /> : <CancelIcon sx={{ color: '#dc2626 !important', fontSize: '0.85rem' }} />}
              label={item.label}
              size="small"
              sx={{
                bgcolor: item.ok ? '#ecfdf5' : '#fef2f2',
                color: item.ok ? '#047857' : '#b91c1c',
                fontWeight: 700,
                fontSize: '0.72rem',
                border: `1px solid ${item.ok ? '#a7f3d0' : '#fca5a5'}`
              }}
            />
          ))}
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="outlined"
        fullWidth
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/worker/ppe-scan')}
        sx={{ borderRadius: 2, fontWeight: 700, color: '#059669', borderColor: '#a7f3d0' }}
      >
        Verify PPE Gear
      </Button>
    </Paper>
  );
};

export default PPEStatusCard;
