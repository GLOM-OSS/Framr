import warning from '@iconify/icons-fluent/warning-24-filled';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { theme } from '../../lib/theme';
import { DialogTransition } from './dialog-transition';

interface ConfirmDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  confirm: () => void;
  dialogMessage: string;
  dialogTitle?: string;
  confirmButton?: string;
  danger?: boolean;
  closeOnConfirm?: boolean;
  isSubmitting?: boolean;
}

export function ConfirmDialog({
  isDialogOpen,
  closeDialog,
  confirm,
  dialogMessage,
  dialogTitle = 'delete',
  confirmButton = 'delete',
  danger = false,
  closeOnConfirm = false,
  isSubmitting = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={isDialogOpen}
      TransitionComponent={DialogTransition}
      keepMounted
      onClose={() => (isSubmitting ? null : closeDialog())}
      sx={{
        '& .MuiPaper-root': {
          padding: { laptop: '16px 40px', mobile: 0 },
          borderRadius: 1.5,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: danger ? theme.palette.error.main : 'initial',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'grid', justifyItems: 'center' }}>
          <Icon icon={warning} fontSize={48} color={theme.palette.error.main} />
          {dialogTitle}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center' }}>
          {dialogMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'center',
          display: 'grid',
          gridAutoFlow: 'column',
          columnGap: '20px',
        }}
      >
        <Button
          color="inherit"
          variant="outlined"
          onClick={() => (isSubmitting ? null : closeDialog())}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          color={danger ? 'error' : 'primary'}
          variant="contained"
          disabled={isSubmitting}
          onClick={() => {
            confirm();
            if (!closeOnConfirm) closeDialog();
          }}
          startIcon={
            isSubmitting && (
              <CircularProgress
                color={danger ? 'error' : 'primary'}
                size={18}
              />
            )
          }
        >
          {confirmButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
