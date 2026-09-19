import { useContext, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogContent, Divider, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkIcon from '@mui/icons-material/Link';
import { sendEmailVerification, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth, authErrorKey } from 'src/core/services/firebase.config';
import colors from 'src/assets/themes/colors';

import AuthError from 'src/components/modal/shared/AuthError.component';
import {
  InlineInput,
  ProfileAvatar,
  ProfileRow,
  ProviderChips,
  StatCard,
  VerifiedChip,
  formatRelative,
  getInitials,
  panelSx,
} from './UserProfileParts.component';
import AppContext from 'src/core/context/global/AppContext';
import { toUser } from 'src/core/models/user.model';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Read-only account summary that flips to inline editing. Photo, display name and
 * phone are the editable fields; email is not, because changing it requires
 * re-authentication and belongs in its own flow.
 */
const UserProfileModal = (props: UserProfileModalProps) => {
  const { open, onClose } = props;
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, setUser } = useContext(AppContext);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorKey, setErrorKey] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');

  // Render from the context snapshot (reactive). auth.currentUser is only for the SDK
  // calls in the handlers below — it's mutated in place, so reading it here goes stale.
  const displayName = user?.displayName ?? '';
  const email = user?.email ?? '';
  const phoneNumber = user?.phoneNumber ?? '';
  const photoURL = user?.photoURL ?? null;
  const emailVerified = user?.emailVerified ?? false;
  const providerIds = user?.providerIds ?? [];

  const created = useMemo(() => formatRelative(user?.createdAt, i18n.language), [user?.createdAt, i18n.language]);
  const lastSignIn = useMemo(() => formatRelative(user?.lastSignInAt, i18n.language), [user?.lastSignInAt, i18n.language]);

  const initials = getInitials(editing ? draftName : displayName, email);
  const dirty = editing && (draftName !== displayName || draftPhone !== phoneNumber);

  const startEdit = () => {
    setDraftName(displayName);
    setDraftPhone(phoneNumber);
    setErrorKey('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setErrorKey('');
  };

  const handleSave = async () => {
    const current = auth.currentUser;
    if (!current || !dirty) return;
    setSaving(true);
    setErrorKey('');
    try {
      // Phone changes require a verification flow (linkWithPhoneNumber) and are not
      // persisted here — only name and photo go through updateProfile.
      await updateProfile(current, { displayName: draftName.trim() });
      await current.reload();
      // onAuthStateChanged doesn't fire for profile edits, so push the new snapshot.
      setUser(toUser(current));
      setEditing(false);
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    const current = auth.currentUser;
    if (!current) return;
    try {
      await sendEmailVerification(current);
      setVerificationSent(true);
    } catch (error) {
      setErrorKey(authErrorKey(error));
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (error) {
      setErrorKey(authErrorKey(error));
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    onClose();
  };

  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      maxWidth='xs'
      fullWidth
      aria-labelledby='profile-title'
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          aria-label={t('close')}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, color: colors.primary.main }}
        >
          <CloseIcon />
        </IconButton>

        {/* Identity band */}
        <Box
          sx={{
            px: 3.5,
            pt: 3.5,
            pb: 2.75,
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(226,168,71,0.16) 0%, rgba(226,168,71,0.02) 100%)',
            borderBottom: '1px solid rgba(226,168,71,0.22)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <ProfileAvatar photoURL={photoURL} initials={initials} onChangePhoto={editing ? () => setErrorKey('') : undefined} />
          </Box>

          {editing ? (
            <InlineInput value={draftName} onChange={setDraftName} placeholder={t('displayNamePlaceholder')} width={260} />
          ) : (
            <Typography id='profile-title' variant='h3' sx={{ fontSize: 22 }}>
              {displayName || email.split('@')[0]}
            </Typography>
          )}

          <Typography variant='body2' sx={{ mt: 0.75, color: 'rgba(255,255,227,0.65)' }}>
            {email}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.25 }}>
            <VerifiedChip
              verified={emailVerified}
              action={
                emailVerified ? undefined : (
                  <Box
                    component='span'
                    onClick={handleVerify}
                    sx={{
                      pl: 1,
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: colors.primary.main,
                      borderLeft: '1px solid rgba(226,168,71,0.4)',
                    }}
                  >
                    {verificationSent ? t('sent') : t('resend')}
                  </Box>
                )
              }
            />
          </Box>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, px: 3.5, py: 2.5 }}>
          <AuthError messageKey={errorKey} />

          <Box sx={{ ...panelSx, px: 1.75, py: 0.5 }}>
            <ProfileRow
              icon={<PhoneIcon sx={{ fontSize: 17 }} />}
              label={t('phone')}
              input={
                editing ? <InlineInput value={draftPhone} onChange={setDraftPhone} placeholder='+1 555 000 0000' type='tel' /> : undefined
              }
              value={
                phoneNumber || (
                  <Box component='span' onClick={startEdit} sx={{ color: colors.primary.main, cursor: 'pointer' }}>
                    {t('addPhoneNumber')}
                  </Box>
                )
              }
            />
            <ProfileRow
              divider
              icon={<LinkIcon sx={{ fontSize: 17 }} />}
              label={t('signedInWith')}
              input={<ProviderChips providerIds={providerIds} />}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
            <StatCard label={t('memberSince')} value={created.relative} title={created.absolute} />
            <StatCard label={t('lastSignIn')} value={lastSignIn.relative} title={lastSignIn.absolute} />
          </Box>

          {!editing && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1.25 }}>
                <Button
                  fullWidth
                  variant='contained'
                  startIcon={<EditIcon />}
                  onClick={startEdit}
                  sx={{ minHeight: 46, color: colors.onPrimary }}
                >
                  {t('editProfile')}
                </Button>
                <Button fullWidth variant='outlined' startIcon={<LockOutlinedIcon />} onClick={handlePasswordReset} sx={{ minHeight: 46 }}>
                  {resetSent ? t('sent') : t('password')}
                </Button>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 0.5 }} />
              <Button
                fullWidth
                variant='outlined'
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                sx={{
                  minHeight: 46,
                  color: colors.error.main,
                  borderColor: 'rgba(232,93,93,0.5)',
                  '&:hover': { borderColor: colors.error.main, backgroundColor: 'rgba(232,93,93,0.12)' },
                }}
              >
                {t('signOut')}
              </Button>
            </Box>
          )}
        </DialogContent>

        {editing && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.25,
              px: 3.5,
              py: 2,
              position: fullScreen ? 'sticky' : 'static',
              bottom: 0,
              backgroundColor: 'rgba(20,20,20,0.75)',
              borderTop: '1px solid rgba(226,168,71,0.3)',
            }}
          >
            <Button
              fullWidth
              variant='outlined'
              onClick={cancelEdit}
              sx={{ minHeight: 46, color: 'rgba(255,255,227,0.85)', borderColor: 'rgba(255,255,255,0.22)' }}
            >
              {t('cancel')}
            </Button>
            <LoadingButton
              fullWidth
              loading={saving}
              disabled={!dirty}
              variant='contained'
              onClick={handleSave}
              sx={{ minHeight: 46, color: colors.onPrimary }}
            >
              {t('saveChanges')}
            </LoadingButton>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default UserProfileModal;
