import { Icon, IconifyIcon } from '@iconify/react';
import { Box, Menu, MenuItem } from '@mui/material';
import dpointIcon from '@iconify/icons-fluent/organization-24-regular';
import servicesIcon from '@iconify/icons-fluent/settings-cog-multiple-24-regular';
import rulesIcon from '@iconify/icons-fluent/clipboard-text-edit-24-regular';
import { useRouter } from 'next/router';

export default function ToolConfigMenu({
  anchorEl,
  setAnchorEl,
}: {
  anchorEl: HTMLAnchorElement | null;
  setAnchorEl: (anchor: HTMLAnchorElement | null) => void;
}) {
  const { push } = useRouter();
  const menuItems: { title: string; icon: IconifyIcon; route: string }[] = [
    { title: 'Services', icon: servicesIcon, route: '/services' },
    {
      title: 'DPoint',
      icon: dpointIcon,
      route: '/dpoint',
    },
    {
      title: 'Rules',
      icon: rulesIcon,
      route: '/rules',
    },
  ];
  return (
    <Menu
      anchorEl={anchorEl}
      open={anchorEl !== null}
      onClose={() => setAnchorEl(null)}
    >
      <Box
        sx={{
          p: 1,
          display: 'grid',
          minWidth: 150,
          rowGap: 1,
        }}
      >
        {menuItems.map(({ title, icon, route }, index) => (
          <MenuItem
            disableGutters
            key={index}
            onClick={() => {
              push(route);
              setAnchorEl(null);
            }}
            sx={{ padding: 1, minHeight: 'fit-content' }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 1,
                alignItems: 'center',
              }}
            >
              <Icon icon={icon} fontSize={24} />
              {title}
            </Box>
          </MenuItem>
        ))}
      </Box>
    </Menu>
  );
}
