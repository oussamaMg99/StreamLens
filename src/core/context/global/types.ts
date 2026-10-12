import { AlertDialogProps } from 'src/core/models/alertDialog.model';
import { SnackBarProps } from 'src/core/models/snackbar.model';
import { User } from 'src/core/models/user.model';

export type ThemeMode = 'default' | 'dark' | 'light';

export interface AppContextState {
  themeMode: ThemeMode;
  /** undefined when signed out, so `!!user` is a meaningful "is signed in" check. */
  user: User | undefined;
  /**
   * false until Firebase has restored (or ruled out) a session on load. Until then
   * `user` is undefined even for a signed-in visitor, so don't treat that as signed out.
   */
  authReady: boolean;
  /**
   * The sign-in/sign-up modal is global so any component can prompt for sign-in — e.g.
   * the Summary modal's watch-list controls, which sit far from the Navbar.
   */
  authModalOpen: boolean;
  alertDialogProps: AlertDialogProps;
  snackBarProps: SnackBarProps;
}

export type AppContextActions = {
  setThemeMode: (mode: ThemeMode) => void;
  setUser: (user?: User) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAlertDialogProps: (dialog?: AlertDialogProps) => void;
  setSnackBarProps: (snackbar?: SnackBarProps) => void;
};

export type AppContextType = AppContextState & AppContextActions;

/**
 * Every action AppReducer handles, each with its own payload type, so a misspelled type or
 * a wrong payload is a compile error. An undefined dialog/snackbar payload resets it.
 */
export type AppAction =
  | { type: 'SET_THEME_MODE'; payload: ThemeMode }
  | { type: 'SET_USER'; payload: User | undefined }
  | { type: 'SET_AUTH_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_ALERT_DIALOG_PROPS'; payload: AlertDialogProps | undefined }
  | { type: 'SET_SNACKBAR_PROPS'; payload: SnackBarProps | undefined };
