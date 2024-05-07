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
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Tool } from '../../../../../lib/types';
import { ToolsEventChannel, ToolsService } from '../../../../services';
import {
  EventBus,
  EventBusChannelStatus,
} from '../../../../services/libs/event-bus';
import ToolConfigMenu from '../menus/ToolConfigMenu';
import ToolMenu from '../menus/ToolMenu';

export default function ToolBreadcrumb() {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
  const [toolAnchorEl, setToolAnchorEl] = useState<HTMLAnchorElement | null>(
    null
  );

  const {
    query: { toolId },
  } = useRouter();

  const eventBus = new EventBus();
  const toolsService = new ToolsService();
  const [activeTool, setActiveTool] = useState<string>('DPoint');
  const [activeToolConfig, setActiveToolConfig] = useState<string>('DPoint');

  function fetchTool(toolId: string) {
    eventBus.once<Tool>(
      ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveTool(data.name);
        } else setActiveTool('Unknown Tool');
      }
    );
    toolsService.findOne(toolId);
  }
  useEffect(() => {
    if (typeof toolId === 'string') {
      fetchTool(toolId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  return (
    <>
      <ToolConfigMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        setActiveToolConfig={setActiveToolConfig}
      />
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
          <Typography variant="body2">{activeTool}</Typography>
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
          <Typography variant="body2">{activeToolConfig}</Typography>
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
