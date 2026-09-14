import { ReactNode, useState } from 'react';
import { Alert, Box, Divider, IconButton, InputBase, LinearProgress, SvgIcon, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { FirebaseError } from 'firebase/app';
import { FacebookAuthProvider, GoogleAuthProvider, OAuthProvider, signInWithPopup, type AuthProvider } from 'firebase/auth';
import { auth } from 'src/core/services/firebase.config';
import colors from 'src/assets/themes/colors';
import { useTranslation } from 'react-i18next';

/**
 * Pieces shared by UserAuthSignInTab and UserAuthSignUpTab. They're in one file rather
 * than one file each because neither is meaningful on its own — both tabs render the
 * identical field and provider treatments, and the tabs are the only consumers.
 */

/** Amber ink that actually passes contrast on the amber fill (palette contrastText is #fff → 2.12:1). */
export const onPrimary = '#1F0303';

const fieldSx = (error?: boolean) => ({
  px: 1.75,
  minHeight: 46,
  display: 'flex',
  alignItems: 'center',
  borderRadius: '10px',
  backgroundColor: colors.phantomBlack,
  border: `1px solid ${error ? colors.error.main : 'rgba(226, 168, 71, 0.5)'}`,
  transition: 'border-color .15s ease, box-shadow .15s ease',
  '&:focus-within': {
    borderColor: colors.primary.main,
    boxShadow: '0 0 0 2px rgba(226, 168, 71, 0.25)',
  },
});

interface AuthFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  /** Rendered on the label row, right-aligned — used for "Forgot password?". */
  action?: ReactNode;
  children?: ReactNode;
}

/**
 * Labelled input built on InputBase in a bordered Box, the same idiom as SearchBar.
 * Deliberately not MuiTextField: the theme's MuiTextField override paints inputs white,
 * which can't work on the dark dialog.
 */
export const AuthField = (props: AuthFieldProps) => {
  const { label, value, onChange, type = 'text', placeholder, autoComplete, error, action, children } = props;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.25 }}>
        <Typography component='label' variant='body2' sx={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,227,0.75)' }}>
          {label}
        </Typography>
        {action}
      </Box>
      <Box sx={fieldSx(!!error)}>
        <InputBase
          fullWidth
          type={isPassword && !reveal ? 'password' : type === 'password' ? 'text' : type}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          sx={{ fontSize: 15, color: colors.text.primary, '& input::placeholder': { color: 'rgba(255,255,227,0.35)', opacity: 1 } }}
        />
        {isPassword && (
          <IconButton size='small' aria-label='toggle password visibility' onClick={() => setReveal(prev => !prev)}>
            {reveal ? <VisibilityOffIcon fontSize='small' /> : <VisibilityIcon fontSize='small' />}
          </IconButton>
        )}
      </Box>
      {children}
      {!!error && (
        <Typography variant='caption' sx={{ color: colors.error.main }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

/* ---------------------------------------------------------------- validation */

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** 0-4. Length carries two points on purpose: it's the factor that actually matters. */
export const passwordScore = (password: string) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
};

export const PasswordStrength = (props: { password: string }) => {
  const { password } = props;
  const { t } = useTranslation();
  const score = passwordScore(password);
  const scale = [
    { label: t('passwordWeak'), color: colors.error.main },
    { label: t('passwordWeak'), color: colors.error.main },
    { label: t('passwordFair'), color: colors.primary.main },
    { label: t('passwordGood'), color: '#8CC152' },
    { label: t('passwordStrong'), color: colors.success.main },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
      <LinearProgress
        variant='determinate'
        value={(score / 4) * 100}
        sx={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.14)',
          '& .MuiLinearProgress-bar': { backgroundColor: scale[score].color, borderRadius: 2 },
        }}
      />
      <Typography
        variant='caption'
        sx={{ minWidth: 52, textAlign: 'right', fontWeight: 600, color: password ? scale[score].color : 'rgba(255,255,227,0.4)' }}
      >
        {password ? scale[score].label : '—'}
      </Typography>
    </Box>
  );
};

/* ------------------------------------------------------------------- errors */

/**
 * Firebase error codes are not user-facing copy. Anything unmapped falls back to the
 * app's generic message rather than leaking a code into the UI.
 */
export const authErrorKey = (error: unknown) => {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'authInvalidCredentials';
    case 'auth/email-already-in-use':
      return 'authEmailInUse';
    case 'auth/weak-password':
      return 'authWeakPassword';
    case 'auth/account-exists-with-different-credential':
      return 'authAccountExistsWithProvider';
    case 'auth/too-many-requests':
      return 'authTooManyRequests';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '';
    default:
      return 'errorOccurred';
  }
};

export const AuthError = (props: { messageKey: string }) => {
  const { messageKey } = props;
  const { t } = useTranslation();
  if (!messageKey) return null;
  const isProviderHint = messageKey === 'authAccountExistsWithProvider';

  return (
    <Alert
      severity={isProviderHint ? 'warning' : 'error'}
      icon={false}
      sx={{
        borderRadius: '10px',
        color: colors.text.primary,
        backgroundColor: isProviderHint ? 'rgba(226,168,71,0.10)' : 'rgba(232,93,93,0.12)',
        border: `1px solid ${isProviderHint ? 'rgba(226,168,71,0.45)' : 'rgba(232,93,93,0.45)'}`,
        '& .MuiAlert-message': { fontSize: 13, lineHeight: 1.55, py: 0 },
      }}
    >
      {t(messageKey)}
    </Alert>
  );
};

/* ---------------------------------------------------------------- providers */

const AppleIcon = () => (
  <SvgIcon viewBox='0 0 24 24'>
    <path d='M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z' />
  </SvgIcon>
);

/**
 * Apple sign-in needs a paid Apple Developer account and a Services ID. Until that
 * exists the tile should stay hidden rather than fail on click — flip this flag (or
 * move it to an env var) once the provider is configured in the Firebase console.
 */
const APPLE_ENABLED = false;

const providers: { id: string; label: string; icon: ReactNode; create: () => AuthProvider }[] = [
  { id: 'google', label: 'Google', icon: <GoogleIcon />, create: () => new GoogleAuthProvider() },
  { id: 'apple', label: 'Apple', icon: <AppleIcon />, create: () => new OAuthProvider('apple.com') },
  { id: 'facebook', label: 'Facebook', icon: <FacebookIcon />, create: () => new FacebookAuthProvider() },
];

interface ProviderRowProps {
  /** 'signIn' | 'signUp' — only changes the divider copy; the call is the same. */
  intent: 'signIn' | 'signUp';
  disabled?: boolean;
  onError: (messageKey: string) => void;
  onSuccess: () => void;
}

export const ProviderRow = (props: ProviderRowProps) => {
  const { intent, disabled, onError, onSuccess } = props;
  const { t } = useTranslation();
  const [pending, setPending] = useState('');
  const available = providers.filter(provider => provider.id !== 'apple' || APPLE_ENABLED);

  const handleClick = async (provider: (typeof providers)[number]) => {
    setPending(provider.id);
    onError('');
    try {
      await signInWithPopup(auth, provider.create());
      onSuccess();
    } catch (error) {
      onError(authErrorKey(error));
    } finally {
      setPending('');
    }
  };

  return (
    <>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 0.5 }}>
        <Typography variant='caption' sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,227,0.5)' }}>
          {intent === 'signUp' ? t('orSignUpWith') : t('orContinueWith')}
        </Typography>
      </Divider>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${available.length}, 1fr)`, gap: 1.25 }}>
        {available.map(provider => (
          <Box
            key={provider.id}
            component='button'
            type='button'
            aria-label={`${intent === 'signUp' ? t('signUp') : t('signIn')} — ${provider.label}`}
            disabled={disabled || !!pending}
            onClick={() => handleClick(provider)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              minHeight: 62,
              cursor: 'pointer',
              borderRadius: '10px',
              color: colors.text.primary,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.16)',
              opacity: pending && pending !== provider.id ? 0.5 : 1,
              transition: 'background-color .15s ease, border-color .15s ease',
              '&:hover:not(:disabled)': {
                backgroundColor: 'rgba(226,168,71,0.10)',
                borderColor: 'rgba(226,168,71,0.5)',
              },
              '&:disabled': { cursor: 'default' },
            }}
          >
            {provider.icon}
            <Typography variant='caption' sx={{ fontWeight: 500, color: 'rgba(255,255,227,0.75)' }}>
              {provider.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};
