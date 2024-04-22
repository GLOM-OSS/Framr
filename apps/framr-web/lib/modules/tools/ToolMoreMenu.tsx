import { Icon, IconifyIcon } from '@iconify/react';
import { ListItemIcon, ListItemText, MenuItem, MenuList } from '@mui/material';

export interface iconMenuTool {
  icon: IconifyIcon;
  text: string;
  stateColor?: string;
}

interface iconMenuToolProps {
  handleClick?: () => void;
  elementMenu: iconMenuTool;
}

export default function ToolMoreMenu({
  elementMenu: { icon, text, stateColor },
  handleClick,
}: iconMenuToolProps) {
  const colorItem = stateColor && 'red';
  return (
    <MenuList>
      <MenuItem
        onClick={handleClick}
        sx={{
          color: colorItem,
        }}
      >
        <ListItemIcon>
          <Icon icon={icon} color={colorItem} />
        </ListItemIcon>
        <ListItemText>{text}</ListItemText>
      </MenuItem>
    </MenuList>
  );
}
