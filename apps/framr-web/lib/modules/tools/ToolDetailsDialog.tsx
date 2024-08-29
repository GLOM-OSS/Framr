import { Box, Button, Dialog, Typography, capitalize } from '@mui/material';
import { DialogTransition } from '../../../components/sharedComponents/dialog-transition';
import { ITool } from '../../types';

interface ToolDetailDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  handleEdit: () => void;
  data: ITool;
}
export default function ToolDetailDialog({
  isDialogOpen,
  closeDialog,
  handleEdit,
  data,
}: ToolDetailDialogProps) {
  const close = () => {
    closeDialog();
  };

  return (
    <Dialog
      open={isDialogOpen}
      TransitionComponent={DialogTransition}
      keepMounted
      onClose={close}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 1.5,
        },
      }}
    >
      <Box sx={{ padding: { laptop: '16px 0', mobile: 0 } }}>
        <Typography
          variant="h4"
          sx={{ padding: { laptop: '0 40px', mobile: 0 } }}
        >
          Tool Details
        </Typography>

        <Box sx={{ display: 'grid', rowGap: 2 }}>
          <Box
            sx={{
              display: 'grid',
              rowGap: 2,
              padding: { laptop: '16px 40px 0 40px', mobile: 0 },
            }}
          >
            {Object.keys(data)
              .filter((key) => key !== 'id')
              .map((key, index) => {
                return (
                  <Box key={index}>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        color: '#6E6D7A',
                      }}
                    >
                      {capitalize(key)}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                      {data[key as keyof typeof data]}
                    </Typography>
                  </Box>
                );
              })}
          </Box>
          <Box
            py={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              justifyItems: 'end',
              borderTop: '1px solid #E0E0E0',
              columnGap: 4,
              padding: { laptop: '16px 40px 0 40px', mobile: 0 },
            }}
          >
            <Button variant="outlined" color="inherit" onClick={close}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleEdit}>
              Edit
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
