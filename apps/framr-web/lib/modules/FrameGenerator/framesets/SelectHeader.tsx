import add from '@iconify/icons-fluent/add-20-regular';
import cross from '@iconify/icons-fluent/dismiss-20-regular';
import { Icon } from '@iconify/react';
import { Box, Button } from '@mui/material';
import { DPoint } from '../../../../lib/types';

interface SelectHeaderProps {
  cancelSelectMode: () => void;
  removeSelectedDPoints: () => void;
  handleRemoveConstraints: () => void;
  handleAddConstraintToMultipleDPoints: (val: HTMLElement | null) => void;
  selectModeDPoints: DPoint[];
}
export default function SelectHeader({
  cancelSelectMode,
  handleAddConstraintToMultipleDPoints,
  handleRemoveConstraints,
  removeSelectedDPoints,
  selectModeDPoints,
}: SelectHeaderProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        justifyContent: 'right',
        gridAutoFlow: 'column',
        alignItems: 'center',
        columnGap: 1,
      }}
    >
      <Button variant="text" color="inherit" onClick={cancelSelectMode}>
        Cancel
      </Button>
      <Button
        variant="outlined"
        color="error"
        disabled={!selectModeDPoints.length}
        onClick={removeSelectedDPoints}
      >
        Remove DPoints
      </Button>
      <Button
        variant="contained"
        color="error"
        disabled={!selectModeDPoints.length}
        startIcon={<Icon icon={cross} />}
        onClick={handleRemoveConstraints}
      >
        Remove Constraints
      </Button>
      <Button
        variant="text"
        color="primary"
        startIcon={<Icon icon={add} />}
        onClick={(e) => handleAddConstraintToMultipleDPoints(e.currentTarget)}
      >
        Add Constraint to Multiple dpoints
      </Button>
    </Box>
  );
}
