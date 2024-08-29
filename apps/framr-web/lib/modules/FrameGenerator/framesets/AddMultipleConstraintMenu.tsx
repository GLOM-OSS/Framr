import up from '@iconify/icons-fluent/arrow-sort-up-24-regular';
import watch from '@iconify/icons-fluent/timer-24-regular';
import { Icon } from '@iconify/react';
import {
  Autocomplete,
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
import { DPoint } from '../../../../lib/types';
import { ConstraintEnum, FrameEnum } from '../../../../lib/types/enums';

interface MultipleConstraintsMenuProps {
  isMenuOpen: boolean;
  anchorEl: HTMLElement | null;
  closeMenu: () => void;
  dPoints: DPoint[];
  usage: 'time' | 'distance';
  handleAddConstraint: (val: {
    interval: number;
    type: ConstraintEnum;
    dPoints: DPoint[];
    framesets: FrameEnum[];
  }) => void;
}
export default function AddMultipleConstraintsMenu({
  anchorEl,
  isMenuOpen,
  closeMenu,
  dPoints,
  usage,
  handleAddConstraint,
}: MultipleConstraintsMenuProps) {
  const [selectedDPoints, setSelectedDPoints] = useState<DPoint[]>([]);
  const [interval, setInterval] = useState<number>(0);
  return (
    <Menu
      elevation={0}
      anchorEl={anchorEl}
      sx={{
        '& .MuiPaper-root': {
          minWidth: '300px',
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

        <Box sx={{ display: 'grid', rowGap: 1 }}>
          <Autocomplete
            multiple
            options={dPoints}
            autoHighlight
            size="small"
            getOptionLabel={({ name }) => name}
            onChange={(_, selectedDPoints) =>
              setSelectedDPoints(selectedDPoints)
            }
            value={selectedDPoints}
            renderInput={(params) => (
              <FormControl fullWidth>
                <FormLabel>Select all DPoints for constraint</FormLabel>
                <TextField
                  {...params}
                  placeholder="select dpoints"
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'autocomplete',
                  }}
                />
              </FormControl>
            )}
          />
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
                    {usage === 'time' ? 'bps' : 'm'}
                  </Typography>
                ),
              }}
              inputProps={{
                min: 1,
              }}
            />
          </FormControl>
        </Box>

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
            disabled={!selectedDPoints.length || !interval}
            onClick={() =>
              handleAddConstraint({
                interval,
                type: ConstraintEnum[usage === 'time' ? 'TIME' : 'DISTANCE'],
                dPoints: selectedDPoints,
                framesets: [],
              })
            }
          >
            Save
          </Button>
        </Box>
      </Box>
    </Menu>
  );
}
