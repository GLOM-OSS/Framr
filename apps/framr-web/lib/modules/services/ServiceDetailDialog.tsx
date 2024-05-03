import { Box, Button, Chip, Dialog, Typography } from '@mui/material';
import { DialogTransition } from '../../../components/sharedComponents/dialog-transition';
import { Service } from '../../types';

interface ServiceDetailDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  handleEdit: () => void;
  data: Service;
}
export default function ServiceDetailDialog({
  isDialogOpen,
  closeDialog,
  handleEdit,
  data,
}: ServiceDetailDialogProps) {
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
          Service Details
        </Typography>

        <Box sx={{ display: 'grid', rowGap: 2 }}>
          <Box
            sx={{
              display: 'grid',
              rowGap: 2,
              padding: { laptop: '16px 40px 0 40px', mobile: 0 },
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 500,
                  color: '#6E6D7A',
                }}
              >
                Name
              </Typography>
              <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                {data.name}
              </Typography>
            </Box>
            {data.interact && (
              <Box>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#6E6D7A',
                  }}
                >
                  Name
                </Typography>
                <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                  {data.name}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography
                sx={{
                  fontWeight: 500,
                  color: '#6E6D7A',
                }}
              >
                DPoints
              </Typography>
              {data.dpoints.length ? (
                data.dpoints.map(({ name }, key) => (
                  <Chip
                    key={key}
                    label={name}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))
              ) : (
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#2F3A45',
                    fontStyle: 'italic',
                  }}
                >
                  No DPoints
                </Typography>
              )}
            </Box>
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
