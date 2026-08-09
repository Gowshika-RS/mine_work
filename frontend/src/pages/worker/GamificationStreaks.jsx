import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid,
  Paper, LinearProgress, Chip, Dialog, DialogContent, Button,
  Avatar, Stack, Divider
} from '@mui/material';

import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '../../api/client';

export const GamificationStreaks = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockPopup, setUnlockPopup] = useState(null);

  useEffect(() => {
    fetchGamificationProfile();
  }, []);

  const fetchGamificationProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/gamification/profile');
      setProfile(res.data);
    } catch (e) {
      console.log("Error fetching gamification profile:", e);
    } finally {

      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          🏆 Safety Gamification & Achievement Badges
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Every daily check-in increases your active streak, awards XP, levels up your safety profile, and unlocks enterprise badges.
        </Typography>
      </Box>

      {profile && (
        <>
          {/* Top Banner: Streaks, XP & Level */}
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)',
              color: '#ffffff',
              boxShadow: 6,
              mb: 4
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4} textAlign="center">
                <Box display="inline-flex" alignItems="center" gap={1}>
                  <LocalFireDepartmentIcon sx={{ fontSize: 60, color: '#ffe082' }} />
                  <Box textAlign="left">
                    <Typography variant="h2" fontWeight="900" sx={{ lineHeight: 1 }}>
                      {profile.current_streak}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ opacity: 0.9 }}>
                      DAY STREAK
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                  Longest Streak: {profile.longest_streak} Days
                </Typography>
              </Grid>

              <Grid item xs={12} sm={8}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Level {profile.level} Safety Guard
                  </Typography>

                  <Chip
                    icon={<StarIcon sx={{ color: '#ffd54f !important' }} />}
                    label={`${profile.xp} TOTAL XP`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold' }}
                  />
                </Box>

                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Progress to Level {profile.level + 1}: {profile.xp_in_level} / {profile.xp_for_next_level} XP
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={profile.progress_percentage}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#ffffff' }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Badge Collection Section */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            🏅 Badge Collection ({(profile.badges || []).filter(b => b.is_unlocked).length} / {(profile.badges || []).length} Unlocked)
          </Typography>

          <Grid container spacing={3}>
            {(profile.badges || []).map((badge) => (

              <Grid item xs={12} sm={6} md={4} key={badge.badge_key}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: badge.is_unlocked ? 3 : 1,
                    border: badge.is_unlocked ? '2px solid #4caf50' : '1px dashed #bdbdbd',
                    bgcolor: badge.is_unlocked ? '#ffffff' : '#f5f5f5',
                    opacity: badge.is_unlocked ? 1 : 0.7,
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        mx: 'auto',
                        mb: 2,
                        fontSize: '2.2rem',
                        bgcolor: badge.is_unlocked ? '#e8f5e9' : '#e0e0e0',
                        boxShadow: badge.is_unlocked ? '0 4px 15px rgba(76, 175, 80, 0.3)' : 'none'
                      }}
                    >
                      {badge.is_unlocked ? badge.icon : <LockIcon sx={{ color: '#757575' }} />}
                    </Avatar>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {badge.badge_name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                      {badge.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {badge.is_unlocked ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={`Unlocked ${badge.unlocked_at || ''}`}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    ) : (
                      <Chip
                        icon={<LockIcon />}
                        label="Locked"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Animated Achievement Popup Dialog */}
      {unlockPopup && (
        <Dialog open={true} onClose={() => setUnlockPopup(null)} maxWidth="xs" fullWidth>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h2" sx={{ mb: 1 }}>
              🎉
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
              BADGE UNLOCKED!
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ my: 1 }}>
              {unlockPopup.name} {unlockPopup.icon}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Congratulations! You earned +50 XP and unlocked a new safety achievement badge.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setUnlockPopup(null)} fullWidth>
              Claim Badge & Continue
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};
