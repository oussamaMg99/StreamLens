import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';

/**
 * Inline error banner for Firebase Auth failures, fed an i18n key from `authErrorKey`
 * (firebase.config.ts). Used by both the auth and profile modals. Renders nothing for
 * an empty key.
 */
const AuthError = (props: { messageKey: string }) => {
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

export default AuthError;
