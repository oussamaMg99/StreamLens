// src/core/hooks/useWatchListGate.ts
//
// Single decision point for "may this user touch the watch list, and if not, what do we
// tell them?". firestore.rules allows only a signed-in owner with a verified email, so
// there are three blocked states, each with its own prompt — no watch-list control
// should fail silently or report a generic error for any of them.

import { useContext } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import AppContext from 'src/core/context/global/AppContext';
import { auth, authErrorKey } from 'src/core/services/firebase.config';
import { AlertDialogProps } from 'src/core/models/alertDialog.model';

/** 'loading' while Firebase restores the session — not the same as signed out. */
export type WatchListAccess = 'loading' | 'signedOut' | 'unverified' | 'ready';

export const useWatchListGate = () => {
  const { user, authReady, setAuthModalOpen, setAlertDialogProps, setSnackBarProps } = useContext(AppContext);
  const { t } = useTranslation();

  let access: WatchListAccess = 'ready';
  if (!authReady) access = 'loading';
  else if (!user) access = 'signedOut';
  else if (!user.emailVerified) access = 'unverified';

  const handleResend = async () => {
    // currentUser rather than the context snapshot: sendEmailVerification needs the
    // live Firebase object, not a plain copy of its fields.
    const current = auth.currentUser;
    if (!current) return true;
    try {
      await sendEmailVerification(current);
      setSnackBarProps({
        open: true,
        severity: 'success',
        message: t('verificationSentTo', { email: current.email ?? '' }),
      });
    } catch (error) {
      setSnackBarProps({ open: true, severity: 'error', message: t(authErrorKey(error) || 'errorOccurred') });
    }
    setAlertDialogProps(new AlertDialogProps());
    return true;
  };

  /**
   * Call before any watch-list write. Opens the prompt that fits the blocked state and
   * returns true when the caller should stop.
   */
  const promptIfBlocked = () => {
    if (access === 'ready') return false;
    if (access === 'loading') return true; // Session still restoring; a prompt now could be wrong.

    if (access === 'signedOut') {
      setAuthModalOpen(true);
      return true;
    }

    // Reuses the global AlertDialog: "Verify your email" with Resend as the confirm action.
    setAlertDialogProps(
      new AlertDialogProps({
        open: true,
        loadingAnimation: true,
        showCancelButton: true,
        title: t('verifyYourEmail'),
        content: t('verifyEmailToSaveHint'),
        confirmLabel: t('resend'),
        closeLabel: t('close'),
        onConfirm: handleResend,
      }),
    );
    return true;
  };

  /** Tooltip copy for the blocked states; empty once the control actually works. */
  const blockedHint = access === 'signedOut' ? t('signInToSave') : access === 'unverified' ? t('verifyEmailToSave') : '';

  return { access, canWrite: access === 'ready', promptIfBlocked, blockedHint };
};
