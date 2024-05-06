import dismiss from '@iconify/icons-fluent/dismiss-20-regular';
import rule from '@iconify/icons-fluent/textbox-settings-24-regular';
import { Icon } from '@iconify/react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

interface MoreMenuProps {
  isMenuOpen: boolean;
  anchorEl: HTMLElement | null;
  closeMenu: () => void;
  handleRemove: () => void;
  handleManageRules: () => void;
}
export default function MoreMenu({
  anchorEl,
  isMenuOpen,
  closeMenu,
  handleRemove,
  handleManageRules,
}: MoreMenuProps) {
  const menuItems = [
    { text: 'Remove Tool', icon: dismiss, action: handleRemove },
    {
      text: 'Manage Rules',
      icon: rule,
      action: handleManageRules,
    },
  ];

  return (
    <Menu
      elevation={0}
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'bottom',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={closeMenu}
    >
      {menuItems.map(({ icon, text, action }, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            closeMenu();
            action();
          }}
        >
          <ListItemIcon>
            <Icon icon={icon} color="#1F2937" fontSize={20} />
          </ListItemIcon>
          <ListItemText sx={{ color: '#374151' }}>{text}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}
