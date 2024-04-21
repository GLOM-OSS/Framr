import AddIcon from '@iconify/icons-fluent/add-24-filled';
import AttachIcon from '@iconify/icons-fluent/attach-24-filled';
import DeleteIcon from '@iconify/icons-fluent/delete-24-regular';
import EditIcon from '@iconify/icons-fluent/edit-20-regular';
import more from '@iconify/icons-fluent/more-vertical-24-regular';
import OrganizationIcon from '@iconify/icons-fluent/organization-24-regular';
import SettingIcon from '@iconify/icons-fluent/settings-cog-multiple-24-regular';
import RulesIcon from '@iconify/icons-fluent/textbox-settings-24-regular';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { theme } from '../../theme';
import { LWDTool } from '../../types';
import { ToolEnum } from '../../types/enums';
import ToolMoreMenu, { iconMenuTool } from './ToolMoreMenu';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Tools Name', width: 300 },
  { field: 'version', headerName: 'Version', width: 300 },
  { field: 'long', headerName: 'Long', width: 570 },
];
const dataTableGrid: LWDTool[] = [
  {
    id: 'abcd123',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  },
  {
    id: 'abcd132',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  },
  {
    id: 'abcd213',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  },
  {
    id: 'abcd231',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  },
  {
    id: 'abcd321',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  },
  {
    id: 'abcd312',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  },
];

export default function ToolManagement() {
  const [open, setOpen] = useState<boolean>(false);
  const actionColumns: GridColDef[] = [
    {
      field: 'action',
      headerName: '',
      width: 50,
      renderCell: () => (
        <Tooltip title="More">
          <IconButton onClick={handleClick}>
            <Icon icon={more} fontSize={20} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];
  const handleClick = () => {
    setOpen((open) => !open);
  };

  const elementsMenu: iconMenuTool[] = [
    { text: 'Manage Rules', icon: RulesIcon },
    { text: 'Manage Data Point', icon: OrganizationIcon },
    { text: 'Manage Services', icon: SettingIcon },
    { text: 'Edit', icon: EditIcon },
    { text: 'Details', icon: more },
    { text: 'Delete', icon: DeleteIcon, stateColor: 'red' },
  ];
  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        rowGap: 1,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          alignItems: 'center',
          gridTemplateColumns: 'auto 1fr',
          justifyItems: 'end',
          columnGap: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            alignItems: 'center',
            columnGap: 1,
          }}
        >
          <Typography variant="h3">Tools</Typography>
          <Typography variant="h3" sx={{ color: theme.common.line }}>
            {dataTableGrid.length}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: 1,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Icon icon={AttachIcon} />}
          >
            Import Tool
          </Button>
          <Button variant="contained" startIcon={<Icon icon={AddIcon} />}>
            Create Tool
          </Button>
        </Box>
      </Box>
      <Box>
        <DataGrid
          rows={dataTableGrid}
          columns={columns.concat(actionColumns)}
          autoHeight
          disableColumnMenu
          hideFooterSelectedRowCount
          sx={{
            '& .MuiDataGrid-container--top [role=row]': {
              bgcolor: 'rgba(229, 231, 235, 1)',
            },
            '& .css-t89xny-MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '12px',
              lineHeight: '16px',
            },
          }}
        />

        <Menu
          elevation={0}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '10px',
              marginTop: '8px',
              minWidth: 180,
              color: 'rgb(55, 65, 81)',
              boxShadow:
                'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
              '& .MuiMenu-list': {
                padding: '4px 0',
              },
              '& .MuiMenuItem-root': {
                '& .MuiSvgIcon-root': {
                  fontSize: 18,
                  marginRight: '12px',
                },
              },
              '& .css-h4y409-MuiList-root': {
                padding: '4px 0',
              },
            },
          }}
          open={open}
          onClose={handleClick}
        >
          {elementsMenu.map((elementMenu, index) => (
            <ToolMoreMenu
              key={index}
              handleClick={handleClick}
              elementMenu={elementMenu}
            />
          ))}
        </Menu>
      </Box>
    </Box>
  );
}
