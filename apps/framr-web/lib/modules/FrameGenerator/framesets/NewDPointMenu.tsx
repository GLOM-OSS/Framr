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
import { useState } from 'react';
import { DPoint } from '../../../../lib/types';
import { ToolEnum } from '../../../../lib/types/enums';

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
  //TODO; replace this with a call to the API
  const [dPoints] = useState<DPoint[]>([
    {
      id: 'abcd123',
      name: 'ADN',
      bits: 1,
      tool: {
        id: '1',
        long: 'Puptool',
        name: 'Puptool',
        type: ToolEnum.LWD,
        version: '0.2.2',
      },
    },

    {
      id: 'abcdw213',
      name: 'ADN',
      bits: 1,
      tool: {
        id: '1',
        long: 'Puptool',
        name: 'Puptool',
        type: ToolEnum.LWD,
        version: '0.2.2',
      },
    },
  ]);

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
