import { useContext, useState } from 'react';
import { Box, Checkbox, FormControlLabel, Link, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth, authErrorKey } from 'src/core/services/firebase.config';
import colors from 'src/assets/themes/colors';
import { AuthField, PasswordStrength, ProviderRow, isValidEmail, passwordScore } from './UserAuthShared.component';
import AuthError from 'src/components/modal/shared/AuthError.component';
import AppContext from 'src/core/context/global/AppContext';
import { toUser } from 'src/core/models/user.model';

interface SignUpForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface UserAuthSignUpTabProps {
  onAuthenticated?: () => void;
}

const UserAuthSignUpTab = (props: UserAuthSignUpTabProps) => {
  const { onAuthenticated } = props;
  const { setUser } = useContext(AppContext);
  const { t } = useTranslation();
  const [verificationSentTo, setVerificationSentTo] = useState('');
  const [form, setForm] = useState<SignUpForm>({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState('');

  const { displayName, email, password, confirmPassword } = form;

  const emailError = touched && !!email && !isValidEmail(email) ? t('invalidEmail') : '';
  const confirmError = !!confirmPassword && confirmPassword !== password ? t('passwordsDontMatch') : '';
  const canSubmit = isValidEmail(email) && passwordScore(password) >= 2 && password === confirmPassword && acceptedTerms;

  const updateField = (field: keyof SignUpForm) => (value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSignUp = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setLoading(true);
    setErrorKey('');
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
        // onAuthStateChanged fired at account creation, before the name existed, and
        // doesn't fire for profile updates — so push the updated snapshot ourselves.
        setUser(toUser(credential.user));
      }
      await sendEmailVerification(credential.user);
      setVerificationSentTo(credential.user.email ?? email.trim());
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setLoading(false);
    }
  };

  if (verificationSentTo) {
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
            color: colors.success.main,
            backgroundColor: 'rgba(46,191,165,0.16)',
            border: '1px solid rgba(46,191,165,0.5)',
          }}
        >
          <MarkEmailReadIcon />
        </Box>
        <Typography variant='h4'>{t('verifyYourEmail')}</Typography>
        <Typography variant='body2' sx={{ maxWidth: 300, color: 'rgba(255,255,227,0.65)' }}>
          {t('verificationSentTo', { email: verificationSentTo })}
        </Typography>
        <AuthError messageKey={errorKey} />
        <Box sx={{ display: 'flex', gap: 1.25, width: '100%', mt: 0.5 }}>
          <LoadingButton fullWidth loading={loading} variant='outlined' onClick={handleResend} sx={{ minHeight: 44 }}>
            {t('resend')}
          </LoadingButton>
          <LoadingButton fullWidth variant='contained' onClick={() => onAuthenticated?.()} sx={{ minHeight: 44, color: colors.onPrimary }}>
            {t('continue')}
          </LoadingButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <AuthError messageKey={errorKey} />
      <AuthField
        label={t('displayName')}
        value={displayName}
        onChange={updateField('displayName')}
        placeholder={t('displayNamePlaceholder')}
        autoComplete='name'
      />
      <AuthField
        label={t('email')}
        type='email'
        value={email}
        onChange={updateField('email')}
        placeholder='you@example.com'
        autoComplete='email'
        error={emailError}
      />
      <AuthField
        label={t('password')}
        type='password'
        value={password}
        onChange={updateField('password')}
        placeholder='••••••••'
        autoComplete='new-password'
      >
        <PasswordStrength password={password} />
      </AuthField>
      <AuthField
        label={t('confirmPassword')}
        type='password'
        value={confirmPassword}
        onChange={updateField('confirmPassword')}
        placeholder='••••••••'
        autoComplete='new-password'
        error={confirmError}
      />
      <FormControlLabel
        sx={{ alignItems: 'flex-start', m: 0, gap: 0.5 }}
        control={
          <Checkbox
            checked={acceptedTerms}
            onChange={event => setAcceptedTerms(event.target.checked)}
            sx={{ py: 0, color: 'rgba(255,255,227,0.45)', '&.Mui-checked': { color: colors.success.main } }}
          />
        }
        label={
          <Typography variant='body2' sx={{ fontSize: 13, color: 'rgba(255,255,227,0.7)' }}>
            {t('agreeToTermsPrefix')} <Link href='/terms'>{t('termsOfService')}</Link> {t('and')}{' '}
            <Link href='/privacy'>{t('privacyPolicy')}</Link>.
          </Typography>
        }
      />
      <LoadingButton
        fullWidth
        loading={loading}
        disabled={touched && !canSubmit}
        variant='contained'
        onClick={handleSignUp}
        sx={{ minHeight: 48, fontSize: 16, color: colors.onPrimary }}
      >
        {t('createAccount')}
      </LoadingButton>
      <ProviderRow intent='signUp' disabled={loading} onError={setErrorKey} onSuccess={() => onAuthenticated?.()} />
    </Box>
  );
};

export default UserAuthSignUpTab;
