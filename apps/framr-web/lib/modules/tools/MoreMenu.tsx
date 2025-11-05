import DeleteIcon from '@iconify/icons-fluent/delete-24-regular';
import EditIcon from '@iconify/icons-fluent/edit-20-regular';
import info from '@iconify/icons-fluent/info-24-regular';
import OrganizationIcon from '@iconify/icons-fluent/organization-24-regular';
import SettingIcon from '@iconify/icons-fluent/settings-cog-multiple-24-regular';
import RulesIcon from '@iconify/icons-fluent/textbox-settings-24-regular';
import { Icon } from '@iconify/react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import { Tool } from '../../types';

interface MoreMenuProps {
  isMenuOpen: boolean;
  anchorEl: HTMLElement | null;
  closeMenu: () => void;
  activeTool: Tool;
  handleEdit: () => void;
  handleDetails: () => void;
  handleDelete: () => void;
}
export default function MoreMenu({
  anchorEl,
  isMenuOpen,
  closeMenu,
  activeTool: { id },
  handleEdit,
  handleDetails,
  handleDelete,
}: MoreMenuProps) {
  const { pathname, push } = useRouter();
  const menuItems = [
    {
      text: 'Manage rules',
      icon: RulesIcon,
      action: () => push(`${pathname}/${id}/rules`),
    },
    {
      text: 'Manage dpoints',
      icon: OrganizationIcon,
      action: () => push(`${pathname}/${id}/dpoints`),
    },
    {
      text: 'Manage services',
      icon: SettingIcon,
      action: () => push(`${pathname}/${id}/services`),
    },
    { text: 'Edit', icon: EditIcon, action: handleEdit },
    { text: 'Details', icon: info, action: handleDetails },
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
