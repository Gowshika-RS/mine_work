import { createTheme } from '@mui/material/styles';

const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontSize: '2.5rem', fontWeight: 700 },
  h2: { fontSize: '2rem', fontWeight: 600 },
  h3: { fontSize: '1.75rem', fontWeight: 600 },
  h4: { fontSize: '1.5rem', fontWeight: 600 },
  h5: { fontSize: '1.25rem', fontWeight: 600 },
  h6: { fontSize: '1rem', fontWeight: 600 },
  button: { textTransform: 'none', fontWeight: 600 },
};

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollBehavior: 'smooth',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        padding: '10px 24px',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563EB' },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
  },
  shape: { borderRadius: 16 },
  typography,
  components: {
    ...components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...components.MuiCard.styleOverrides.root,
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00f0ff' },
    success: { main: '#00ff88' },
    warning: { main: '#ffaa00' },
    error: { main: '#ff3355' },
    info: { main: '#60A5FA' },
    background: {
      default: '#0a0e1a',
      paper: '#111827',
    },
    text: {
      primary: '#F0F4F8',
      secondary: '#8899aa',
    },
  },
  shape: { borderRadius: 16 },
  typography,
  components: {
    ...components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.03) 0%, transparent 60%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          ...components.MuiCard.styleOverrides.root,
          backgroundColor: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(0, 240, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 12px rgba(0, 240, 255, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...components.MuiPaper.styleOverrides.root,
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
  },
});
