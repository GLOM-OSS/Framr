import upDown from '@iconify/icons-fluent/chevron-up-down-24-regular';
import { Icon } from '@iconify/react';
import {
  Box,
  Breadcrumbs,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import ToolConfigMenu from '../menus/ToolConfigMenu';
import ToolMenu from '../menus/ToolMenu';

export default function ToolBreadcrump() {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
  const [toolAnchorEl, setToolAnchorEl] = useState<HTMLAnchorElement | null>(
    null
  );

  return (
    <>
      <ToolConfigMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
      <ToolMenu anchorEl={toolAnchorEl} setAnchorEl={setToolAnchorEl} />
      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="/configuration/tools">
          Configuration
        </Link>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            alignItems: 'center',
            columnGap: 0.2,
            color: '#3B82F6 !important',
          }}
        >
          <Typography variant="body2">Tools</Typography>
          <Tooltip arrow title="Change tool">
            <IconButton
              size="small"
              onClick={(event) =>
                setToolAnchorEl(event.target as HTMLAnchorElement)
              }
            >
              <Icon icon={upDown} color="#3B82F6" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            alignItems: 'center',
            columnGap: 0.2,
            color: '#3B82F6 !important',
          }}
        >
          <Typography variant="body2">DPoint</Typography>
          <Tooltip arrow title="Change config">
            <IconButton
              size="small"
              onClick={(event) =>
                setAnchorEl(event.target as HTMLAnchorElement)
              }
            >
              <Icon icon={upDown} color="#3B82F6" />
            </IconButton>
          </Tooltip>
        </Box>
      </Breadcrumbs>
    </>
  );
}
