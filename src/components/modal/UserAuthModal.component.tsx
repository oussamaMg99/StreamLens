import { useContext, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Divider, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import UserAuthSignInTab from './UserAuthSignInTab.component';
import UserAuthSignUpTab from './UserAuthSignUpTab.component';
import { useTranslation } from 'react-i18next';
import AppContext from 'src/core/context/global/AppContext';
import colors from 'src/assets/themes/colors';

interface UserAuthModalProps {
  open: boolean;
  onClose: () => void;
}

const UserAuthModal = (props: UserAuthModalProps) => {
  const { open, onClose } = props;
  const { setSnackBarProps } = useContext(AppContext);
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };
  return (
    <Dialog maxWidth='xs' fullWidth open={open} onClose={onClose}>
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={theme => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.primary.main,
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundImage: `linear-gradient(135deg, #5A431C 0%, #1f0303 100%)`,
          backgroundSize: 'cover',
        }}
      >
        <Typography variant='h3' color='primary' sx={{ textAlign: 'center', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
          {t('appName')}
        </Typography>
        <TabContext value={tabValue}>
          <TabList
            centered
            indicatorColor='primary'
            sx={{ borderBottom: 1, borderColor: 'rgba(226, 168, 71, 0.25)' }}
            onChange={handleTabChange}
          >
            <Tab label={t('signIn')} value='1' />

            <Tab label={t('signUp')} value='2' />
          </TabList>
          <TabPanel sx={{ p: 0 }} value='1'>
            <UserAuthSignInTab onAuthenticated={onClose} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='2'>
            <UserAuthSignUpTab onAuthenticated={onClose} />
          </TabPanel>
        </TabContext>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 0.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Typography>{t('justBrowsing')}</Typography>
          <Typography component={Button} sx={{ cursor: 'pointer', color: colors.primary.main }}>
            {t('continueAsGuest')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UserAuthModal;
