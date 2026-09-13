import React from 'react';
import { Paper, Box, Typography, Chip, Button, Grid, Stack, Avatar } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const RecentHazardsCard = ({ hazards }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fallback demo reports if none submitted yet
  const defaultHazards = [
    {
      id: 101,
      hazard_type: 'Roof Fractures & Loose Rock',
      severity: 'high',
      location: 'Shaft 3 • Tunnel 4B',
      created_at: '20 mins ago',
      image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 102,
      hazard_type: 'Ventilation Fan Obstruction',
      severity: 'medium',
      location: 'Sub-level 2 Ramp',
      created_at: '2 hours ago',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'
    }
  ];

  const displayList = (hazards && hazards.length > 0) ? hazards.slice(0, 3) : defaultHazards;

  const getSeverityStyle = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'CRITICAL' };
      case 'high':
        return { color: '#ea580c', bg: '#fff7ed', border: '#ffedd5', label: 'HIGH' };
      case 'medium':
        return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'MEDIUM' };
      default:
        return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'LOW' };
    }
  };

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
          <ReportProblemIcon sx={{ color: '#d97706', fontSize: 22 }} />
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b' }}>
            {t('dashboard.recentHazards', 'RECENT HAZARD REPORTS')}
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => navigate('/worker/ai-hazards')}
          sx={{
            fontWeight: 800,
            bgcolor: '#fff7ed',
            color: '#c2410c',
            border: '1px solid #ffedd5',
            borderRadius: 1.5,
            fontSize: '0.72rem',
            px: 1.5,
            '&:hover': { bgcolor: '#ffedd5' }
          }}
        >
          Report New
        </Button>
      </Box>

      <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 2 }}>
        {displayList.map((item) => {
          const sevStyle = getSeverityStyle(item.severity);
          const imgSrc = item.images && item.images.length > 0 ? item.images[0].image_url : item.image_url;

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                gap: 1.5
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                {imgSrc ? (
                  <Avatar
                    src={imgSrc}
                    variant="rounded"
                    sx={{ width: 44, height: 44, borderRadius: 1.5, border: '1px solid #cbd5e1' }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      bgcolor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b'
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" fontWeight="700" color="#0f172a" sx={{ lineHeight: 1.2 }}>
                    {item.hazard_type || item.description || 'Hazard Inspection'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    {item.location || 'Mine Shaft'}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={sevStyle.label}
                size="small"
                sx={{
                  bgcolor: sevStyle.bg,
                  color: sevStyle.color,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  border: `1px solid ${sevStyle.border}`
                }}
              />
            </Paper>
          );
        })}
      </Stack>

      <Button
        variant="outlined"
        fullWidth
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/worker/offline-reports')}
        sx={{ borderRadius: 2, fontWeight: 700, color: '#d97706', borderColor: '#fde68a' }}
      >
        View All Hazard Reports
      </Button>
    </Paper>
  );
};

export default RecentHazardsCard;
