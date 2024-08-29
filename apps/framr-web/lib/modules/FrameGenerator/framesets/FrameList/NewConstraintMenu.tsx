import up from '@iconify/icons-fluent/arrow-sort-up-24-regular';
import watch from '@iconify/icons-fluent/timer-24-regular';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Menu,
  TextField,
  Typography,
  capitalize,
} from '@mui/material';
import { useState } from 'react';
import { ConstraintEnum } from '../../../../../lib/types/enums';

interface AddConstraintMenuProps {
  isMenuOpen: boolean;
  anchorEl: HTMLElement | null;
  closeMenu: () => void;
  usage: 'time' | 'distance';
  handleAddConstraint: (val: {
    type: ConstraintEnum;
    interval: number;
  }) => void;
}
export default function AddConstraintMenu({
  anchorEl,
  isMenuOpen,
  closeMenu,
  usage,
  handleAddConstraint,
}: AddConstraintMenuProps) {
  const [interval, setInterval] = useState<number>(0);
  return (
    <Menu
      elevation={0}
      anchorEl={anchorEl}
      sx={{
        '& .MuiPaper-root': {
          width: '300px',
          p: 2,
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
      <Box sx={{ display: 'grid', rowGap: 2 }}>
        <Box sx={{ display: 'grid', rowGap: 1 }}>
          <Typography variant="h3">{`Add ${
            usage === 'time' ? 'Time' : 'Distance'
          } Constraint`}</Typography>
          <Typography variant="body2" color="#6E6D7A">
            {usage === 'time'
              ? `The time constraint can be added to indicate the precise moment when the dpoint should be reported
            `
              : `The distance constraint can be added to indicate the precise distance after which the dpoint should be reported
            `}
          </Typography>
        </Box>

        <FormControl fullWidth>
          <FormLabel>{capitalize(usage)}</FormLabel>
          <TextField
            type="number"
            size="small"
            placeholder="Enter interval"
            onChange={(e) => setInterval(parseInt(e.target.value))}
            InputProps={{
              startAdornment: (
                <Icon icon={usage === 'time' ? watch : up} fontSize={20} />
              ),
              endAdornment: (
                <Typography variant="body2">
                  {usage === 'time' ? 's' : 'm'}
                </Typography>
              ),
            }}
            // inputProps={{
            //   min: 1,
            // }}
          />
        </FormControl>

        <Box
          py={2}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            justifyItems: 'end',
            borderTop: '1px solid #E0E0E0',
            padding: { laptop: '16px 40px 0 40px', mobile: 0 },
          }}
        >
          <Button variant="outlined" color="inherit" onClick={closeMenu}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            // disabled={!interval}
            onClick={() => {
              handleAddConstraint({
                interval,
                type: ConstraintEnum[usage === 'time' ? 'TIME' : 'DISTANCE'],
              });
              closeMenu();
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Menu>
  );
}
