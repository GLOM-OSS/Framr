import {
  Autocomplete,
  Box,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { Tool } from '../../../../../lib/types';
import { ToolEnum } from '../../../../../lib/types/enums';

export default function ToolMenu({
  anchorEl,
  setAnchorEl,
}: {
  anchorEl: HTMLAnchorElement | null;
  setAnchorEl: (anchor: HTMLAnchorElement | null) => void;
}) {
  const { push, pathname } = useRouter();
  //TODO: call api here to fetch all tools
  const tools: Tool[] = [
    {
      id: 'wds',
      type: ToolEnum.LWD,
      name: 'WDS',
      version: '1.0',
      long: 'Wired Drill String',
    },
    {
      id: 'mwd',
      type: ToolEnum.MWD,
      name: 'MWD',
      version: '1.0',
      long: 'Measurement While Drilling',
      max_bits: 1,
      max_dpoints: 2,
    },
  ];

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
