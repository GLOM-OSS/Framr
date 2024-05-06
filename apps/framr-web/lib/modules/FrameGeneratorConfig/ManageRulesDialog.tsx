import { Box, Button, Chip, Dialog, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { DialogTransition } from '../../../components/sharedComponents/dialog-transition';
import IOSSwitch from '../../../components/sharedComponents/iosSwitch';
import { GeneratorConfigRule } from '../../types';
import { FrameEnum } from '../../types/enums';

interface ManageRulesDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  rules: GeneratorConfigRule[];
  handleSave: (rules: GeneratorConfigRule[]) => void;
}
export default function ManageRulesDialog({
  isDialogOpen,
  closeDialog,
  rules,
  handleSave,
}: ManageRulesDialogProps) {
  const [tempRules, setTempRules] = useState<GeneratorConfigRule[]>([]);
  const ruleColumns: GridColDef<GeneratorConfigRule>[] = [
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      valueGetter: (_, row) => `${row.concernedDpoint.name} ${row.description}`,
    },
    {
      field: 'framesets',
      headerName: 'Frameset',
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridAutoFlow: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'start',
          }}
        >
          {row.framesets.map((frame, index) => (
            <Chip
              label={frame}
              key={index}
              variant="outlined"
              size="small"
              color={
                frame === FrameEnum.GTF
                  ? 'primary'
                  : frame === FrameEnum.MTF
                  ? 'secondary'
                  : frame === FrameEnum.ROT
                  ? 'success'
                  : 'default'
              }
            />
          ))}
        </Box>
      ),
    },
    { field: 'name', headerName: 'Rule Name', flex: 1 },
    {
      field: 'action',
      headerName: '',
      width: 75,
      renderCell: ({ row }) => (
        <IOSSwitch
          checked={row.isActive}
          onChange={() => handleRuleStatusChange(row)}
        />
      ),
    },
  ];

  useEffect(() => {
    if (isDialogOpen) {
      setTempRules(rules.filter(({ isGeneric }) => isGeneric));
    }
  }, [isDialogOpen, rules]);

  function handleRuleStatusChange(rule: GeneratorConfigRule) {
    const updatedRules = tempRules.map((tempRule) =>
      tempRule.id === rule.id
        ? { ...tempRule, isActive: !tempRule.isActive }
        : tempRule
    );
    setTempRules(updatedRules);
  }

  return (
    <Dialog
      open={isDialogOpen}
      TransitionComponent={DialogTransition}
      keepMounted
      onClose={() => closeDialog()}
      sx={{
        '& .MuiPaper-root': {
          minWidth: '80svw',
          borderRadius: 1.5,
        },
      }}
    >
      <Box
        sx={{
          padding: { laptop: 2, mobile: 0 },
          display: 'grid',
          rowGap: 2,
          minHeight: '500px',
        }}
      >
        <Typography variant="h4">Rule Details</Typography>
        <DataGrid
          rows={tempRules}
          columns={ruleColumns}
          hideFooter
          density="compact"
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
        <Box
          py={2}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            justifyItems: 'end',
            borderTop: '1px solid #E0E0E0',
          }}
        >
          <Button variant="outlined" color="inherit" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSave(tempRules)}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
