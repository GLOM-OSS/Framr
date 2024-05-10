import up from '@iconify/icons-fluent/arrow-sort-up-24-regular';
import dismiss from '@iconify/icons-fluent/dismiss-24-regular';
import watch from '@iconify/icons-fluent/timer-24-regular';
import { Icon } from '@iconify/react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { ConstraintEnum } from '../../../../../lib/types/enums';

interface DPointMenuProps {
  isOpen: boolean;
  anchorEl: HTMLElement | null;
  rule?: {
    interval: number;
    type: ConstraintEnum;
  };
  closeMenu: () => void;
  handleRemoveDPoint: () => void;
  handleRemoveConstraint: () => void;
  handleAddTimeConstraint: () => void;
  handleAddDistanceConstraint: () => void;
}
export default function DPointMenu({
  anchorEl,
  closeMenu,
  rule,
  isOpen,
  handleAddDistanceConstraint,
  handleAddTimeConstraint,
  handleRemoveConstraint,
  handleRemoveDPoint,
}: DPointMenuProps) {
  const menuItems = !rule
    ? [
        {
          icon: watch,
          title: 'Add time constraint',
          action: handleAddTimeConstraint,
        },
        {
          icon: up,
          title: 'Add distance constraint',
          action: handleAddDistanceConstraint,
        },
        {
          icon: dismiss,
          title: 'Remove DPoint',
          color: '#BF0000',
          action: () => {
            closeMenu();
            handleRemoveDPoint();
          },
        },
      ]
    : [
        {
          icon: dismiss,
          title: 'Remove DPoint',
          color: '#BF0000',
          action: () => {
            closeMenu();
            handleRemoveDPoint();
          },
        },
        rule.type === ConstraintEnum.TIME
          ? {
              icon: watch,
              title: `Remove constraint (${rule.interval}s)`,
              color: '#BF0000',
              action: () => {
                closeMenu();
                handleRemoveConstraint();
              },
            }
          : {
              icon: up,
              title: `Remove constraint (${rule.interval}m)`,
              color: '#BF0000',
              action: () => {
                closeMenu();
                handleRemoveConstraint();
              },
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
      open={isOpen}
      onClose={closeMenu}
    >
      {menuItems.map((item, index) => (
        <MenuItem key={index} onClick={() => item.action()}>
          <ListItemIcon>
            <Icon
              icon={item.icon}
              color={item.color ?? '#1F2937'}
              fontSize={20}
            />
          </ListItemIcon>
          <ListItemText sx={{ color: item.color ?? '#374151' }}>
            {item.title}
          </ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}
