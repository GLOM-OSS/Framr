import AddIcon from '@iconify/icons-fluent/add-24-filled';
import left from '@iconify/icons-fluent/arrow-left-24-filled';
import AttachIcon from '@iconify/icons-fluent/attach-24-filled';
import more from '@iconify/icons-fluent/more-vertical-24-regular';
import { Icon } from '@iconify/react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../../../../../components/sharedComponents/confirmDialog';
import ManageDPointDialog from '../../../../../lib/modules/dpoints/ManageDPointDialog';
import MoreMenu from '../../../../../lib/modules/dpoints/MoreMenu';
import {
  DPointsEventChannel,
  DPointsService,
  ToolsEventChannel,
  ToolsService,
} from '../../../../../lib/services';
import {
  EventBus,
  EventBusChannelStatus,
} from '../../../../../lib/services/libs/event-bus';
import { theme } from '../../../../../lib/theme';
import { CreateDPoint, DPoint, Tool } from '../../../../../lib/types';
import { ToolEnum } from '../../../../../lib/types/enums';

export default function ToolManagement() {
  const {
    push,
    query: { toolId },
  } = useRouter();

  const eventBus = new EventBus();
  const toolsService = new ToolsService();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tool, setTool] = useState<Tool>({
    id: 'abcd132',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  });

  function fetchTool(toolId: string) {
    eventBus.on<Tool>(
      ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setTool(data);
        }
      }
    );
    toolsService.findOne(toolId);
  }

  const dpointsService = new DPointsService();
  const [dPoints, setDPoints] = useState<DPoint[]>([]);

  function fetchDPoints(toolId: string) {
    eventBus.on<DPoint[]>(
      DPointsEventChannel.FIND_ALL_DPOINT_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setDPoints(data);
        }
      }
    );
    dpointsService.findAll({ toolId });
  }

  useEffect(() => {
    if (typeof toolId === 'string') {
      fetchTool(toolId);
      fetchDPoints(toolId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  const [activeDPoint, setActiveDpoint] = useState<DPoint>();

  const dPointColumns: GridColDef<DPoint>[] = [
    { field: 'name', headerName: 'DPoint Name', flex: 1 },
    { field: 'bits', headerName: 'Number of Bits', flex: 1 },
    {
      field: 'action',
      headerName: '',
      width: 50,
      renderCell: ({ row: dPoint }) => (
        <Tooltip title="More">
          <IconButton
            onClick={(event) => {
              setActiveDpoint(dPoint);
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
  const [isCreateNewToolDialogOpen, setIsCreateNewToolDialogOpen] =
    useState<boolean>(false);

  function handleCreateDPoint(val: CreateDPoint) {
    eventBus.once<DPoint>(
      DPointsEventChannel.CREATE_DPOINT_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveDpoint(undefined);
          fetchDPoints(tool.id);
        }
      }
    );
    dpointsService.create(val);
  }

  function handleEditDPoint(val: DPoint) {
    eventBus.once<DPoint>(
      DPointsEventChannel.UPDATE_DPOINT_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveDpoint(undefined);
          fetchDPoints(tool.id);
        }
      }
    );
    dpointsService.update(val.id, val);
  }

  function handleDelete(val: DPoint) {
    eventBus.once<DPoint>(
      DPointsEventChannel.DELETE_DPOINT_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setIsDeleteDialogOpen(false);
          setActiveDpoint(undefined);
          fetchDPoints(tool.id);
        }
      }
    );
    dpointsService.delete(val.id);
  }

  return (
    <>
      {activeDPoint && (
        <>
          <MoreMenu
            anchorEl={anchorEl}
            isMenuOpen={!!anchorEl}
            closeMenu={() => setAnchorEl(null)}
            handleEdit={() => setIsEditDialogOpen(true)}
            handleDelete={() => setIsDeleteDialogOpen(true)}
          />
          <ConfirmDialog
            isDialogOpen={isDeleteDialogOpen}
            closeDialog={() => {
              setActiveDpoint(undefined);
              setIsDeleteDialogOpen(false);
            }}
            confirm={() => handleDelete(activeDPoint)}
            dialogMessage="This action will delete the selected dpoint. You won't be able to recover it."
            dialogTitle="Are you sure?"
            confirmButton="Yes, delete dpoint"
            danger
            closeOnConfirm
          />
        </>
      )}
      <ManageDPointDialog
        closeDialog={() => {
          setIsCreateNewToolDialogOpen(false);
          setIsEditDialogOpen(false);
          setActiveDpoint(undefined);
        }}
        isDialogOpen={isEditDialogOpen || isCreateNewToolDialogOpen}
        isSubmitting={false}
        handleCreate={handleCreateDPoint}
        handleEdit={handleEditDPoint}
        data={activeDPoint}
        tool={tool}
      />

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
            <Tooltip title="Back to Tools">
              <IconButton
                onClick={() => {
                  push('/configuration/tools');
                }}
              >
                <Icon icon={left} color="#111827" />
              </IconButton>
            </Tooltip>
            <Typography variant="h3">DPoints</Typography>
            <Typography variant="h3" sx={{ color: theme.common.line }}>
              {dPoints.length}
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
              Import DPoints
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsCreateNewToolDialogOpen(true)}
              startIcon={<Icon icon={AddIcon} />}
            >
              Create DPoint
            </Button>
          </Box>
        </Box>
        <DataGrid
          rows={dPoints}
          columns={dPointColumns}
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
