/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useEffect, useMemo, useReducer } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { AppContextType, ThemeMode } from './types';
import AppReducer from './AppReducer';
import { AlertDialogProps } from 'src/core/models/alertDialog.model';
import { SnackBarProps } from 'src/core/models/snackbar.model';
import { User, toUser } from 'src/core/models/user.model';
import { auth } from 'src/core/services/firebase.config';
import { WATCH_LIST_QUERY_ROOT } from 'src/core/services/watchList.service';
// The provider sits outside the component tree's translation hooks, so this effect uses
// the i18next instance directly.
import i18n from 'src/assets/locales/i18n';

const initialState: AppContextType = {
  themeMode: JSON.parse(localStorage.getItem('_themeMode') ?? '{}'),
  // Not hydrated from storage: Firebase persists the session itself, and the auth
  // listener below fills this in once that session is restored.
  user: undefined,
  authReady: false,
  authModalOpen: false,
  alertDialogProps: new AlertDialogProps(),
  snackBarProps: new SnackBarProps(),
  setThemeMode: () => {},
  setUser: () => {},
  setAuthModalOpen: () => {},
  setAlertDialogProps: () => {},
  setSnackBarProps: () => {},
};

const AppContext = createContext(initialState);

export const AppContextProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);
  // Available because main.tsx nests this provider inside QueryClientProvider.
  const queryClient = useQueryClient();

  // Single source of truth for who's signed in. Covers every path that changes it —
  // email and provider sign-in, sign-up, session restore on reload, sign-out, revoked
  // sessions — so no individual form has to remember to call setUser.
  useEffect(() => {
    // Older builds stored the whole Firebase user (refresh token included) here.
    sessionStorage.removeItem('_user');
    return onAuthStateChanged(auth, firebaseUser => {
      dispatch({ type: 'SET_USER', payload: firebaseUser ? toUser(firebaseUser) : undefined });
      // Sign-out cleanup lives here rather than in a sign-out button: revoked or expired
      // sessions, a deleted account, and sign-out in another tab all end up here without
      // running any app code. Only user-scoped caches go; TMDB data isn't per-user.
      if (!firebaseUser) queryClient.removeQueries({ queryKey: [WATCH_LIST_QUERY_ROOT] });
    });
  }, [queryClient]);

  // Email verification happens on a Firebase-hosted page in another tab, and
  // onAuthStateChanged does NOT fire for it — without this, a user who just verified
  // stays locked out of the watch list until a manual reload. Re-checking on focus costs
  // one request, and only while still unverified.
  useEffect(() => {
    const refreshVerification = async () => {
      const current = auth.currentUser;
      if (!current || current.emailVerified || document.visibilityState === 'hidden') return;
      await current.reload();
      if (!current.emailVerified) return;
      dispatch({ type: 'SET_USER', payload: toUser(current) });
      dispatch({
        type: 'SET_SNACKBAR_PROPS',
        payload: new SnackBarProps({ open: true, severity: 'success', message: i18n.t('emailVerifiedNow') }),
      });
      queryClient.invalidateQueries({ queryKey: [WATCH_LIST_QUERY_ROOT, current.uid] });
    };

    window.addEventListener('focus', refreshVerification);
    document.addEventListener('visibilitychange', refreshVerification);
    return () => {
      window.removeEventListener('focus', refreshVerification);
      document.removeEventListener('visibilitychange', refreshVerification);
    };
  }, [queryClient]);

  const setThemeMode = (mode: ThemeMode) => {
    dispatch({
      type: 'SET_THEME_MODE',
      payload: mode,
    });
  };

  const setUser = (user?: User) => {
    dispatch({
      type: 'SET_USER',
      payload: user,
    });
  };

  const setAuthModalOpen = (open: boolean) => {
    dispatch({
      type: 'SET_AUTH_MODAL_OPEN',
      payload: open,
    });
  };

  const setAlertDialogProps = (dialog?: AlertDialogProps) => {
    dispatch({
      type: 'SET_ALERT_DIALOG_PROPS',
      payload: dialog,
    });
  };

  const setSnackBarProps = (dialog?: SnackBarProps) => {
    dispatch({
      type: 'SET_SNACKBAR_PROPS',
      payload: dialog,
    });
  };

  const contextValue = useMemo(
    () => ({
      themeMode: state.themeMode,
      user: state.user,
      authReady: state.authReady,
      authModalOpen: state.authModalOpen,
      alertDialogProps: state.alertDialogProps,
      snackBarProps: state.snackBarProps,
      setThemeMode,
      setUser,
      setAuthModalOpen,
      setAlertDialogProps,
      setSnackBarProps,
    }),
    [
      state.themeMode,
      state.user,
      state.authReady,
      state.authModalOpen,
      state.alertDialogProps,
      state.snackBarProps,
      setThemeMode,
      setUser,
      setAuthModalOpen,
      setAlertDialogProps,
      setSnackBarProps,
    ],
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContext;
