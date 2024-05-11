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
import ManageServiceDialog from '../../../../../lib/modules/services/ManageServiceDialog';
import MoreMenu from '../../../../../lib/modules/services/MoreMenu';
import ServiceDetailDialog from '../../../../../lib/modules/services/ServiceDetailDialog';
import {
  ServicesEventChannel,
  ServicesService,
  ToolsEventChannel,
  ToolsService,
} from '../../../../../lib/services';
import {
  EventBus,
  EventBusChannelStatus,
} from '../../../../../lib/services/libs/event-bus';
import { theme } from '../../../../../lib/theme';
import { CreateService, Service, Tool } from '../../../../../lib/types';

export default function ToolManagement() {
  const {
    push,
    query: { toolId },
  } = useRouter();

  const eventBus = new EventBus();
  const toolsService = new ToolsService();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tool, setTool] = useState<Tool>();

  function fetchTool(toolId: string) {
    eventBus.once<Tool>(
      ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setTool(data);
        }
      }
    );
    toolsService.findOne(toolId);
  }

  const servicesService = new ServicesService();
  const [services, setServices] = useState<Service[]>([]);
  function fetchServices(toolId: string) {
    eventBus.once<Service[]>(
      ServicesEventChannel.FIND_ALL_SERVICES_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setServices(data);
        }
      }
    );
    servicesService.findAll(toolId);
  }

  useEffect(() => {
    if (typeof toolId === 'string') {
      fetchTool(toolId);
      fetchServices(toolId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  const [activeService, setActiveService] = useState<Service>();

  const serviceColumns: GridColDef<Service>[] = [
    { field: 'name', headerName: 'Service Name', flex: 1 },
    { field: 'interact', headerName: 'Interact', flex: 1 },
    {
      field: 'action',
      headerName: '',
      width: 50,
      renderCell: ({ row: service }) => (
        <Tooltip title="More">
          <IconButton
            onClick={(event) => {
              setActiveService(service);
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

  function handleCreate(val: CreateService) {
    eventBus.once<Service>(
      ServicesEventChannel.CREATE_SERVICES_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveService(undefined);
          fetchServices(val.tool.id);
        }
      }
    );
    servicesService.create(val);
  }

  function handleEdit(val: Service) {
    eventBus.once<Service>(
      ServicesEventChannel.UPDATE_SERVICES_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveService(undefined);
          fetchServices(val.tool.id);
        }
      }
    );
    servicesService.update(val.id, val);
  }

  function handleDelete(val: Service) {
    eventBus.once<Service>(
      ServicesEventChannel.DELETE_SERVICES_CHANNEL,
      ({ status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setIsDeleteDialogOpen(false);
          setActiveService(undefined);
          fetchServices(val.tool.id);
        }
      }
    );
    servicesService.delete(val.id);
  }

  return (
    <>
      {activeService && (
        <>
          <MoreMenu
            anchorEl={anchorEl}
            isMenuOpen={!!anchorEl}
            closeMenu={() => setAnchorEl(null)}
            handleEdit={() => setIsEditDialogOpen(true)}
            handleDetails={() => setIsDetailsDialogOpen(true)}
            handleDelete={() => setIsDeleteDialogOpen(true)}
          />
          <ConfirmDialog
            isDialogOpen={isDeleteDialogOpen}
            closeDialog={() => {
              setActiveService(undefined);
              setIsDeleteDialogOpen(false);
            }}
            confirm={() => handleDelete(activeService)}
            dialogMessage={`This action will delete the selected service (${activeService.name}). You won't be able to recover it.`}
            dialogTitle="Are you sure?"
            confirmButton="Yes, delete service"
            danger
            closeOnConfirm
          />
          <ServiceDetailDialog
            data={activeService}
            isDialogOpen={isDetailsDialogOpen}
            closeDialog={() => {
              setActiveService(undefined);
              setIsDetailsDialogOpen(false);
            }}
            handleEdit={() => {
              setIsDetailsDialogOpen(false);
              setIsEditDialogOpen(true);
            }}
          />
        </>
      )}
      {tool && (
        <ManageServiceDialog
          closeDialog={() => {
            setIsCreateNewToolDialogOpen(false);
            setIsEditDialogOpen(false);
            setActiveService(undefined);
          }}
          isDialogOpen={isEditDialogOpen || isCreateNewToolDialogOpen}
          isSubmitting={false}
          handleCreate={handleCreate}
          handleEdit={handleEdit}
          data={activeService}
          tool={tool}
        />
      )}
      {/* <ManageToolDialog
        closeDialog={() => {
          setIsCreateNewToolDialogOpen(false);
          setIsEditDialogOpen(false);
          setActiveService(undefined);
        }}
        isDialogOpen={isEditDialogOpen || isCreateNewToolDialogOpen}
        isSubmitting={false}
        handleCreate={handleCreate}
        handleEdit={handleEdit}
        data={activeTool}
      /> */}
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
            <Typography variant="h3">Services</Typography>
            <Typography variant="h3" sx={{ color: theme.common.line }}>
              {services.length}
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
              Import Services
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsCreateNewToolDialogOpen(true)}
              startIcon={<Icon icon={AddIcon} />}
            >
              Create Service
            </Button>
          </Box>
        </Box>
        <DataGrid
          rows={services}
          columns={serviceColumns}
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
