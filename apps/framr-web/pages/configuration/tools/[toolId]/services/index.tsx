import AddIcon from '@iconify/icons-fluent/add-24-filled';
import left from '@iconify/icons-fluent/arrow-left-24-filled';
import AttachIcon from '@iconify/icons-fluent/attach-24-filled';
import more from '@iconify/icons-fluent/more-vertical-24-regular';
import { Icon } from '@iconify/react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ConfirmDialog } from '../../../../../components/sharedComponents/confirmDialog';
import ManageServiceDialog from '../../../../../lib/modules/services/ManageServiceDialog';
import MoreMenu from '../../../../../lib/modules/services/MoreMenu';
import ServiceDetailDialog from '../../../../../lib/modules/services/ServiceDetailDialog';
import { theme } from '../../../../../lib/theme';
import { CreateService, Service, Tool } from '../../../../../lib/types';
import { ToolEnum } from '../../../../../lib/types/enums';

export default function ToolManagement() {
  const { push } = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tool] = useState<Tool>({
    id: 'abcd132',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  });

  //TODO; replace this with a call to the API
  const [Services] = useState<Service[]>([
    {
      id: 'abcd123',
      name: 'ADN',
      tool: tool,
      dpoints: [
        {
          id: 'abcd123',
          name: 'ADN',
          tool: tool,
          bits: 1,
        },
      ],
    },

    {
      id: 'abcd213',
      name: 'ADN',
      tool: tool,
      dpoints: [],
    },
  ]);

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
    //TODO: CALL API HERE TO CREATE NEW Service
    console.log(val);
    setActiveService(undefined);
  }

  function handleEdit(val: Service) {
    //TODO: CALL API HERE TO edit tool
    console.log(val);
    setActiveService(undefined);
  }

  function handleDelete(val: Service) {
    //TODO: CALL API HERE TO DELETE
    console.log('delete service', val);
    setIsDeleteDialogOpen(false);
    setActiveService(undefined);
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
              {Services.length}
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
          rows={Services}
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
