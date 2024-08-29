import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormLabel,
  Menu,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { DPointsEventChannel, DPointsService } from '../../../services';
import {
  EventBus,
  EventBusChannelStatus,
} from '../../../services/libs/event-bus';
import { DPoint } from '../../../types';

interface NewDPointProps {
  isMenuOpen: boolean;
  anchorEl: HTMLElement | null;
  closeMenu: () => void;
  handleSubmit: (dPoint: DPoint) => void;
}
export default function NewDPointMenu({
  anchorEl,
  isMenuOpen,
  closeMenu,
  handleSubmit,
}: NewDPointProps) {
  const eventBus = new EventBus();
  const dpointsService = new DPointsService();
  const [dPoints, setDPoints] = useState<DPoint[]>([]);

  function fetchDPoints() {
    eventBus.once<DPoint[]>(
      DPointsEventChannel.FIND_ALL_DPOINT_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setDPoints(data);
        }
      }
    );
    dpointsService.findAll();
  }

  useEffect(() => {
    fetchDPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [dPoint, setDPoint] = useState<DPoint | null>(null);

  return (
    <Menu
      elevation={0}
      anchorEl={anchorEl}
      sx={{
        '& .MuiPaper-root': {
          minWidth: '300px',
        },
      }}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'bottom',
      }}
      transformOrigin={{
        vertical: -10,
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={closeMenu}
    >
      <Box sx={{ display: 'grid', rowGap: 2, p: 1 }}>
        <Typography variant="body2" color="#6E6D7A">
          Add Dpoint
        </Typography>
        <Box sx={{ display: 'grid', rowGap: 1 }}>
          <Autocomplete
            options={dPoints}
            autoHighlight
            size="small"
            getOptionLabel={({ name }) => name}
            onChange={(_, selectedDPoint) => setDPoint(selectedDPoint)}
            value={dPoint}
            renderInput={(params) => (
              <FormControl fullWidth>
                <FormLabel>Enter dpoint</FormLabel>
                <TextField
                  {...params}
                  placeholder="Select primary dpoint"
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'autocomplete',
                  }}
                />
              </FormControl>
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              closeMenu();
              handleSubmit(dPoint as DPoint);
            }}
            disabled={!dPoint}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Menu>
  );
}
