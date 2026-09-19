export default function AppReducer(state: any, action: any) {
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
