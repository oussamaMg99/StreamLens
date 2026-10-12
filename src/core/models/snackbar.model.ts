import { AlertColor } from '@mui/material';

export class SnackBarProps {
  autoHideDuration?: number | null;
  open: boolean;
  severity: AlertColor | undefined;
  message: string;

  constructor(state?: Partial<SnackBarProps>) {
    this.open = Boolean(state?.open);
    this.severity = state?.severity;
    this.message = state?.message ?? '';
    this.autoHideDuration = state?.autoHideDuration;
  }
}
