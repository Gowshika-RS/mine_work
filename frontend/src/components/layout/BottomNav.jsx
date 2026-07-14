import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, Map, Warning, CheckCircle, Person } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (userRole !== 'worker') return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: 1000,
        pb: 'env(safe-area-inset-bottom)',
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(event, newValue) => {
          navigate(newValue);
        }}
        sx={{ height: 65 }}
      >
        <BottomNavigationAction label="Home" value="/worker/dashboard" icon={<Home />} />
        <BottomNavigationAction label="Map" value="/worker/map" icon={<Map />} />
        <BottomNavigationAction label="Hazards" value="/worker/hazards" icon={<Warning />} />
        <BottomNavigationAction label="Checklist" value="/worker/checklist" icon={<CheckCircle />} />
        <BottomNavigationAction label="Profile" value="/worker/profile" icon={<Person />} />
      </BottomNavigation>
    </Paper>
  );
};
