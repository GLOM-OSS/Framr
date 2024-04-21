import chevrondown from '@iconify/icons-fluent/chevron-down-24-regular';
import SearchIcon from '@iconify/icons-fluent/search-32-regular';
import MoonIcon from '@iconify/icons-fluent/weather-moon-28-filled';
import SunIcon from '@iconify/icons-fluent/weather-sunny-32-filled';
import { Icon } from '@iconify/react';
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import IOSSwitch from '../../sharedComponents/iosSwitch';
import BaseBreadcrumb from './breadcrumbs/BaseBreadcrumb';
import ToolBreadcrump from './breadcrumbs/ToolBreadcrump';

export default function Header() {
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const { pathname } = useRouter();

  const baseToolBreadcrumb = [
    { href: '/configuration/tools', title: 'Configuration' },
    { href: '/configuration/tools', title: 'Tools' },
  ];
  const generatorBreadcrumb = [
    {
      href: '/?new=true',
      title: 'Frame Generator',
    },
  ];

  function getCorrespondingBreadcrumb() {
    if (pathname.split('/').length <= 2)
      return (
        <BaseBreadcrumb
          breadcrumbs={
            pathname.includes('tools')
              ? baseToolBreadcrumb
              : generatorBreadcrumb
          }
        />
      );
    return <ToolBreadcrump />;
  }

  return (
    <Box
      sx={{
        bgcolor: 'rgba(250, 250, 253, 1)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        justifyItems: 'center',
        alignItems: 'center',
        padding: '10px 20px',
      }}
    >
      {getCorrespondingBreadcrumb()}
      <TextField
        variant="outlined"
        placeholder="Search Tools"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Icon icon={SearchIcon} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small">
                <Icon icon={chevrondown} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box
        sx={{
          display: 'grid',
          alignItems: 'center',
          gridAutoFlow: 'column',
          columnGap: 1,
        }}
      >
        <IconButton size="small" onClick={() => setIsLightMode(false)}>
          <Icon
            icon={MoonIcon}
            fontSize={24}
            color={!isLightMode ? '#2F3A45' : '#D1D5DB'}
          />
        </IconButton>
        <IOSSwitch
          checked={isLightMode}
          onChange={(event) => setIsLightMode(event.target.checked)}
        />
        <IconButton size="small" onClick={() => setIsLightMode(true)}>
          <Icon
            icon={SunIcon}
            fontSize={24}
            color={isLightMode ? '#3B82F6' : '#D1D5DB'}
          />
        </IconButton>
      </Box>
    </Box>
  );
}
