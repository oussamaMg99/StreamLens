import './App.css';
import { useContext } from 'react';
import { BrowserRouter } from 'react-router';
import AppRoutes from './Routes';
import { CssBaseline } from '@mui/material';
import AppContext from './core/context/global/AppContext';
import SnackbarComponent from './components/snackBar/SnackBar.component';
import { AlertDialogProps } from './core/models/alertDialog.model';
import AlertDialog from './components/dialogs/AlertDialog.component';

const App = () => {
  const { alertDialogProps, snackBarProps, setAlertDialogProps, setSnackBarProps } = useContext(AppContext);

  const closeSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    setSnackBarProps();
  };

  const handleCloseAlertDialog = async () => {
    if (alertDialogProps.onClose) {
      await alertDialogProps.onClose();
    }
    setAlertDialogProps(new AlertDialogProps());
  };
  const handleConfirmAlertDialog = async () => {
    await alertDialogProps.onConfirm();
    setAlertDialogProps(new AlertDialogProps());
  };

  return (
    <>
      {snackBarProps && snackBarProps.open && (
        <SnackbarComponent
          autoHideDuration={snackBarProps?.autoHideDuration}
          open={snackBarProps.open}
          severity={snackBarProps.severity}
          message={snackBarProps.message}
          onClose={closeSnackbar}
        />
      )}
      {alertDialogProps?.open && (
        <AlertDialog
          loadingAnimation={alertDialogProps.loadingAnimation}
          open={alertDialogProps.open}
          title={alertDialogProps.title}
          content={alertDialogProps.content}
          onClose={handleCloseAlertDialog}
          onConfirm={handleConfirmAlertDialog}
          closeLabel={alertDialogProps.closeLabel}
          confirmLabel={alertDialogProps.confirmLabel}
          showCancelButton={alertDialogProps.showCancelButton}
        />
      )}
      <CssBaseline />
      <BrowserRouter basename='/StreamLens/'>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
};

export default App;
