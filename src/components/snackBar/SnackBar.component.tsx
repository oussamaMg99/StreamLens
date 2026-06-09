import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';
import Slide, { SlideProps } from '@mui/material/Slide';
import colors from 'src/assets/themes/colors';

interface SnackbarComponentProps {
  open: boolean;
  severity: AlertColor | undefined;
  message: string;
  onClose: () => void;
  autoHideDuration?: number | null;
}
const defaultAutoHideDuration = 5000;

const TransitionSlide = (props: SlideProps) => {
  return <Slide {...props} direction='down' />;
};

const SnackbarComponent = (props: SnackbarComponentProps) => {
  const { open, severity, message, onClose, autoHideDuration } = props;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration ?? defaultAutoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={TransitionSlide}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarComponent;
