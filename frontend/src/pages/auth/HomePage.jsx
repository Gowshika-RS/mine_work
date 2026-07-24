import React from 'react';
import { Box, Typography, Button, Container, Stack, Select, MenuItem, Grid, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Security, Engineering, AdminPanelSettings } from '@mui/icons-material';

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url("https://images.unsplash.com/photo-1574768390757-cf9b0ce3d289?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dark overlay for better text readability */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 1 }} />

      {/* Header / Nav */}
      <Box 
        component={motion.div}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          position: 'relative', 
          zIndex: 2, 
          p: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security sx={{ color: '#00e676' }} /> MINEGUARD
        </Typography>
        
        <Stack direction="row" spacing={3} alignItems="center">
          <Select
            value={i18n.language}
            onChange={handleLanguageChange}
            variant="standard"
            sx={{ 
              color: '#fff',
              '& .MuiSvgIcon-root': { color: '#fff' },
              '&:before': { borderBottom: '1px solid rgba(255,255,255,0.5)' },
              '&:hover:not(.Mui-disabled, .Mui-error):before': { borderBottom: '1px solid #fff' },
            }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
            <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
            <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
            <MenuItem value="kn">ಕನ್ನಡ (Kannada)</MenuItem>
            <MenuItem value="ml">മലയാളം (Malayalam)</MenuItem>
            <MenuItem value="mr">मराठी (Marathi)</MenuItem>
            <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
            <MenuItem value="gu">ગુજરાતી (Gujarati)</MenuItem>
            <MenuItem value="pa">ਪੰਜਾਬੀ (Punjabi)</MenuItem>
            <MenuItem value="or">ଓଡ଼ିଆ (Odia)</MenuItem>
          </Select>
          <Button 
            component={RouterLink} 
            to="/login" 
            variant="contained" 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            {t('login')}
          </Button>
        </Stack>
      </Box>

      {/* Main Hero Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 8
        }}
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '3rem', md: '5rem' }, 
              fontWeight: 900, 
              color: '#ffffff',
              mb: 2,
              textShadow: '0px 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            {t('welcome')}
          </Typography>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)', 
              mb: 6, 
              maxWidth: '800px',
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            AI-Powered Offline Mine Worker Safety Companion. Real-time hazard detection, predictive analytics, and unified emergency response protocols.
          </Typography>
        </motion.div>

        {/* Action Cards */}
        <Grid container spacing={4} justifyContent="center" component={motion.div} variants={itemVariants}>
          {/* Worker Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.3s ease, background 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }
            }}>
              <Engineering sx={{ fontSize: 60, color: '#00e676', mb: 2 }} />
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>Worker Portal</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Report hazards with AI, sync offline, and monitor your safety score.
              </Typography>
              <Button component={RouterLink} to="/login" variant="outlined" sx={{ color: '#00e676', borderColor: '#00e676', borderRadius: 2 }}>Access Portal</Button>
            </Box>
          </Grid>
          
          {/* Admin Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.3s ease, background 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }
            }}>
              <AdminPanelSettings sx={{ fontSize: 60, color: '#29b6f6', mb: 2 }} />
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>Admin Console</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Global overview, live map tracking, and predictive insights across the mine.
              </Typography>
              <Button component={RouterLink} to="/login" variant="outlined" sx={{ color: '#29b6f6', borderColor: '#29b6f6', borderRadius: 2 }}>Access Console</Button>
            </Box>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default HomePage;
