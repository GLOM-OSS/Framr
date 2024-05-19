import AddIcon from '@iconify/icons-fluent/add-24-filled';
import AttachIcon from '@iconify/icons-fluent/attach-24-filled';
import more from '@iconify/icons-fluent/more-vertical-24-regular';
import { Icon } from '@iconify/react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../../../components/sharedComponents/confirmDialog';
import { ToolsEventChannel, ToolsService } from '../../services';
import { EventBus, EventBusChannelStatus } from '../../services/libs/event-bus';
import { theme } from '../../theme';
import { CreateTool, ITool, Tool } from '../../types';
import ManageToolDialog from './ManageToolDialog';
import MoreMenu from './MoreMenu';
import ToolDetailDialog from './ToolDetailsDialog';

export default function ToolManagement() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const eventBus = new EventBus();
  const toolsService = new ToolsService();
  const [tools, setTools] = useState<Tool[]>([]);

  function fetchTools() {
    eventBus.on<Tool[]>(
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

  const [activeTool, setActiveTool] = useState<Tool>();

  const toolColumns: GridColDef<Tool>[] = [
    { field: 'name', headerName: 'Tools Name', flex: 1 },
    { field: 'long', headerName: 'Long', flex: 1 },
    { field: 'version', headerName: 'Version', width: 100 },
    { field: 'type', headerName: 'Type', width: 100 },
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
    eventBus.once<Tool>(
      ToolsEventChannel.CREATE_TOOLS_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveTool(undefined);
          fetchTools();
        }
      }
    );
    toolsService.create(val);
  }

  function handleEditTool(val: ITool) {
    eventBus.once<Tool>(
      ToolsEventChannel.UPDATE_TOLLS_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveTool(undefined);
          fetchTools();
        }
      }
    );
    toolsService.update(val.id, val);
  }

  function handleDeleteTool(tool: Tool) {
    eventBus.once<Tool>(
      ToolsEventChannel.DELETE_TOLLS_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setIsDeleteDialogOpen(false);
          setActiveTool(undefined);
          fetchTools();
        }
      }
    );
    toolsService.delete(tool.id);
  }

  function handleFilesImport(files: FileList | null) {
    if (files && files.length === 2) {
      let xmlFile: File | null = null;
      let txtFile: File | null = null;

      for (let i = 0; i < files.length; i++) {
        if (files[i].type === 'text/xml' || files[i].name.endsWith('.xml')) {
          xmlFile = files[i];
        } else if (
          files[i].type === 'text/plain' ||
          files[i].name.endsWith('.txt')
        ) {
          txtFile = files[i];
        }
      }

      if (xmlFile && txtFile) {
        // import tools from xml
        eventBus.once<Tool>(
          ToolsEventChannel.CREATE_FROM_TOOLS_CHANNEL,
          ({ status }) => {
            if (status === EventBusChannelStatus.SUCCESS) {
              setActiveTool(undefined);
              fetchTools();
            }
          }
        );
        toolsService.createFrom(xmlFile, txtFile);
      } else {
        alert('Please upload one XML file and one TXT file.');
      }
    } else {
      alert('Please select exactly two files: one XML and one TXT.');
    }
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
            closeDialog={() => {
              setActiveTool(undefined);
              setIsDeleteDialogOpen(false);
            }}
            confirm={() => handleDeleteTool(activeTool)}
            dialogMessage="This action will delete the selected tool. You won't be able to recover it."
            dialogTitle="Are you sure?"
            confirmButton="Yes, delete tool"
            danger
            closeOnConfirm
          />
          <ToolDetailDialog
            isDialogOpen={isDetailsDialogOpen}
            closeDialog={() => {
              setActiveTool(undefined);
              setIsDetailsDialogOpen(false);
            }}
            handleEdit={() => {
              setIsDetailsDialogOpen(false);
              setIsEditDialogOpen(true);
            }}
            data={activeTool}
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
              <input
                hidden
                multiple
                type="file"
                id="fileInput"
                accept=".txt,.xml"
                onChange={(e) => handleFilesImport(e.target.files)}
              />
              <label htmlFor="fileInput">Import Tool</label>
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
          // hideFooter
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
