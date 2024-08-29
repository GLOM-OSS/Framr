import DeleteIcon from '@iconify/icons-fluent/delete-24-regular';
import EditIcon from '@iconify/icons-fluent/edit-20-regular';
import { Icon } from '@iconify/react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

interface MoreMenuProps {
  isMenuOpen: boolean;
  anchorEl: HTMLElement | null;
  closeMenu: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
}
export default function MoreMenu({
  anchorEl,
  isMenuOpen,
  closeMenu,
  handleEdit,
  handleDelete,
}: MoreMenuProps) {
  const menuItems = [
    { text: 'Edit', icon: EditIcon, action: handleEdit },
    {
      text: 'Delete',
      icon: DeleteIcon,
      stateColor: 'red',
      action: handleDelete,
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
      {menuItems.map(({ icon, text, stateColor, action }, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            closeMenu();
            action();
          }}
        >
          <ListItemIcon>
            <Icon icon={icon} color={stateColor} fontSize={20} />
          </ListItemIcon>
          <ListItemText sx={{ color: stateColor }}>{text}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}
