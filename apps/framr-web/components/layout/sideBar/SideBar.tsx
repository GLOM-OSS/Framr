import AppFolderIcon from '@iconify/icons-fluent/app-folder-32-regular';
import ChevronLeft from '@iconify/icons-fluent/chevron-left-32-regular';
import CommentIcon from '@iconify/icons-fluent/comment-20-regular';
import TableIcon from '@iconify/icons-fluent/table-32-regular';
import { Icon, IconifyIcon } from '@iconify/react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { layoutProps } from '..';
import SideBarNavItem from './SideBarNavIdem';

export interface sideBarNav {
  item: string;
  route?: string;
  icon: IconifyIcon;
  title: string;
}

export default function SideBar({
  drawerWidth,
  setDrawerWidth,
  open,
  setOpen,
}: layoutProps) {
  const { push } = useRouter();

  const sideBarNav: sideBarNav[] = [
    {
      title: 'GENERATOR',
      item: 'Frame Generator',
      route: '/frameGenerator',
      icon: TableIcon,
    },
    {
      title: 'CONFIGURATION',
      item: 'Tools',
      route: '/tools',
      icon: AppFolderIcon,
    },
  ];
  const handleCloseSlide = () => {
    setDrawerWidth(57);
    setOpen(false);
  };
  return (
    <Drawer
      variant="permanent"
      sx={{
        '.MuiPaper-root': {
          bgcolor: 'rgba(250, 250, 253, 1)',
          ...(open && {
            width: drawerWidth,
            overflowX: 'hidden',
            transition: 'width 0.5s ease',
          }),
          ...(!open && {
            width: drawerWidth,
            overflowX: 'hidden',
            transition: 'width 0.5s ease',
          }),
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          border: 'none',
        },
      }}
    >
      <Box
        sx={{
          padding: open ? '10px 18px' : '10px',
          position: 'relative',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: open ? 'space-between' : 'center',
            alignItems: 'center',
            marginBottom: '15px',
          }}
        >
          {open ? (
            <Image
              onClick={() => push('/')}
              src="/assets/logo.png"
              alt="Full Framr Logo"
              width={72}
              height={34.63}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <Image
              onClick={() => push('/')}
              src="/assets/favicon.png"
              alt="Short Framr Logo"
              width={30}
              height={32.63}
              style={{ cursor: 'pointer' }}
            />
          )}
          <IconButton
            sx={{
              boxShadow: '0px 8px 24px 4px rgba(24, 44, 75, 0.08)',
              bgcolor: 'rgba(255, 255, 255, 1)',
              display: open ? 'inherit' : 'none',
            }}
            onClick={handleCloseSlide}
          >
            <Icon
              icon={ChevronLeft}
              style={{ height: '15px', width: '15px' }}
            />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {sideBarNav.map((navElements, index) => (
            <SideBarNavItem sideBarNav={navElements} open={open} key={index} />
          ))}
        </List>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: ' auto 1fr',
            columnGap: '8px',
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
          }}
        >
          <Icon icon={CommentIcon} fontSize={24} />
          <Typography
            sx={{
              fontFamily: 'inter',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '14px',
              color: 'rgba(110, 109, 122, 1)',
              display: open ? 'inherit' : 'none',
            }}
          >
            Support
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
