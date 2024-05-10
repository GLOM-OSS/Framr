import more from '@iconify/icons-fluent/more-vertical-24-regular';
import { Icon } from '@iconify/react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    FSLFrameset,
    FramesetDpoint,
    Tool,
    UtilityFrameset,
} from '../../../../../lib/types';
import { ToolEnum } from '../../../../../lib/types/enums';

interface FrameProps {
  frame: FSLFrameset | UtilityFrameset;
  manageRules: (val: Tool) => void;
}
export default function Frame({
  frame: { dpoints, frame },
  manageRules,
}: FrameProps) {
  const toolColumns: GridColDef<FramesetDpoint>[] = [
    {
      field: 'name',
      headerName: frame,
      flex: 1,
      renderCell: ({ row: dpoint }) => (
        <Tooltip
          arrow
          title={
            dpoint.error ? (
              <Box>
                {dpoint.error}
                <Button
                  sx={{ marginLeft: 1 }}
                  variant="contained"
                  color="primary"
                  onClick={() => manageRules(dpoint.tool)}
                >
                  Manage rules
                </Button>
              </Box>
            ) : (
              ''
            )
          }
        >
          <Typography
            sx={{
              display: 'grid',
              alignContent: 'center',
              color: dpoint.error
                ? '#BF0000'
                : dpoint.tool.type === ToolEnum.MWD
                ? '#5CB360'
                : '#6B7280',
            }}
            height="100%"
          >
            {dpoint.name}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'bits',
      headerName: 'Bits',
      width: 50,
      renderCell: ({ row: dpoint }) => (
        <Typography
          sx={{
            display: 'grid',
            alignContent: 'center',
            color: dpoint.error
              ? '#BF0000'
              : dpoint.tool.type === ToolEnum.MWD
              ? '#5CB360'
              : '#6B7280',
          }}
          height="100%"
        >
          {dpoint.bits}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: '',
      width: 50,
      renderCell: ({ row: dpoint }) => (
        <Tooltip title="More">
          <IconButton>
            <Icon
              icon={more}
              fontSize={18}
              color={
                dpoint.error
                  ? '#BF0000'
                  : dpoint.tool.type === ToolEnum.MWD
                  ? '#5CB360'
                  : '#6B7280'
              }
            />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box height={'100%'}>
      <DataGrid
        rows={dpoints}
        columns={toolColumns}
        hideFooter
        autoPageSize
        disableColumnMenu
        hideFooterSelectedRowCount
        sx={{
          minHeight: '130px',
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
  );
}
