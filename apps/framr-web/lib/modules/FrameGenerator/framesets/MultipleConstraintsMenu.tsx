import up from '@iconify/icons-fluent/arrow-sort-up-24-regular';
import watch from '@iconify/icons-fluent/timer-24-regular';
import { Icon } from '@iconify/react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

interface MultipleConstraintsMenuProps {
  isMenuOpen: boolean;
  anchorEl: HTMLElement | null;
  closeMenu: () => void;
  handleChoice: (usage: 'time' | 'distance') => void;
}
export default function MultipleConstraintsMenu({
  anchorEl,
  isMenuOpen,
  closeMenu,
  handleChoice,
}: MultipleConstraintsMenuProps) {
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
      {[
        {
          title: 'Add time constraint',
          icon: watch,
          action: () => handleChoice('time'),
        },
        {
          title: 'Add distance constraint',
          icon: up,
          action: () => handleChoice('distance'),
        },
      ].map(({ icon, title, action }, index) => (
        <MenuItem key={index} onClick={action}>
          <ListItemIcon>
            <Icon icon={icon} color="#1F2937" fontSize={20} />
          </ListItemIcon>
          <ListItemText sx={{ color: '#374151' }}>{title}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}
