import { light } from '@mui/material/styles/createPalette';

const colors = {
  whiteSmoke: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  phantomBlack: 'rgba(20,20,20,0.6)',
  primary: {
    main: '#E2A847', // Deep Amber
    light: '#F3C86B',
    dark: '#C7943E',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#5A431C',
    light: '#5A431C',
    dark: '#5A431C',
    contrastText: '#ffffff',
  },
  background: {
    default: 'linear-gradient(135deg, #5A431C 0%, #1f0303ff 100%)',
    // default: 'linear-gradient(135deg, #5A431C 0%, #E2A847 100%)',
    paper: '#FFFFFF', // white
  },
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
};
export default colors;
