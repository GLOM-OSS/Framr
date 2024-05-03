import rulesIcon from '@iconify/icons-fluent/clipboard-text-edit-24-regular';
import dpointIcon from '@iconify/icons-fluent/organization-24-regular';
import servicesIcon from '@iconify/icons-fluent/settings-cog-multiple-24-regular';
import { Icon, IconifyIcon } from '@iconify/react';
import { Box, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';

export default function ToolConfigMenu({
  anchorEl,
  setAnchorEl,
  setActiveToolConfig,
}: {
  anchorEl: HTMLAnchorElement | null;
  setAnchorEl: (anchor: HTMLAnchorElement | null) => void;
  setActiveToolConfig: (tool: string) => void;
}) {
  const {
    push,
    pathname,
    query: { toolId },
  } = useRouter();
  const menuItems: { title: string; icon: IconifyIcon; route: string }[] =
    useMemo(
      () => [
        { title: 'Services', icon: servicesIcon, route: 'services' },
        {
          title: 'DPoint',
          icon: dpointIcon,
          route: 'dpoint',
        },
        {
          title: 'Rules',
          icon: rulesIcon,
          route: 'rules',
        },
      ],
      []
    );

  useEffect(() => {
    const paths = pathname.split('/');
    const activeConfig = paths[4];
    const tt = menuItems.find((item) => item.route === activeConfig);
    setActiveToolConfig(tt?.title || 'Unknown Config');
  }, [menuItems, pathname, setActiveToolConfig]);

  function openConfig(route: string, title: string) {
    const newRoute = pathname.split('[toolId]')[0] + toolId + '/' + route;
    push(newRoute);
    setAnchorEl(null);
    setActiveToolConfig(title);
  }

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
            onClick={() => openConfig(route, title)}
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
