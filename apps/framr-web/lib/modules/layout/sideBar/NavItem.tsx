import { Icon } from '@iconify/react';
import { Box, Collapse, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { SideBarItem } from './SideBar';

interface NavItemProps {
  item: SideBarItem;
  isOpen: boolean;
}

export default function NavItem({
  item: { icon, title, route },
  isOpen,
}: NavItemProps) {
  const { asPath, push } = useRouter();
  const isActive = asPath.startsWith(route);
  return (
    <>
      <Tooltip arrow title={title} placement="right">
        <Box
          onClick={() => push(route)}
          sx={{
            display: isOpen ? 'none' : 'grid',
            alignItems: 'center',
            gridTemplateColumns: 'auto 1fr',
            columnGap: isOpen ? 1 : 0,
            padding: 1,
            cursor: 'pointer',
            justifySelf: isOpen ? 'left' : 'center',
            background: isActive ? '#EBEAED' : 'none',
            borderRadius: 1,
            width: isOpen ? '100%' : 'fit-content',
            '&:hover': {
              backgroundColor: isActive ? '#EBEAED' : 'none',
            },
          }}
        >
          <Icon
            icon={icon}
            color={'black'}
            fontSize={24}
            style={{
              display: isOpen ? 'none' : 'initial',
            }}
          />
          <Typography
            component={Collapse}
            in={isOpen}
            orientation="horizontal"
            sx={{ textWrap: 'nowrap', whiteSpace: 'nowrap' }}
          >
            {title}
          </Typography>
        </Box>
      </Tooltip>
      <Box
        onClick={() => push(route)}
        sx={{
          display: isOpen ? 'grid' : 'none',
          alignItems: 'center',
          gridTemplateColumns: 'auto 1fr',
          columnGap: isOpen ? 1 : 0,
          padding: 1,
          cursor: 'pointer',
          justifySelf: isOpen ? 'left' : 'center',
          background: isActive ? '#EBEAED' : 'none',
          borderRadius: 1,
          width: isOpen ? '100%' : 'fit-content',
          '&:hover': {
            backgroundColor: !isActive ? '#EBEAED' : 'none',
          },
        }}
      >
        <Icon
          icon={icon}
          color={'black'}
          fontSize={24}
          style={{ display: isOpen ? 'initial' : 'none' }}
        />
        <Typography component={Collapse} in={isOpen} orientation="horizontal">
          {title}
        </Typography>
      </Box>
    </>
  );
}
