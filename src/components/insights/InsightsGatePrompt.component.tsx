import { Box, Button, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';

interface InsightsGatePromptProps {
  access: 'signedOut' | 'unverified';
  /** useWatchListGate's promptIfBlocked: opens the auth modal or the verify-email dialog. */
  onAction: () => void;
}

/**
 * Shown instead of the feed when the watch list can't be read: insights are built from
 * it, and firestore.rules only allows a signed-in owner with a verified email.
 */
const InsightsGatePrompt = (props: InsightsGatePromptProps) => {
  const { access, onAction } = props;
  const { t } = useTranslation();
  const signedOut = access === 'signedOut';

  return (
    <Box
      sx={{
        maxWidth: 820,
        width: '100%',
        mx: 'auto',
        py: { xs: 2, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1.75,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: colors.primary.main,
          backgroundColor: 'rgba(226,168,71,0.14)',
          border: '1px solid rgba(226,168,71,0.5)',
        }}
      >
        {signedOut ? <LockOutlinedIcon sx={{ fontSize: 30 }} /> : <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 30 }} />}
      </Box>
      <Typography variant='h1' sx={{ fontWeight: 800, fontSize: { xs: 26, md: 32 } }}>
        {signedOut ? t('insightsSignInTitle') : t('insightsVerifyTitle')}
      </Typography>
      <Typography sx={{ maxWidth: 520, fontSize: { xs: 15, md: 16 }, color: 'rgba(255,255,227,0.7)' }}>
        {signedOut ? t('insightsSignInBody') : t('insightsVerifyBody')}
      </Typography>
      <Button variant='contained' onClick={onAction} sx={{ mt: 1, color: colors.onPrimary, minHeight: 44 }}>
        {signedOut ? t('signIn') : t('verifyYourEmail')}
      </Button>
    </Box>
  );
};

export default InsightsGatePrompt;
