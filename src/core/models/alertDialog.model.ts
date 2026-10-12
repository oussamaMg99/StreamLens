import type { ReactNode } from 'react';

export class AlertDialogProps {
  loadingAnimation?: boolean;
  open?: boolean;
  title?: ReactNode;
  content?: ReactNode;
  closeLabel?: string;
  confirmLabel?: string;
  showCancelButton?: boolean;

  /** Optional: a reset dialog (`new AlertDialogProps()`) has no action to confirm. */
  onConfirm?: () => Promise<boolean | undefined> | boolean;
  onClose?: () => void;

  constructor(state?: Partial<AlertDialogProps>) {
    this.loadingAnimation = state?.loadingAnimation;
    this.open = Boolean(state?.open);
    this.title = state?.title;
    this.content = state?.content;
    this.closeLabel = state?.closeLabel;
    this.confirmLabel = state?.confirmLabel;
    this.onConfirm = state?.onConfirm;
    this.onClose = state?.onClose;
    this.showCancelButton = state?.showCancelButton;
  }
}
