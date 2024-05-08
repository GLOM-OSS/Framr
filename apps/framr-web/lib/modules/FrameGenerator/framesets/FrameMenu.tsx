import square from '@iconify/icons-fluent/square-24-regular';
import { Icon } from '@iconify/react';
import { Checkbox, ListItemText, Menu, MenuItem } from '@mui/material';
import { FrameEnum } from '../../../../lib/types/enums';

interface FrameMenuProps {
  isMenuOpen: boolean;
  anchorEl: HTMLElement | null;
  closeMenu: () => void;
  selectedFrames: FrameEnum[];
  handleSelect: (frame: FrameEnum) => void;
}
export default function FrameMenu({
  anchorEl,
  isMenuOpen,
  closeMenu,
  selectedFrames,
  handleSelect,
}: FrameMenuProps) {
  return (
    <Menu
      elevation={0}
      anchorEl={anchorEl}
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
      {Object.values(FrameEnum).map((frame, index) => (
        <MenuItem onClick={() => handleSelect(frame)} key={index}>
          <Checkbox
            size="small"
            checked={selectedFrames.includes(frame)}
            icon={<Icon icon={square} fontSize={20} color="#D1D5DB" />}
          />
          <ListItemText>{frame}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}
