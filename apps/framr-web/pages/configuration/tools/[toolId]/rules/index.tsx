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
import { useEffect, useState } from 'react';
import {
  FrameEnum,
  RuleEnumType,
  StandAloneRuleEnum,
  WithConstraintRuleEnum,
} from '../../../../..//lib/types/enums';
import { ConfirmDialog } from '../../../../../components/sharedComponents/confirmDialog';
import ManageRuleDialog from '../../../../../lib/modules/rules/ManageRuleDialog';
import RuleDetailDialog from '../../../../../lib/modules/rules/RuleDetailDialog';
import MoreMenu from '../../../../../lib/modules/services/MoreMenu';
import {
  RulesEventChannel,
  RulesService,
  ToolsEventChannel,
  ToolsService,
} from '../../../../../lib/services';
import {
  EventBus,
  EventBusChannelStatus,
} from '../../../../../lib/services/libs/event-bus';
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
  Tool,
} from '../../../../../lib/types';

export function descriptionHasOtherDpoints(description: RuleEnumType) {
  return (
    description !== StandAloneRuleEnum.SHOULD_BE_PRESENT &&
    description !== StandAloneRuleEnum.SHOULD_BE_THE_FIRST &&
    description !== StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT &&
    description !== StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST &&
    description !==
      WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT &&
    description !==
      WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
  );
}

export function descriptionHasConstraint(description: RuleEnumType) {
  return (
    description ===
      WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT ||
    description ===
      WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
  );
}

export default function RuleManagement() {
  const {
    push,
    query: { toolId },
  } = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const eventBus = new EventBus();
  const rulesService = new RulesService();
  const toolsService = new ToolsService();
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>();

  function fetchTool(toolId: string) {
    eventBus.once<Tool>(
      ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveTool(data);
        }
      }
    );
    toolsService.findOne(toolId);
  }

  function fetchRules(toolId: string) {
    eventBus.on<Rule[]>(
      RulesEventChannel.FIND_ALL_RULES_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setRules(data);
        }
      }
    );
    rulesService.findAll({ toolId });
  }
  useEffect(() => {
    if (typeof toolId === 'string') {
      fetchTool(toolId);
      fetchRules(toolId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

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
    {
      field: 'otherDpoints',
      headerName: 'Other Dpoints',
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
          <Typography>
            {(row as RuleWithOtherDPoint).otherDpoints
              ?.map(({ name }) => name)
              .join(', ')}
          </Typography>
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

  function createRule(val: CreateRule) {
    eventBus.once<Rule>(
      RulesEventChannel.CREATE_RULES_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveRule(undefined);
          fetchRules(data.tool.id);
        }
      }
    );
    rulesService.create(val);
  }

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
    createRule(submitData);
  }

  function editRule(val: Rule) {
    eventBus.once<Rule>(
      RulesEventChannel.UPDATE_RULES_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setActiveRule(undefined);
          fetchRules(data.tool.id);
        }
      }
    );
    rulesService.update(val.id, val);
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
    editRule(submitData);
  }

  function handleDelete(val: Rule) {
    eventBus.once<Rule>(
      RulesEventChannel.DELETE_RULES_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setIsDeleteDialogOpen(false);
          setActiveRule(undefined);
          fetchRules(data.tool.id);
        }
      }
    );
    rulesService.delete(val.id);
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
      {activeTool && (
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
          tool={activeTool}
        />
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
