import { AlertDialogProps } from 'src/core/models/alertDialog.model';
import { SnackBarProps } from 'src/core/models/snackbar.model';
import { User } from 'src/core/models/user.model';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';

export type ThemeMode = 'default' | 'dark' | 'light';

export interface AppContextState {
  themeMode: ThemeMode;
  user: User;
  alertDialogProps: AlertDialogProps;
  snackBarProps: SnackBarProps;
}

export type AppContextActions = {
  clearSession: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setUser: (user: User) => void;
  setAlertDialogProps: (dialog?: AlertDialogProps) => void;
  setSnackBarProps: (snackbar?: SnackBarProps) => void;
};

export type AppContextType = AppContextState & AppContextActions;
