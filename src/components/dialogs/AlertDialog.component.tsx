import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { LoadingButton } from '@mui/lab';
import { Typography } from '@mui/material';

interface Props {
  loadingAnimation?: boolean;
  open: boolean;
  title: any;
  content: any;
  closeLabel?: string;
  confirmLabel?: string;
  onClose: () => Promise<void>;
  onConfirm: () => Promise<void>;
  showCancelButton?: boolean;
}

export default function AlertDialog(props: Readonly<Props>) {
  const { loadingAnimation = false, open, title, content, closeLabel, confirmLabel, onConfirm, onClose, showCancelButton } = props;
  const [loadingState, setLoadingState] = useState(false);

  const handleConfirmClick = async () => {
    if (loadingAnimation) {
      setLoadingState(true);
    }
    await onConfirm();
    setLoadingState(false);
  };

  const handleCloseClick = async () => {
    if (loadingAnimation) {
      setLoadingState(true);
    }
    await onClose();
    setLoadingState(false);
  };

  return (
    <div>
      <Dialog fullWidth={true} open={open} onClose={onClose}>
        <DialogTitle>
          <Typography color='primary' align='center' fontSize={24} fontWeight={600}>
            {title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography align='center' fontSize={14}>
              {content}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {showCancelButton !== false && (
            <Button variant='outlined' disabled={loadingState} onClick={handleCloseClick} disableElevation>
              {closeLabel ?? 'Cancel'}
            </Button>
          )}
          <LoadingButton type='submit' variant='outlined' loadingPosition='center' loading={loadingState} onClick={handleConfirmClick}>
            {confirmLabel ?? 'Proceed'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
