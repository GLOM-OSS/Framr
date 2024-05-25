import more from '@iconify/icons-fluent/more-vertical-24-regular';
import square from '@iconify/icons-fluent/square-24-regular';
import constraintIcon from '@iconify/icons-fluent/square-hint-hexagon-24-regular';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import {
  FSLFrameset,
  FramesetDpoint,
  GeneratorConfig,
  RuleWithConstraint,
  Tool,
  UtilityFrameset,
} from '../../../../../lib/types';
import {
  ConstraintEnum,
  FrameEnum,
  ToolEnum,
  WithConstraintRuleEnum,
} from '../../../../../lib/types/enums';
import DPointMenu from './DPointMenu';
import AddConstraintMenu from './NewConstraintMenu';

interface IDPointConstraint {
  interval: number;
  type: ConstraintEnum;
}
export interface NewConstraint {
  type: ConstraintEnum;
  interval: number;
  dpoint: FramesetDpoint;
  frame: FrameEnum;
}
interface FrameProps {
  frame: FSLFrameset | UtilityFrameset;
  manageRules: (val: Tool) => void;
  frameConfig: GeneratorConfig;
  handleAddNewConstraint: (val: NewConstraint) => void;
  handleRemoveConstraint: (val: FramesetDpoint) => void;
  handleRemoveDPoint: (val: FramesetDpoint) => void;
  isSelectMode: boolean;
  selectModeDPoints: FramesetDpoint[];
  handleSelect: (val: FramesetDpoint[]) => void;
}
export default function Frame({
  frame: { dpoints, frame },
  manageRules,
  frameConfig,
  handleSelect,
  isSelectMode,
  selectModeDPoints,
  handleAddNewConstraint,
  handleRemoveConstraint,
  handleRemoveDPoint,
}: FrameProps) {
  function getDPointRules(dpoint: FramesetDpoint) {
    const tool = dpoint.tool;
    let concernedRules = [];
    if (tool.type === ToolEnum.MWD) concernedRules = frameConfig.MWDTool.rules;
    else
      concernedRules =
        frameConfig.tools.find((t) => t.id === tool.id)?.rules || [];

    return concernedRules.filter(
      (r) => r.concernedDpoint.id === dpoint.dpointId
    );
  }

  function getDPointConstraint(
    dpoint: FramesetDpoint
  ): IDPointConstraint | undefined {
    const rules = getDPointRules(dpoint);
    const constraint: { interval: number; type: ConstraintEnum } | undefined =
      undefined;
    if (!rules.length) return constraint;

    const rulesDescriptions = rules.filter(
      ({ description }) =>
        description ===
          WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT ||
        description ===
          WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
    );
    if (rulesDescriptions.length) {
      return {
        interval: (rulesDescriptions[0] as RuleWithConstraint).interval,
        type:
          (rulesDescriptions[0] as RuleWithConstraint).description ===
          WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT
            ? ConstraintEnum.DISTANCE
            : ConstraintEnum.TIME,
      };
    } else return constraint;
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeDPoint, setActiveDPoint] = useState<FramesetDpoint>();
  const [activeDPointRules, setActiveDPointRules] = useState<
    IDPointConstraint | undefined
  >();

  const [newConstraintType, setNewConstraintType] = useState<
    'distance' | 'time'
  >();

  function handleDpointSelect(dpoint: FramesetDpoint) {
    if (selectModeDPoints.map(({ id }) => id).includes(dpoint.id)) {
      handleSelect(selectModeDPoints.filter(({ id }) => id !== dpoint.id));
    } else {
      handleSelect([...selectModeDPoints, dpoint]);
    }
  }

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
      renderCell: ({ row: dpoint }) =>
        isSelectMode ? (
          <Checkbox
            size="small"
            checked={selectModeDPoints.map(({ id }) => id).includes(dpoint.id)}
            onChange={() => handleDpointSelect(dpoint)}
            icon={<Icon icon={square} fontSize={20} color="#D1D5DB" />}
          />
        ) : (
          <Tooltip title="More">
            <IconButton
              onClick={(e) => {
                setActiveDPoint(dpoint);
                setActiveDPointRules(getDPointConstraint(dpoint));
                setAnchorEl(e.currentTarget);
              }}
            >
              <Icon
                icon={getDPointConstraint(dpoint) ? constraintIcon : more}
                fontSize={20}
                color={
                  dpoint.error
                    ? '#BF0000'
                    : dpoint.tool.type === ToolEnum.MWD ||
                      getDPointConstraint(dpoint)
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
      {activeDPoint && !newConstraintType && (
        <DPointMenu
          isOpen={!!anchorEl}
          anchorEl={anchorEl}
          rule={activeDPointRules}
          closeMenu={() => {
            setActiveDPoint(undefined);
            setActiveDPointRules(undefined);
            setAnchorEl(null);
          }}
          handleAddDistanceConstraint={() => {
            setNewConstraintType('distance');
          }}
          handleAddTimeConstraint={() => setNewConstraintType('time')}
          handleRemoveConstraint={() => handleRemoveConstraint(activeDPoint)}
          handleRemoveDPoint={() => handleRemoveDPoint(activeDPoint)}
        />
      )}
      {activeDPoint && newConstraintType && (
        <AddConstraintMenu
          anchorEl={anchorEl}
          closeMenu={() => {
            setActiveDPoint(undefined);
            setActiveDPointRules(undefined);
            setNewConstraintType(undefined);
            setAnchorEl(null);
          }}
          handleAddConstraint={(val: {
            type: ConstraintEnum;
            interval: number;
          }) => handleAddNewConstraint({ ...val, dpoint: activeDPoint, frame })}
          isMenuOpen={!!anchorEl}
          usage={newConstraintType}
        />
      )}

      <Scrollbars universal autoHide>
        <DataGrid
          rows={dpoints}
          columns={toolColumns}
          hideFooter
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
      </Scrollbars>
    </Box>
  );
}
