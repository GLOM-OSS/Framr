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
import ManageDPointDialog from '../../../../../lib/modules/dpoints/ManageDPointDialog';
import MoreMenu from '../../../../../lib/modules/dpoints/MoreMenu';
import { theme } from '../../../../../lib/theme';
import { CreateDPoint, DPoint, Tool } from '../../../../../lib/types';
import { ToolEnum } from '../../../../../lib/types/enums';

export default function ToolManagement() {
  const { push } = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  //TODO: FETCH FOR THE ACTIVE TOOL HERE
  const [tool] = useState<Tool>({
    id: 'abcd132',
    name: 'ADN',
    version: 'V8.5bf8',
    long: 'adnVISION 675',
    type: ToolEnum.LWD,
  });

  //TODO; replace this with a call to the API
  const [dPoints] = useState<DPoint[]>([
    {
      id: 'abcd123',
      name: 'ADN',
      bits: 1,
      tool: tool,
    },

    {
      id: 'abcd213',
      name: 'ADN',
      bits: 1,
      tool: tool,
    },
  ]);

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

  function handleCreateTool(val: CreateDPoint) {
    //TODO: CALL API HERE TO CREATE NEW DPoint
    console.log(val);
  }

  function handleEditTool(val: DPoint) {
    //TODO: CALL API HERE TO EDIT dpoint
    console.log(val);
  }

  function handleDelete(val: DPoint) {
    //TODO: CALL API HERE TO DELETE dpoint
    console.log('delete dpoint', val);
    setIsDeleteDialogOpen(false);
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
            closeDialog={() => setIsDeleteDialogOpen(false)}
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
        handleCreate={handleCreateTool}
        handleEdit={handleEditTool}
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
