import { Box, Container } from '@mui/material';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SOSButton } from './SOSButton';
import { AIChatbot } from '../AIChatbot';

export const MainLayout = ({ children, isDarkMode, onThemeToggle, userRole = 'worker', onLogout }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar hidden on mobile */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} userRole={userRole} onLogout={onLogout} />
      </Box>
      
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, md: 3 },
          ml: { xs: 0, md: '280px' },
          mt: { xs: 2, md: 0 },
          pb: { xs: 10, md: 3 }, // extra padding on mobile for bottom nav
          overflowY: 'auto',
          width: '100%',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
          {children}
        </Container>
      </Box>

      {/* Mobile Bottom Navigation */}
      <BottomNav userRole={userRole} />

      {/* Floating SOS Button */}
      <SOSButton userRole={userRole} />

      {/* Floating AI Chatbot Assistant */}
      <AIChatbot userRole={userRole} />
    </Box>
  );
};
