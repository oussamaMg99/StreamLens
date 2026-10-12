import { AlertDialogProps } from 'src/core/models/alertDialog.model';
import { SnackBarProps } from 'src/core/models/snackbar.model';
import { AppAction, AppContextState } from './types';

/**
 * State only: the setter functions on AppContextType are added by AppContextProvider, so
 * the reducer works on AppContextState. Each case narrows `action.payload` to its type.
 */
export default function AppReducer(state: AppContextState, action: AppAction): AppContextState {
  switch (action.type) {
    // No CLEAR_SESSION: sign-out is signOut(auth), and the auth listener in AppContext
    // clears the user and user-scoped caches on every sign-out path.
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

    case 'SET_AUTH_MODAL_OPEN':
      // Pure UI state, not persisted: a reload shouldn't reopen the sign-in modal.
      return {
        ...state,
        authModalOpen: action.payload,
      };

    // No payload (e.g. setSnackBarProps() to close it) resets to a properly shaped default,
    // not {}, which lacked the fields the types promise (open, message…).
    case 'SET_ALERT_DIALOG_PROPS':
      return {
        ...state,
        alertDialogProps: action.payload ?? new AlertDialogProps(),
      };

    case 'SET_SNACKBAR_PROPS':
      return {
        ...state,
        snackBarProps: action.payload ?? new SnackBarProps(),
      };

    default: {
      // Exhaustiveness check: an AppAction added without a case here is a compile error.
      // At runtime (an untyped dispatch) it still leaves the state untouched.
      const unhandled: never = action;
      void unhandled;
      return state;
    }
  }
}
