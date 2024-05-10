import add from '@iconify/icons-fluent/add-24-regular';
import frameIcon from '@iconify/icons-fluent/table-stack-left-20-regular';
import selectIcon from '@iconify/icons-fluent/task-list-ltr-20-regular';
import { Icon } from '@iconify/react';
import { Box, Button, MenuItem, Select } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { DPoint } from '../../../../lib/types';
import { ConstraintEnum, FrameEnum } from '../../../../lib/types/enums';
import AddMultipleConstraintsMenu from './AddMultipleConstraintMenu';
import FrameMenu from './FrameMenu';
import MultipleConstraintsMenu from './MultipleConstraintsMenu';
import NewDPointMenu from './NewDPointMenu';
import SelectHeader from './SelectHeader';

interface FramesetHeaderProps {
  activeFSL: number;
  setActiveFSL: (val: number) => void;
  selectedFrames: FrameEnum[];
  setSelectedFrames: Dispatch<SetStateAction<FrameEnum[]>>;
  submitNewDPoint: (val: DPoint) => void;
  isSelectMode: boolean;
  setIsSelectMode: (val: boolean) => void;
  handleRemoveConstraints: () => void;
  handleRemoveDPoints: () => void;
  selectedDPoints: DPoint[];
  selectModeDPoints: DPoint[];
  closeSelectMode: () => void;
  submitMultipleConstraints: (val: {
    interval: number;
    type: ConstraintEnum;
    dPoints: DPoint[];
  }) => void;
}
export default function FramesetHeader({
  activeFSL,
  selectedFrames,
  setActiveFSL,
  setSelectedFrames,
  submitNewDPoint,
  isSelectMode,
  setIsSelectMode,
  handleRemoveDPoints,
  handleRemoveConstraints,
  selectedDPoints,
  selectModeDPoints,
  closeSelectMode,
  submitMultipleConstraints,
}: FramesetHeaderProps) {
  const [frameMenuAnchorEl, setFrameMenuAnchorEl] =
    useState<HTMLElement | null>(null);
  const [newDPointAnchorEl, setNewDPointAnchorEl] =
    useState<HTMLElement | null>(null);
  const [multipleConstraintsAnchorEl, setMultipleConstraintsAnchorEl] =
    useState<HTMLElement | null>(null);
  const [
    isMultipleTimeConstraintMenuOpen,
    setIsMultipleTimeConstraintMenuOpen,
  ] = useState<boolean>(false);
  const [multipleDPointUsage, setMultipleDPointUsage] = useState<
    'time' | 'distance'
  >();
  return (
    <>
      <NewDPointMenu
        anchorEl={newDPointAnchorEl}
        closeMenu={() => setNewDPointAnchorEl(null)}
        handleSubmit={(val) => submitNewDPoint(val)}
        isMenuOpen={!!newDPointAnchorEl}
      />
      <FrameMenu
        anchorEl={frameMenuAnchorEl}
        closeMenu={() => setFrameMenuAnchorEl(null)}
        handleSelect={(frame) => {
          setSelectedFrames((prev) => {
            if (prev.includes(frame)) return prev.filter((_) => _ !== frame);
            return [...prev, frame];
          });
        }}
        isMenuOpen={!!frameMenuAnchorEl}
        selectedFrames={selectedFrames}
      />
      <MultipleConstraintsMenu
        anchorEl={multipleConstraintsAnchorEl}
        closeMenu={() => setMultipleConstraintsAnchorEl(null)}
        isMenuOpen={!!multipleConstraintsAnchorEl}
        handleChoice={(val) => {
          setIsMultipleTimeConstraintMenuOpen(true);
          setMultipleDPointUsage(val);
        }}
      />
      {multipleDPointUsage && (
        <AddMultipleConstraintsMenu
          anchorEl={multipleConstraintsAnchorEl}
          closeMenu={() => {
            setMultipleDPointUsage(undefined);
            setMultipleConstraintsAnchorEl(null);
          }}
          isMenuOpen={
            !!multipleConstraintsAnchorEl && isMultipleTimeConstraintMenuOpen
          }
          dPoints={selectedDPoints}
          usage={multipleDPointUsage}
          handleAddConstraint={submitMultipleConstraints}
        />
      )}
      {isSelectMode ? (
        <SelectHeader
          handleAddConstraintToMultipleDPoints={(val) =>
            setMultipleConstraintsAnchorEl(val)
          }
          cancelSelectMode={closeSelectMode}
          handleRemoveConstraints={handleRemoveConstraints}
          removeSelectedDPoints={handleRemoveDPoints}
          selectModeDPoints={selectModeDPoints}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            justifyContent: 'end',
            gridAutoFlow: 'column',
            alignItems: 'center',
            columnGap: 1,
          }}
        >
          <Select
            value={activeFSL}
            size="small"
            onChange={(e) => setActiveFSL(Number(e.target.value))}
          >
            {[...new Array(6)].map((_, index) => (
              <MenuItem key={index} value={index + 1}>
                {`FSL-${index + 1}`}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Icon icon={selectIcon} />}
            onClick={() => setIsSelectMode(true)}
          >
            Select DPoint
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Icon icon={frameIcon} />}
            onClick={(e) => setFrameMenuAnchorEl(e.currentTarget)}
          >
            Manage Frames
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon icon={add} />}
            onClick={(e) => setNewDPointAnchorEl(e.currentTarget)}
          >
            Add DPoint
          </Button>
        </Box>
      )}
    </>
  );
}
