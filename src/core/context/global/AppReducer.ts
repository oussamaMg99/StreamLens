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
        user: {},
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
      sessionStorage.setItem('_user', JSON.stringify({ ...state.user, ...action.payload }));
      return {
        ...state,
        user: action.payload,
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
