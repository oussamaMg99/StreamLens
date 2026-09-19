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
  alertDialogProps: AlertDialogProps;
  snackBarProps: SnackBarProps;
}

export type AppContextActions = {
  clearSession: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setUser: (user?: User) => void;
  setAlertDialogProps: (dialog?: AlertDialogProps) => void;
  setSnackBarProps: (snackbar?: SnackBarProps) => void;
};

export type AppContextType = AppContextState & AppContextActions;
