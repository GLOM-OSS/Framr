import tools from '@iconify-icons/fluent/app-folder-32-regular';
import left from '@iconify-icons/fluent/chevron-left-32-regular';
import right from '@iconify-icons/fluent/chevron-right-32-regular';
import CommentIcon from '@iconify-icons/fluent/comment-20-regular';
import grid from '@iconify-icons/fluent/table-32-regular';
import { Icon, IconifyIcon } from '@iconify/react';
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import NavBarSection from './NavBarSection';

export interface SideBarItem {
  title: string;
  route: string;
  icon: IconifyIcon;
}

export interface SideBarSection {
  title: string;
  navItems: SideBarItem[];
}

export default function SideBar() {
  const { push } = useRouter();
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(true);

  const navSections: SideBarSection[] = [
    {
      title: 'Generator',
      navItems: [
        {
          title: 'Frame Generator',
          route: '/?new=true',
          icon: grid,
        },
      ],
    },
    {
      title: 'Configuration',
      navItems: [
        {
          title: 'Tools',
          route: '/configuration/tools',
          icon: tools,
        },
      ],
    },
  ];

  return (
    <Box
      sx={{
        padding: '8px 16px',
        position: 'relative',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr auto',
        rowGap: 2,
        bgcolor: 'rgba(250, 250, 253, 1)',
        width: isSideBarOpen ? '240px' : 'fit-content',
        height: '100%',
      }}
    >
      <Tooltip
        arrow
        title={`${isSideBarOpen ? 'Close' : 'Open'} sidebar`}
        placement="right"
      >
        <IconButton
          sx={{
            boxShadow:
              '0px 6px 12px -6px rgba(24, 44, 75, 0.12), 0px 8px 24px -4px rgba(24, 44, 75, 0.08)',
            bgcolor: 'rgba(255, 255, 255, 1)',
            position: 'absolute',
            right: isSideBarOpen ? '16px' : '-2px',
            top: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
          size="small"
          onClick={() => setIsSideBarOpen((prev) => !prev)}
        >
          <Icon
            icon={isSideBarOpen ? left : right}
            style={{ height: '15px', width: '15px' }}
          />
        </IconButton>
      </Tooltip>
      {isSideBarOpen ? (
        <Image
          onClick={() => push('/')}
          src="/assets/logo.png"
          alt="Framr"
          width={72}
          height={34.63}
          style={{ cursor: 'pointer' }}
        />
      ) : (
        <Image
          onClick={() => push('/')}
          src="/assets/favicon.png"
          alt="Framr favicon"
          width={30}
          height={32.63}
          style={{ cursor: 'pointer' }}
        />
      )}
      <Divider />
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          rowGap: isSideBarOpen ? 4.5 : 0,
          alignContent: 'start',
        }}
      >
        {navSections.map(({ title, navItems }, index) => (
          <NavBarSection
            isOpen={isSideBarOpen}
            navItems={navItems}
            title={title}
            key={index}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: ' auto 1fr',
          columnGap: '8px',
          alignItems: 'center',
        }}
      >
        <Icon icon={CommentIcon} fontSize={24} />
        <Typography
          component={Collapse}
          in={isSideBarOpen}
          orientation="horizontal"
          sx={{
            fontWeight: 600,
            color: 'var(--body)',
          }}
        >
          Support
        </Typography>
      </Box>
    </Box>
  );
}
