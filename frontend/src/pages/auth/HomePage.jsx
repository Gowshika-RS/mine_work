import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, Stack, Grid, Paper, Dialog, DialogTitle,
  DialogContent, IconButton, Divider, Chip
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import ShieldIcon from '@mui/icons-material/Shield';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WarningIcon from '@mui/icons-material/Warning';
import SensorsIcon from '@mui/icons-material/Sensors';
import MapIcon from '@mui/icons-material/Map';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { LanguageSelector } from '../../components/LanguageSelector';

export const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. SIMPLE PROFESSIONAL NAVIGATION BAR */}
      <Box
        component="header"
        sx={{
          position: 'sticky', top: 0, zIndex: 1100,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          px: { xs: 2, md: 6 }, height: 68,
          display: 'flex', alignItems: 'center'
        }}
      >
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Brand Logo */}
            <Box display="flex" alignItems="center" gap={1.2} cursor="pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Box sx={{ bgcolor: '#10b981', p: 0.6, borderRadius: 1.8, display: 'flex' }}>
                <ShieldIcon sx={{ color: '#ffffff', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '-0.02em', color: '#0f172a', fontSize: '1.25rem' }}>
                MINEGUARD <Box component="span" sx={{ color: '#10b981' }}>AI</Box>
              </Typography>
            </Box>

            {/* Center Navigation Links (Desktop) */}
            <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {[
                { label: t('home.navHome', 'Home'), id: 'hero' },
                { label: t('home.navFeatures', 'Features'), id: 'features' },
                { label: t('home.navSafety', 'Safety'), id: 'roles' },
                { label: t('home.navPreview', 'Preview'), id: 'preview' },
                { label: t('home.navTech', 'Technology'), id: 'tech' },
              ].map((item) => (
                <Typography
                  key={item.id}
                  variant="body2"
                  fontWeight="600"
                  onClick={() => scrollToSection(item.id)}
                  sx={{ color: '#475569', cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#10b981' } }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            {/* Language Selector & Login Role Button */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: { xs: 120, sm: 150 } }}>
                <LanguageSelector size="small" showLabel={false} />
              </Box>

              <Button
                variant="contained"
                onClick={() => setRoleModalOpen(true)}
                sx={{
                  bgcolor: '#0f172a', color: '#ffffff',
                  fontWeight: '700', textTransform: 'none',
                  borderRadius: 2, px: 2.5, py: 0.8,
                  fontSize: '0.88rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1e293b' }
                }}
              >
                {t('home.login', 'Login')}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 2. BALANCED HERO SECTION */}
      <Box id="hero" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="xl" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={4} alignItems="center">
            {/* Left Content Column */}
            <Grid item xs={12} md={6.5} component={motion.div} variants={itemVariants}>
              <Chip
                label={t('home.badge', 'AI-POWERED MINE SAFETY PLATFORM')}
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  color: '#047857',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  mb: 2.5, px: 1, py: 0.4,
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 2
                }}
              />

              <Typography
                variant="h2"
                fontWeight="900"
                sx={{
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
                  lineHeight: 1.15, mb: 2,
                  letterSpacing: '-0.03em', color: '#0f172a'
                }}
              >
                {t('home.title1', 'Smarter Safety for')}<br />
                <Box component="span" sx={{ color: '#10b981' }}>
                  {t('home.title2', 'Safer Mining Operations')}
                </Box>
              </Typography>

              <Typography variant="body1" sx={{ color: '#475569', fontSize: { xs: '1rem', md: '1.05rem' }, mb: 4, lineHeight: 1.65, maxWidth: 540 }}>
                {t('home.subtitle', 'MineGuard AI helps workers, supervisors, and administrators monitor safety, report hazards, manage emergencies, and make better operational decisions through one connected software platform.')}
              </Typography>

              {/* Action Buttons Hierarchy */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/login?role=worker"
                  variant="contained"
                  size="large"
                  startIcon={<EngineeringIcon />}
                  sx={{
                    bgcolor: '#10b981', color: '#ffffff', fontWeight: '800',
                    py: 1.4, px: 3, borderRadius: 2.5, textTransform: 'none', fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    '&:hover': { bgcolor: '#059669' }
                  }}
                >
                  {t('home.workerPortal', 'Worker Portal')}
                </Button>

                <Button
                  component={RouterLink}
                  to="/login?role=supervisor"
                  variant="outlined"
                  size="large"
                  startIcon={<SupervisorAccountIcon />}
                  sx={{
                    borderColor: '#2563eb', color: '#2563eb', fontWeight: '800',
                    py: 1.4, px: 3, borderRadius: 2.5, textTransform: 'none', fontSize: '0.95rem',
                    '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.06)', borderColor: '#1d4ed8' }
                  }}
                >
                  {t('home.supervisorConsole', 'Supervisor Console')}
                </Button>

                <Button
                  component={RouterLink}
                  to="/login?role=admin"
                  variant="text"
                  sx={{
                    color: '#475569', fontWeight: '700', textTransform: 'none', fontSize: '0.95rem',
                    '&:hover': { color: '#0f172a', bgcolor: 'transparent' }
                  }}
                >
                  {t('home.adminConsole', 'Admin Console →')}
                </Button>
              </Stack>
            </Grid>

            {/* Right Mining Photo Visual Column */}
            <Grid item xs={12} md={5.5} component={motion.div} variants={itemVariants}>
              <Box sx={{ position: 'relative' }}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
                    bgcolor: '#0f172a'
                  }}
                >
                  <Box
                    component="img"
                    src="/mining_safety_hero.jpg"
                    alt="Underground Mining Operations"
                    sx={{
                      width: '100%',
                      height: { xs: 300, sm: 380, md: 420 },
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </Paper>

                {/* Single Small Subtle Status Badge */}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    bottom: 20, right: 20,
                    px: 2, py: 1,
                    borderRadius: 3,
                    bgcolor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', gap: 1
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                  <Typography variant="caption" fontWeight="700" sx={{ letterSpacing: '0.02em' }}>
                    Safety Monitoring Active
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. SIMPLE CAPABILITY TRUST STRIP */}
      <Box sx={{ bgcolor: '#f1f5f9', py: 2.5, borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="xl">
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            {[
              { label: 'AI Risk Analysis', icon: <PsychologyIcon sx={{ color: '#10b981', fontSize: 20 }} /> },
              { label: 'Emergency SOS', icon: <PhoneInTalkIcon sx={{ color: '#dc2626', fontSize: 20 }} /> },
              { label: 'Offline Reporting', icon: <SyncIcon sx={{ color: '#2563eb', fontSize: 20 }} /> },
              { label: 'Real-Time Communication', icon: <SensorsIcon sx={{ color: '#0288d1', fontSize: 20 }} /> },
              { label: 'Safety Analytics', icon: <AssessmentIcon sx={{ color: '#8b5cf6', fontSize: 20 }} /> },
            ].map((cap, idx) => (
              <Grid item xs={6} sm={4} md={2.4} key={idx} textAlign="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  {cap.icon}
                  <Typography variant="body2" fontWeight="700" sx={{ color: '#334155', fontSize: '0.85rem' }}>
                    {cap.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 4. FEATURES SECTION */}
      <Box id="features" sx={{ py: 9, bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={5}>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', mb: 1, letterSpacing: '-0.02em' }}>
              {t('home.capabilitiesTitle', 'Everything You Need for Safer Mine Operations')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 580, mx: 'auto' }}>
              {t('home.capabilitiesSub', 'One connected platform for workers, supervisors, and administrators.')}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              { title: 'AI Risk Prediction', desc: 'Classifies simulated environmental telemetry into Safe, Warning, or Critical operational risk levels.', icon: <PsychologyIcon sx={{ color: '#10b981' }} /> },
              { title: 'Hazard Reporting', desc: 'Allows workers to submit mine images and log visual safety anomalies offline or online.', icon: <WarningIcon sx={{ color: '#f59e0b' }} /> },
              { title: 'Emergency SOS', desc: 'Instantly dispatches distress signals to supervisors and control rooms during critical situations.', icon: <PhoneInTalkIcon sx={{ color: '#dc2626' }} /> },
              { title: 'Safe Zone Navigation', desc: 'Interactive sector maps highlighting refuge chambers, hazards, and evacuation routes.', icon: <MapIcon sx={{ color: '#2563eb' }} /> },
              { title: 'Shift Monitoring', desc: 'Tracks active shift hours, rest break recommendations, and worker attendance.', icon: <ScheduleIcon sx={{ color: '#0288d1' }} /> },
              { title: 'Safety Analytics', desc: 'Combines safety scores, shift incidents, and compliance trends into unified reports.', icon: <AssessmentIcon sx={{ color: '#8b5cf6' }} /> },
            ].map((feat) => (
              <Grid item xs={12} sm={6} md={4} key={feat.title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3, borderRadius: 3.5, bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0', height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', borderColor: '#cbd5e1' }
                  }}
                >
                  <Box sx={{ mb: 1.5, display: 'flex' }}>{feat.icon}</Box>
                  <Typography variant="h6" fontWeight="700" sx={{ color: '#0f172a', mb: 1, fontSize: '1.1rem' }}>
                    {feat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feat.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. ROLE ACCESS SECTION */}
      <Box id="roles" sx={{ py: 9, bgcolor: '#ffffff', borderY: '1px solid #e2e8f0' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={5}>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', mb: 1, letterSpacing: '-0.02em' }}>
              {t('home.rolesTitle', 'One Platform, Four Dedicated Roles')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 580, mx: 'auto' }}>
              {t('home.rolesSub', 'Connected safety intelligence for everyone responsible for mine operations.')}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* WORKER */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 4, bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0', height: '100%',
                  display: 'flex', flexDirection: 'column'
                }}
              >
                <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1.5, borderRadius: 2.5, width: 'fit-content', color: '#10b981', mb: 2 }}>
                  <EngineeringIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1 }}>
                  WORKER
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
                  "Stay informed, report hazards, monitor your safety, and request emergency assistance."
                </Typography>
                <Button
                  component={RouterLink}
                  to="/login?role=worker"
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: '#10b981', color: '#ffffff', fontWeight: '800', py: 1.2, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}
                >
                  Access Worker Portal
                </Button>
              </Paper>
            </Grid>

            {/* SUPERVISOR */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 4, bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0', height: '100%',
                  display: 'flex', flexDirection: 'column'
                }}
              >
                <Box sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', p: 1.5, borderRadius: 2.5, width: 'fit-content', color: '#2563eb', mb: 2 }}>
                  <SupervisorAccountIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1 }}>
                  SUPERVISOR
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
                  "Monitor workers, review hazards, manage shifts, approve leaves, and oversee operations."
                </Typography>
                <Button
                  component={RouterLink}
                  to="/login?role=supervisor"
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: '#2563eb', color: '#ffffff', fontWeight: '800', py: 1.2, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#1d4ed8' } }}
                >
                  Supervisor Console
                </Button>
              </Paper>
            </Grid>

            {/* EMERGENCY OFFICER */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 4, bgcolor: '#fff1f2',
                  border: '1px solid #fecdd3', height: '100%',
                  display: 'flex', flexDirection: 'column'
                }}
              >
                <Box sx={{ bgcolor: 'rgba(225, 29, 72, 0.1)', p: 1.5, borderRadius: 2.5, width: 'fit-content', color: '#e11d48', mb: 2 }}>
                  <PhoneInTalkIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#9f1239', mb: 1 }}>
                  EMERGENCY OFFICER
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
                  "Handle SOS distress calls, trigger evacuation sirens, gas alarms, and dispatch rescue squads."
                </Typography>
                <Button
                  component={RouterLink}
                  to="/login?role=emergency_officer"
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: '#e11d48', color: '#ffffff', fontWeight: '800', py: 1.2, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#be123c' } }}
                >
                  Emergency Command
                </Button>
              </Paper>
            </Grid>

            {/* ADMINISTRATOR */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 4, bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0', height: '100%',
                  display: 'flex', flexDirection: 'column'
                }}
              >
                <Box sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', p: 1.5, borderRadius: 2.5, width: 'fit-content', color: '#8b5cf6', mb: 2 }}>
                  <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1 }}>
                  ADMINISTRATOR
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
                  "Manage users, safety policies, incidents, reports, and overall platform configuration."
                </Typography>
                <Button
                  component={RouterLink}
                  to="/login?role=admin"
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: '#8b5cf6', color: '#ffffff', fontWeight: '800', py: 1.2, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#7c3aed' } }}
                >
                  Access Admin Console
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 6. MINING IMAGE SPLIT SECTION */}
      <Box sx={{ py: 9, bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1000&auto=format&fit=crop"
                  alt="Mine Worker Underground"
                  sx={{ width: '100%', height: 360, objectFit: 'cover', display: 'block' }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="800" sx={{ mb: 2, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Built Around Real Mining Safety Challenges
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
                MineGuard AI brings worker safety, operational awareness, hazard reporting, and emergency coordination together in a single software platform.
              </Typography>

              <Grid container spacing={2}>
                {[
                  'Worker safety monitoring',
                  'Hazard awareness',
                  'Emergency coordination',
                  'Operational visibility'
                ].map((item) => (
                  <Grid item xs={12} sm={6} key={item}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#334155' }}>
                        {item}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 7. REALISTIC PLATFORM PREVIEW */}
      <Box id="preview" sx={{ py: 9, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
              Safety Information at a Glance
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Platform Interface Preview
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3, borderRadius: 4, bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">SAFETY SCORE</Typography>
                  <Typography variant="h5" fontWeight="800" color="success.main">95%</Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">WORKER STATUS</Typography>
                  <Typography variant="h5" fontWeight="800" color="primary.main">Active</Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">ENVIRONMENT RISK</Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#f59e0b' }}>Normal</Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #0288d1' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">RECENT ALERTS</Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#0288d1' }}>0</Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">SHIFT STATUS</Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#8b5cf6' }}>Shift 1</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* 8. SOFTWARE-ONLY CLARIFICATION */}
      <Box sx={{ py: 6, bgcolor: '#f1f5f9', borderY: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #cbd5e1', textAlign: 'center' }}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#0f172a', mb: 0.5 }}>
              Software-Based Safety Intelligence
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, maxWidth: 800, mx: 'auto' }}>
              MineGuard AI is a software-based safety simulation and decision-support platform. It combines simulated environmental telemetry, machine learning risk prediction, AI-assisted hazard analysis, emergency workflows, worker monitoring, and operational dashboards.
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* 9. TECHNOLOGY & METRICS SECTION */}
      <Box id="tech" sx={{ py: 8, bgcolor: '#ffffff' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
              Built with Modern Software Technologies
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mb: 6 }}>
            {['React 19', 'Vite', 'FastAPI', 'Python 3.11', 'MySQL', 'Scikit-learn', 'Google Gemini', 'WebSockets', 'Leaflet'].map((tech) => (
              <Chip key={tech} label={tech} variant="outlined" sx={{ fontWeight: '700', bgcolor: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' }} />
            ))}
          </Stack>

          {/* Moderate Metrics Strip */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2} textAlign="center">
              {[
                { stat: '3', label: 'Roles' },
                { stat: '26', label: 'API Routers' },
                { stat: '95.25%', label: 'ML Test Accuracy' },
                { stat: 'Real-Time', label: 'Communication' },
              ].map((m, idx) => (
                <Grid item xs={6} md={3} key={idx}>
                  <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a' }}>{m.stat}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">{m.label}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* 10. FINAL CTA SECTION */}
      <Box sx={{ py: 8, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: '#0f172a', letterSpacing: '-0.02em' }}>
            READY TO ENTER MINEGUARD?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Choose your role and access your safety workspace.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/login?role=worker"
              variant="contained"
              sx={{ bgcolor: '#10b981', color: '#ffffff', fontWeight: '800', py: 1.2, px: 3.5, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}
            >
              Worker Portal
            </Button>

            <Button
              component={RouterLink}
              to="/login?role=supervisor"
              variant="contained"
              sx={{ bgcolor: '#2563eb', color: '#ffffff', fontWeight: '800', py: 1.2, px: 3.5, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#1d4ed8' } }}
            >
              Supervisor Console
            </Button>

            <Button
              component={RouterLink}
              to="/login?role=admin"
              variant="contained"
              sx={{ bgcolor: '#8b5cf6', color: '#ffffff', fontWeight: '800', py: 1.2, px: 3.5, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#7c3aed' } }}
            >
              Admin Console
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* 11. CLEAN DARK FOOTER */}
      <Box component="footer" sx={{ py: 6, bgcolor: '#0f172a', color: '#cbd5e1' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <ShieldIcon sx={{ color: '#10b981' }} />
                <Typography variant="h6" fontWeight="800" color="#ffffff">MINEGUARD AI</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 300, lineHeight: 1.6 }}>
                Intelligent software for safer mining operations.
              </Typography>
            </Grid>

            <Grid item xs={6} md={4}>
              <Typography variant="subtitle2" fontWeight="700" color="#ffffff" gutterBottom>Platform</Typography>
              <Stack spacing={0.8}>
                <Typography variant="caption" component={RouterLink} to="/login?role=worker" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#10b981' } }}>Worker</Typography>
                <Typography variant="caption" component={RouterLink} to="/login?role=supervisor" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#2563eb' } }}>Supervisor</Typography>
                <Typography variant="caption" component={RouterLink} to="/login?role=admin" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#8b5cf6' } }}>Administrator</Typography>
              </Stack>
            </Grid>

            <Grid item xs={6} md={4}>
              <Typography variant="subtitle2" fontWeight="700" color="#ffffff" gutterBottom>Technology</Typography>
              <Stack spacing={0.8}>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>AI / ML</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Real-Time Monitoring</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Emergency Response</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Offline Support</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

          <Typography variant="caption" display="block" textAlign="center" sx={{ color: '#64748b' }}>
            © 2026 MineGuard AI. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* CHOOSE YOUR WORKSPACE MODAL */}
      <Dialog
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="800">Choose your workspace</Typography>
          <IconButton onClick={() => setRoleModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} py={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => { setRoleModalOpen(false); navigate('/login?role=worker'); }}
              startIcon={<EngineeringIcon sx={{ color: '#10b981' }} />}
              sx={{ justifyContent: 'flex-start', py: 1.5, px: 2, borderRadius: 2, borderColor: '#cbd5e1', color: '#0f172a', fontWeight: '700' }}
            >
              Worker Portal
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => { setRoleModalOpen(false); navigate('/login?role=supervisor'); }}
              startIcon={<SupervisorAccountIcon sx={{ color: '#2563eb' }} />}
              sx={{ justifyContent: 'flex-start', py: 1.5, px: 2, borderRadius: 2, borderColor: '#cbd5e1', color: '#0f172a', fontWeight: '700' }}
            >
              Supervisor Console
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => { setRoleModalOpen(false); navigate('/login?role=admin'); }}
              startIcon={<AdminPanelSettingsIcon sx={{ color: '#8b5cf6' }} />}
              sx={{ justifyContent: 'flex-start', py: 1.5, px: 2, borderRadius: 2, borderColor: '#cbd5e1', color: '#0f172a', fontWeight: '700' }}
            >
              Administrator Console
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default HomePage;
