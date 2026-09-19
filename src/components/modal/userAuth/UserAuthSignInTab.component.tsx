import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth, authErrorKey } from 'src/core/services/firebase.config';
import colors from 'src/assets/themes/colors';
import { AuthField, ProviderRow, isValidEmail } from './UserAuthShared.component';
import AuthError from 'src/components/modal/shared/AuthError.component';

type SignInView = 'form' | 'forgotPassword' | 'resetSent';

interface SignInCredentials {
  email: string;
  password: string;
}

interface UserAuthSignInTabProps {
  /** Called once the user is authenticated, so the modal can close itself. */
  onAuthenticated?: () => void;
}

const UserAuthSignInTab = (props: UserAuthSignInTabProps) => {
  const { onAuthenticated } = props;
  const { t } = useTranslation();
  const [view, setView] = useState<SignInView>('form');
  const [credentials, setCredentials] = useState<SignInCredentials>({ email: '', password: '' });
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState('');

  const { email, password } = credentials;

  // Functional update so a keystroke in one field can't overwrite the other with a stale copy.
  const updateCredential = (field: keyof SignInCredentials) => (value: string) => setCredentials(prev => ({ ...prev, [field]: value }));

  const emailError = touched && !!email && !isValidEmail(email) ? t('invalidEmail') : '';
  const canSubmit = isValidEmail(email) && !!password;

  const handleSignIn = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setLoading(true);
    setErrorKey('');
    try {
      // No setUser here: the onAuthStateChanged listener in AppContext picks the user up.
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onAuthenticated?.();
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!isValidEmail(email)) {
      setTouched(true);
      return;
    }
    setLoading(true);
    setErrorKey('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setView('resetSent');
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setLoading(false);
    }
  };

  const backToForm = () => {
    setView('form');
    setErrorKey('');
  };

  if (view === 'resetSent') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1.75,
          py: 3,
          minHeight: 300,
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            color: colors.primary.main,
            backgroundColor: 'rgba(226,168,71,0.14)',
            border: '1px solid rgba(226,168,71,0.5)',
          }}
        >
          <EmailOutlinedIcon />
        </Box>
        <Typography variant='h4'>{t('checkYourInbox')}</Typography>
        <Typography variant='body2' sx={{ maxWidth: 300, color: 'rgba(255,255,227,0.65)' }}>
          {t('resetLinkSentTo', { email: email.trim() })}
        </Typography>
        <Typography onClick={backToForm} sx={{ mt: 0.5, fontWeight: 600, fontSize: 14, color: colors.primary.main, cursor: 'pointer' }}>
          {t('backToSignIn')}
        </Typography>
      </Box>
    );
  }

  if (view === 'forgotPassword') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 300 }}>
        <Box
          onClick={backToForm}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            alignSelf: 'flex-start',
            color: colors.primary.main,
            cursor: 'pointer',
          }}
        >
          <ArrowBackIcon fontSize='small' />
          <Typography sx={{ fontWeight: 500, fontSize: 14, color: 'inherit' }}>{t('backToSignIn')}</Typography>
        </Box>
        <Box>
          <Typography variant='h4' sx={{ mb: 0.75 }}>
            {t('resetYourPassword')}
          </Typography>
          <Typography variant='body2' sx={{ color: 'rgba(255,255,227,0.65)' }}>
            {t('resetPasswordHint')}
          </Typography>
        </Box>
        <AuthError messageKey={errorKey} />
        <AuthField
          label={t('email')}
          type='email'
          value={email}
          onChange={updateCredential('email')}
          placeholder='you@example.com'
          autoComplete='email'
          error={emailError}
        />
        <LoadingButton
          fullWidth
          loading={loading}
          variant='contained'
          onClick={handleReset}
          sx={{ minHeight: 48, fontSize: 16, color: colors.onPrimary }}
        >
          {t('sendResetLink')}
        </LoadingButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <AuthError messageKey={errorKey} />
      <AuthField
        label={t('email')}
        type='email'
        value={email}
        onChange={updateCredential('email')}
        placeholder='you@example.com'
        autoComplete='email'
        error={emailError}
      />
      <AuthField
        label={t('password')}
        type='password'
        value={password}
        onChange={updateCredential('password')}
        placeholder='••••••••'
        autoComplete='current-password'
        action={
          <Typography
            onClick={() => setView('forgotPassword')}
            sx={{ fontWeight: 500, fontSize: 13, color: colors.primary.main, cursor: 'pointer' }}
          >
            {t('forgotPassword')}
          </Typography>
        }
      />
      <LoadingButton
        fullWidth
        loading={loading}
        disabled={touched && !canSubmit}
        variant='contained'
        onClick={handleSignIn}
        sx={{ minHeight: 48, fontSize: 16, color: colors.onPrimary }}
      >
        {t('signIn')}
      </LoadingButton>
      <ProviderRow intent='signIn' disabled={loading} onError={setErrorKey} onSuccess={() => onAuthenticated?.()} />
    </Box>
  );
};

export default UserAuthSignInTab;
