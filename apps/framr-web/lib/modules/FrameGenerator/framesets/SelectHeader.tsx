import add from '@iconify/icons-fluent/add-20-regular';
import cross from '@iconify/icons-fluent/dismiss-20-regular';
import { Icon } from '@iconify/react';
import { Box, Button } from '@mui/material';
import { ConstraintEnum } from '../../../../lib/types/enums';

interface SelectHeaderProps {
  cancelSelectMode: () => void;
  removeSelectedDPoints: () => void;
  handleRemoveConstraints: () => void;
  addConstraintToDPoints: (val: {
    interval: number;
    type: ConstraintEnum;
  }) => void;
}
export default function SelectHeader({
  cancelSelectMode,
  addConstraintToDPoints,
  handleRemoveConstraints,
  removeSelectedDPoints,
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
      <Button variant="outlined" color="error" onClick={removeSelectedDPoints}>
        Remove DPoints
      </Button>
      <Button
        variant="contained"
        color="error"
        startIcon={<Icon icon={cross} />}
        onClick={handleRemoveConstraints}
      >
        Remove Constraints
      </Button>
      <Button variant="text" color="primary" startIcon={<Icon icon={add} />}>
        Add Constraint to Multiple dpoints
      </Button>
    </Box>
  );
}
