import { AlertDialogProps } from 'src/core/models/alertDialog.model';
import { SnackBarProps } from 'src/core/models/snackbar.model';

export default function AppReducer(state: any, action: any) {
  switch (action.type) {
    case 'CLEAR_SESSION':
      // Wipe the persisted user session (auth) and any theme/UI preferences.
      sessionStorage.clear();
      localStorage.clear();
      return {
        ...state,
        themeMode: 'default',
        user: undefined,
        alertDialogProps: new AlertDialogProps(),
        snackBarProps: new SnackBarProps(),
      };

    case 'SET_THEME_MODE':
      localStorage.setItem('_themeMode', JSON.stringify(action.payload));
      return {
        ...state,
        themeMode: action.payload,
      };

    case 'SET_USER':
      // Not persisted: Firebase keeps the session itself and the auth listener in
      // AppContext restores `user` on reload. The first dispatch marks auth as ready.
      return {
        ...state,
        user: action.payload,
        authReady: true,
      };

    case 'SET_ALERT_DIALOG_PROPS':
      return {
        ...state,
        alertDialogProps: action.payload || {},
      };

    case 'SET_SNACKBAR_PROPS':
      return {
        ...state,
        snackBarProps: action.payload || {},
      };

    default:
      return state;
  }
}
