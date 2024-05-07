import {
  Autocomplete,
  Box,
  Menu,
  MenuItem,
  TextField,
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

export default function ToolMenu({
  anchorEl,
  setAnchorEl,
}: {
  anchorEl: HTMLAnchorElement | null;
  setAnchorEl: (anchor: HTMLAnchorElement | null) => void;
}) {
  const { push, pathname } = useRouter();

  const eventBus = new EventBus();
  const toolsService = new ToolsService();
  const [tools, setTools] = useState<Tool[]>([]);

  function fetchTools() {
    eventBus.once<Tool[]>(
      ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setTools(data);
        }
      }
    );
    toolsService.findAll();
  }

  useEffect(() => {
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeTool = (toolId: string) => {
    const paths = pathname.split('/');
    paths[3] = toolId;
    push(`/${paths.join('/')}`);
    setAnchorEl(null);
  };

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
        <Autocomplete
          options={tools}
          autoHighlight
          getOptionLabel={(option) => option.name}
          renderOption={(props, { id, name, version }) => {
            return (
              <Typography
                {...props}
                key={id}
                component="li"
              >{`${name} (${version})`}</Typography>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search Tool"
              size="small"
              inputProps={{
                ...params.inputProps,
                autoComplete: 'autocomplete',
              }}
            />
          )}
          onChange={(_, tool) => {
            if (tool) changeTool(tool.id);
          }}
        />

        {tools.map(({ name, id, version }, index) => (
          <MenuItem
            disableGutters
            key={index}
            onClick={() => changeTool(id)}
            sx={{ padding: 1, minHeight: 'fit-content' }}
          >
            {`${name} (${version})`}
          </MenuItem>
        ))}
      </Box>
    </Menu>
  );
}
