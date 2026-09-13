import { createTheme } from '@mui/material/styles';

const typography = {
  fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em' },
  h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
  h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.015em' },
  h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
  h5: { fontSize: '1.125rem', fontWeight: 600 },
  h6: { fontSize: '1rem', fontWeight: 600 },
  button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.01em' },
  body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
  body2: { fontSize: '0.84375rem', lineHeight: 1.5 },
};

const baseComponentOverrides = {
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
        borderRadius: 12,
        backgroundImage: 'none',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '8px 20px',
        fontWeight: 600,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
        fontSize: '0.78125rem',
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4F46E5', light: '#6366F1', dark: '#4338CA' }, // Slate Indigo
    secondary: { main: '#0284C7', light: '#38BDF8', dark: '#0369A1' },
    success: { main: '#10B981', light: '#34D399', dark: '#059669' },
    warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
    error: { main: '#E11D48', light: '#F43F5E', dark: '#BE123C' },
    info: { main: '#2563EB', light: '#60A5FA', dark: '#1D4ED8' },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  shape: { borderRadius: 12 },
  typography,
  components: {
    ...baseComponentOverrides,
    MuiCard: {
      styleOverrides: {
        root: {
          ...baseComponentOverrides.MuiCard.styleOverrides.root,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            borderColor: '#CBD5E1',
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5' }, // Human Indigo Accent
    secondary: { main: '#38BDF8', light: '#7DD3FC', dark: '#0284C7' },
    success: { main: '#10B981', light: '#34D399', dark: '#059669' },
    warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
    error: { main: '#F43F5E', light: '#FB7185', dark: '#E11D48' },
    info: { main: '#38BDF8', light: '#60A5FA', dark: '#0284C7' },
    background: {
      default: '#0B0F17', // Warm Slate Obsidian
      paper: '#151C2C', // Warm Surface Card Slate
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      disabled: '#64748B',
    },
    divider: 'rgba(255, 255, 255, 0.07)',
  },
  shape: { borderRadius: 12 },
  typography,
  components: {
    ...baseComponentOverrides,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          backgroundColor: '#0B0F17',
          color: '#F8FAFC',
          backgroundImage: 'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.04) 0px, transparent 70%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          ...baseComponentOverrides.MuiCard.styleOverrides.root,
          backgroundColor: '#151C2C',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...baseComponentOverrides.MuiPaper.styleOverrides.root,
          backgroundColor: '#151C2C',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundImage: 'none',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});

