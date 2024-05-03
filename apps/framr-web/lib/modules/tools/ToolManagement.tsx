import AddIcon from '@iconify/icons-fluent/add-24-filled';
import AttachIcon from '@iconify/icons-fluent/attach-24-filled';
import more from '@iconify/icons-fluent/more-vertical-24-regular';
import { Icon } from '@iconify/react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { ConfirmDialog } from '../../../components/sharedComponents/confirmDialog';
import { theme } from '../../theme';
import { CreateTool, ITool, Tool } from '../../types';
import { ToolEnum } from '../../types/enums';
import ManageToolDialog from './ManageToolDialog';
import MoreMenu from './MoreMenu';

export default function ToolManagement() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  //TODO; replace this with a call to the API
  const [tools] = useState<Tool[]>([
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
  ]);

  const [activeTool, setActiveTool] = useState<Tool>();

  const toolColumns: GridColDef<Tool>[] = [
    { field: 'version', headerName: 'Version', width: 100 },
    { field: 'name', headerName: 'Tools Name', flex: 1 },
    { field: 'long', headerName: 'Long', flex: 1 },
    {
      field: 'action',
      headerName: '',
      width: 50,
      renderCell: ({ row: tool }) => (
        <Tooltip title="More">
          <IconButton
            onClick={(event) => {
              setActiveTool(tool);
              setAnchorEl(event.currentTarget);
            }}
          >
            <Icon icon={more} fontSize={18} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCreateNewToolDialogOpen, setIsCreateNewToolDialogOpen] =
    useState<boolean>(false);

  function handleCreateTool(val: CreateTool) {
    //TODO: CALL API HERE TO CREATE NEW TOOL
    console.log(val);
  }

  function handleEditTool(val: ITool) {
    //TODO: CALL API HERE TO EDIT NEW TOOL
    console.log(val);
  }

  function handleDeleteTool(tool: Tool) {
    //TODO: CALL API HERE TO DELETE
    alert('delete tool');
    setIsDeleteDialogOpen(false);
  }

  return (
    <>
      <ManageToolDialog
        closeDialog={() => {
          setIsCreateNewToolDialogOpen(false);
          setIsEditDialogOpen(false);
          setActiveTool(undefined);
        }}
        isDialogOpen={isEditDialogOpen || isCreateNewToolDialogOpen}
        isSubmitting={false}
        handleCreate={handleCreateTool}
        handleEdit={handleEditTool}
        data={activeTool}
      />
      {activeTool && (
        <>
          <MoreMenu
            anchorEl={anchorEl}
            isMenuOpen={!!anchorEl}
            closeMenu={() => setAnchorEl(null)}
            activeTool={activeTool}
            handleEdit={() => setIsEditDialogOpen(true)}
            handleDetails={() => setIsDetailsDialogOpen(true)}
            handleDelete={() => setIsDeleteDialogOpen(true)}
          />
          <ConfirmDialog
            isDialogOpen={isDeleteDialogOpen}
            closeDialog={() => setIsDeleteDialogOpen(false)}
            confirm={() => handleDeleteTool(activeTool)}
            dialogMessage="This action will delete the selected tool. You won't be able to recover it."
            dialogTitle="Are you sure?"
            confirmButton="Yes, delete tool"
            danger
            closeOnConfirm
          />
        </>
      )}
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
              {tools.length}
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
            <Button
              variant="contained"
              onClick={() => setIsCreateNewToolDialogOpen(true)}
              startIcon={<Icon icon={AddIcon} />}
            >
              Create Tool
            </Button>
          </Box>
        </Box>
        <DataGrid
          rows={tools}
          columns={toolColumns}
          autoHeight
          hideFooter
          autoPageSize
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
      </Box>
    </>
  );
}
