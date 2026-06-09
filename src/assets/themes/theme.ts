import { createTheme } from '@mui/material/styles';
import colors from './colors';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E2A847', // Deep Amber
      light: '#F3C86B',
      dark: '#C7943E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5A431C', // Muted Royal Blue
      light: '#5A431C',
      dark: '#5A431C',
      contrastText: '#ffffff',
    },
    // background: {
    //   default: colors.background.default, // Dark Ochre
    //   paper: '#FFFFFF', // white
    // },
    text: {
      primary: '#FFFFE3', // Soft Ivory
      secondary: '#1E1E1E', // Graphite
    },
    error: {
      main: '#E85D5D', // Coral Red
    },
    success: {
      main: '#2EBFA5', // Teal Green
    },
  },

  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
    h1: { color: colors.text.primary, fontWeight: 700, fontSize: '2.25rem' },
    h2: { color: colors.text.primary, fontWeight: 600, fontSize: '1.75rem' },
    h3: { color: colors.text.primary, fontWeight: 600, fontSize: '1.5rem' },
    h4: { color: colors.text.primary, fontWeight: 600, fontSize: '1.25rem' },
    h5: { color: colors.text.primary, fontWeight: 600, fontSize: '1rem' },
    h6: { color: colors.text.primary, fontWeight: 600, fontSize: '0.75rem' },
    body1: { color: colors.text.primary, lineHeight: 1.6 },
    body2: { color: colors.text.primary, lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },

  shape: {
    borderRadius: 0,
  },

  shadows: [
    'none', // 0
    '0px 2px 8px rgba(0, 0, 0, 0.05)', // 1
    '0px 4px 12px rgba(0, 0, 0, 0.08)', // 2
    '0px 8px 20px rgba(0, 0, 0, 0.1)', // 3
    '0px 8px 20px rgba(0, 0, 0, 0.1)', // 4
    'none', // 5
    'none', // 6
    'none', // 7
    'none', // 8
    'none', // 9
    'none', // 10
    'none', // 11
    'none', // 12
    'none', // 13
    'none', // 14
    'none', // 15
    'none', // 16
    'none', // 17
    'none', // 18
    'none', // 19
    'none', // 20
    'none', // 21
    'none', // 22
    'none', // 23
    'none', // 24
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          /* Chrome & Edge */
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: colors.primary.main,
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: colors.primary.dark,
          },

          /* Firefox */
          scrollbarWidth: 'auto',
          scrollbarColor: `${colors.primary.main} rgba(255, 255, 255, 0.1)`,
        },
      },
    },
    // 🌟 Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#E2A847',
          '&:hover': {
            backgroundColor: '#C7943E',
          },
        },
        containedSecondary: {
          backgroundColor: '#3B4CCA',
          '&:hover': {
            backgroundColor: '#2F3EA8',
          },
        },
      },
    },

    // Inputs
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#E2A847',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#E2A847',
        },
      },
    },

    // 🎞 Cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#F4EDE4',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },

    // 🧾 Text Fields
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: '#E2A847',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E2A847',
            },
          },
        },
      },
    },

    // 🗂 Paper (dialogs, menus)
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#F4EDE4',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },

    // 🧠 Typography spacing consistency
    MuiTypography: {
      styleOverrides: {
        root: {},
      },
    },

    // 📦 Container
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '2rem',
          paddingBottom: '2rem',
        },
      },
    },

    // 🗒 Dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          backgroundColor: colors.secondary.main,
        },
      },
    },
  },
});

export default theme;
