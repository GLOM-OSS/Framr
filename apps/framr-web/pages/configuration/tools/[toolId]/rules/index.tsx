import AddIcon from '@iconify/icons-fluent/add-24-filled';
import left from '@iconify/icons-fluent/arrow-left-24-filled';
import AttachIcon from '@iconify/icons-fluent/attach-24-filled';
import more from '@iconify/icons-fluent/more-vertical-24-regular';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  ConstraintEnum,
  FrameEnum,
  RuleEnum,
  ToolEnum,
} from '../../../../..//lib/types/enums';
import { ConfirmDialog } from '../../../../../components/sharedComponents/confirmDialog';
import ManageRuleDialog from '../../../../../lib/modules/rules/ManageRuleDialog';
import RuleDetailDialog from '../../../../../lib/modules/rules/RuleDetailDialog';
import MoreMenu from '../../../../../lib/modules/services/MoreMenu';
import { theme } from '../../../../../lib/theme';
import {
  CreateRule,
  CreateRuleWithConstraint,
  CreateRuleWithOtherDPoint,
  CreateStandAloneRule,
  Rule,
  RuleWithConstraint,
  RuleWithOtherDPoint,
  StandAloneRule,
} from '../../../../../lib/types';

export function descriptionHasOtherDpoints(description: RuleEnum) {
  return (
    description !== RuleEnum.SHOULD_BE_PRESENT &&
    description !== RuleEnum.SHOULD_BE_THE_FIRST &&
    description !== RuleEnum.SHOULD_NOT_BE_PRESENT &&
    description !== RuleEnum.SHOULD_NOT_BE_THE_FIRST &&
    description !== RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT &&
    description !== RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
  );
}

export function descriptionHasConstraint(description: RuleEnum) {
  return (
    description === RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT ||
    description === RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
  );
}

export default function RuleManagement() {
  const { push } = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  //TODO: CALL API TO FETCH RULES HERE
  const [rules] = useState<Rule[]>([
    {
      id: '1234',
      name: 'rule1',
      description: RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT,
      tool: {
        id: 'abcd123',
        name: 'ADN',
        version: 'V8.5bf8',
        long: 'adnVISION 675',
        type: ToolEnum.LWD,
      },
      concernedDpoint: {
        id: 'abcd123',
        name: 'ADN',
        bits: 1,
        tool: {
          id: 'abcd123',
          name: 'ADN',
          version: 'V8.5bf8',
          long: 'adnVISION 675',
          type: ToolEnum.LWD,
        },
      },
      framesets: [FrameEnum.MTF, FrameEnum.ROT],
      interval: 3,
      type: ConstraintEnum.DISTANCE,
      // otherDpoints: [
      //   {
      //     id: 'abcd123',
      //     name: 'ADN',
      //     bits: 1,
      //     tool: {
      //       id: 'abcd123',
      //       name: 'ADN',
      //       version: 'V8.5bf8',
      //       long: 'adnVISION 675',
      //       type: ToolEnum.LWD,
      //     },
      //   }
      // ],
    },
  ]);

  const [activeRule, setActiveRule] = useState<Rule>();

  const ruleColumns: GridColDef<Rule>[] = [
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
      width: 50,
      renderCell: ({ row: dPoint }) => (
        <Tooltip title="More">
          <IconButton
            onClick={(event) => {
              setActiveRule(dPoint);
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

  function handleCreate(val: CreateRule) {
    const { concernedDpoint, description, framesets, tool, name } =
      val as CreateStandAloneRule;

    let submitData: CreateRule = {
      concernedDpoint,
      description,
      framesets,
      tool,
      name: name ? name : undefined,
    };

    if (descriptionHasOtherDpoints(val.description)) {
      const { otherDpoints, description } = val as CreateRuleWithOtherDPoint;
      submitData = {
        ...submitData,
        description,
        otherDpoints,
      } as RuleWithOtherDPoint;
    } else if (descriptionHasConstraint(val.description)) {
      const { description, interval, type } = val as CreateRuleWithConstraint;
      submitData = {
        ...submitData,
        description,
        interval,
        type,
      } as RuleWithConstraint;
    }
    // if it neither has a secondary dpoint nor constraint, then it's stand alone
    //TODO: CALL API HERE TO CREATE NEW DPoint
    console.log(submitData);
    setActiveRule(undefined);
  }

  function handleEdit(val: Rule) {
    const { concernedDpoint, description, framesets, id, tool, name } =
      val as StandAloneRule;

    let submitData: Rule = {
      concernedDpoint,
      description,
      framesets,
      id,
      tool,
      name: name ? name : undefined,
    };

    if (descriptionHasOtherDpoints(val.description)) {
      const { otherDpoints, description } = val as RuleWithOtherDPoint;
      submitData = {
        ...submitData,
        description,
        otherDpoints,
      } as RuleWithOtherDPoint;
    } else if (descriptionHasConstraint(val.description)) {
      const { description, interval, type } = val as RuleWithConstraint;
      submitData = {
        ...submitData,
        description,
        interval,
        type,
      } as RuleWithConstraint;
    }
    // if it neither has a secondary dpoint nor constraint, then it's stand alone
    //TODO: CALL API HERE TO EDIT dpoint
    console.log(submitData);
    setActiveRule(undefined);
  }

  function handleDelete(val: Rule) {
    //TODO: CALL API HERE TO DELETE dpoint
    console.log('delete dpoint', val);
    setIsDeleteDialogOpen(false);
    setActiveRule(undefined);
  }

  return (
    <>
      {activeRule && (
        <>
          <MoreMenu
            anchorEl={anchorEl}
            isMenuOpen={!!anchorEl}
            closeMenu={() => setAnchorEl(null)}
            handleEdit={() => setIsEditDialogOpen(true)}
            handleDelete={() => setIsDeleteDialogOpen(true)}
            handleDetails={() => setIsDetailsDialogOpen(true)}
          />
          <RuleDetailDialog
            isDialogOpen={isDetailsDialogOpen}
            closeDialog={() => {
              setActiveRule(undefined);
              setIsDetailsDialogOpen(false);
            }}
            data={activeRule}
            handleEdit={() => {
              setIsDetailsDialogOpen(false);
              setIsEditDialogOpen(true);
            }}
          />
          <ConfirmDialog
            isDialogOpen={isDeleteDialogOpen}
            closeDialog={() => {
              setActiveRule(undefined);
              setIsDeleteDialogOpen(false);
            }}
            confirm={() => handleDelete(activeRule)}
            dialogMessage={`This action will delete the selected rule (${activeRule.tool.name} ${activeRule.description}). You won't be able to recover it.`}
            dialogTitle="Are you sure?"
            confirmButton="Yes, delete rule"
            danger
            closeOnConfirm
          />
        </>
      )}
      <ManageRuleDialog
        isDialogOpen={isEditDialogOpen || isCreateDialogOpen}
        closeDialog={() => {
          setActiveRule(undefined);
          setIsEditDialogOpen(false);
          setIsCreateDialogOpen(false);
        }}
        data={activeRule}
        handleCreate={handleCreate}
        handleEdit={handleEdit}
        isSubmitting={false}
        tool={{
          id: 'abcd123',
          name: 'ADN',
          version: 'V8.5bf8',
          long: 'adnVISION 675',
          type: ToolEnum.LWD,
        }}
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
            <Typography variant="h3">Rules</Typography>
            <Typography variant="h3" sx={{ color: theme.common.line }}>
              {rules.length}
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
              Import Rules
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsCreateDialogOpen(true)}
              startIcon={<Icon icon={AddIcon} />}
            >
              Create Rule
            </Button>
          </Box>
        </Box>
        <DataGrid
          rows={rules}
          columns={ruleColumns}
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
