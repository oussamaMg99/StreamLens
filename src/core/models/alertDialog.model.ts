export class AlertDialogProps {
  loadingAnimation?: boolean;
  open?: boolean;
  title?: any;
  content?: any;
  closeLabel?: string;
  confirmLabel?: string;
  showCancelButton?: boolean;

  onConfirm: () => Promise<boolean | undefined> | boolean;
  onClose?: () => void;

  constructor(state?: AlertDialogProps | any) {
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
