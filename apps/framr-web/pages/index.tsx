import download from '@iconify/icons-fluent/arrow-download-20-regular';
import { Icon } from '@iconify/react';
import { Box, Button, Divider } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/sharedComponents/confirmDialog';
import GeneratorHeader from '../lib/modules/FrameGenerator/GeneratorHeader';
import ToolList from '../lib/modules/FrameGenerator/ToolList';
import { NewConstraint } from '../lib/modules/FrameGenerator/framesets/FrameList/Frame';
import FramesetList from '../lib/modules/FrameGenerator/framesets/FrameList/FramesetList';
import FramesetHeader from '../lib/modules/FrameGenerator/framesets/FramesetHeader';
import FrameGeneratorConfig from '../lib/modules/FrameGeneratorConfig/FrameGeneratorConfig';
import { FramrService } from '../lib/services';
import { getRandomID } from '../lib/services/core/modules/common/common';
import {
  DPoint,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
  LWDGeneratorConfigTool,
  MWDGeneratorConfigTool,
  Tool,
} from '../lib/types';
import {
  ConstraintEnum,
  FrameEnum,
  WithConstraintRuleEnum,
} from '../lib/types/enums';

export default function FrameGenerator() {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [frameConfig, setFrameConfig] = useState<GeneratorConfig>();
  const [selectedDPoints, setSelectedDPoints] = useState<DPoint[]>([]);
  const [activeFSL, setActiveFSL] = useState<number>(1);
  const [selectedFrames, setSelectedFrames] = useState<FrameEnum[]>([
    FrameEnum.GTF,
    FrameEnum.MTF,
    FrameEnum.ROT,
    FrameEnum.UTIL,
  ]);

  const framrService = useMemo(
    () => new FramrService(frameConfig),
    [frameConfig]
  );
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectModeDPoints, setSelectModeDPoints] = useState<FramesetDpoint[]>(
    []
  );

  const [confirmDialogUsage, setConfirmDialogUsage] = useState<
    'constraint' | 'dpoints'
  >();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  function removeConstraintOnSelectedDPoints(
    selectModeDPoints: FramesetDpoint[]
  ) {
    framrService.removeDPointsConstraints(activeFSL, selectModeDPoints);
    if (framrService.generatorConfig)
      setFrameConfig(framrService.generatorConfig);
  }

  function removeSelectModeDPoints(selectModeDPoints: DPoint[]) {
    setSelectedDPoints((prev) =>
      prev.filter((dpoint) => !selectModeDPoints.includes(dpoint))
    );
  }

  function addConstraitToMultipleDPoints(val: {
    interval: number;
    type: ConstraintEnum;
    dPoints: DPoint[];
  }) {
    frameConfig?.tools.forEach((tool) => {
      const rules = [
        ...tool.rules,
        ...val.dPoints
          .filter(({ tool: { id } }) => id === tool.id)
          .map<GeneratorConfigRule>((dpoint) => ({
            description:
              val.type === ConstraintEnum.DISTANCE
                ? WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT
                : WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
            interval: val.interval,
            type: val.type,
            framesets: [],
            concernedDpoint: dpoint,
            id: getRandomID(),
            isActive: true,
            isGeneric: true,
            tool,
          })),
      ];
      if (tool.rules.length > rules.length)
        framrService.updateToolRules(tool.id, rules);
    });
    if (framrService.generatorConfig)
      setFrameConfig(framrService.generatorConfig);
  }

  const [ruleTool, setRuleTool] = useState<
    LWDGeneratorConfigTool | MWDGeneratorConfigTool
  >();
  function getActiveTool(tool: Tool, generatorConfig: GeneratorConfig) {
    if (generatorConfig.MWDTool.id === tool.id)
      setRuleTool(generatorConfig.MWDTool);
    else {
      const toold = generatorConfig.tools.find(({ id }) => id === tool.id);
      setRuleTool(toold);
    }
  }

  function handleRemoveDPoint(dpoint: FramesetDpoint) {
    console.log('Remove dpoint: ', dpoint);
    framrService.removeDPoints(activeFSL, [dpoint.id]);
    if (framrService.generatorConfig)
      setFrameConfig(framrService.generatorConfig);
  }

  function handleRemoveConstraint(dpoint: FramesetDpoint) {
    console.log('Remove dpoint constraint: ', dpoint);
    removeConstraintOnSelectedDPoints([dpoint]);
  }

  function handleAddNewConstraint(val: NewConstraint) {
    console.log('Add new constraint: ', val);
    addConstraitToMultipleDPoints({
      dPoints: [val.dpoint],
      interval: val.interval,
      type: val.type,
    });
  }

  useEffect(() => {
    if (framrService.generatorConfig) {
      framrService.dispatchAndOrderDPoints(activeFSL, selectedDPoints);
      setFrameConfig(framrService.generatorConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDPoints]);

  useEffect(() => {
    if (framrService.generatorConfig) {
      framrService.orderFramesets(activeFSL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameConfig]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return (
    isClient &&
    (isConfigOpen || !frameConfig ? (
      <FrameGeneratorConfig
        ruleTool={ruleTool}
        data={frameConfig}
        submitConfig={(data) => {
          setFrameConfig(data);
          setIsConfigOpen(false);
        }}
      />
    ) : (
      <>
        {confirmDialogUsage && (
          <ConfirmDialog
            closeDialog={() => {
              setConfirmDialogUsage(undefined);
              setIsConfirmDialogOpen(false);
            }}
            isDialogOpen={isConfirmDialogOpen}
            dialogMessage={`Are you sure you want to remove the selected ${confirmDialogUsage}?`}
            dialogTitle={`Remove ${confirmDialogUsage}`}
            confirm={() => {
              if (confirmDialogUsage === 'constraint')
                removeConstraintOnSelectedDPoints(selectModeDPoints);
              else removeSelectModeDPoints(selectModeDPoints);
            }}
            closeOnConfirm
            danger
            confirmButton={`Remove ${confirmDialogUsage}`}
          />
        )}
        <Box
          sx={{
            height: '100%',
            display: 'grid',
            gridTemplateRows: 'auto auto 1fr',
            rowGap: 2,
          }}
        >
          <GeneratorHeader
            data={frameConfig}
            handleEdit={() => setIsConfigOpen(true)}
          />
          <Divider />
          <Box
            sx={{
              display: 'grid',
              height: '100%',
              gridTemplateColumns: '26.6fr auto 74.4fr',
              columnGap: 2,
            }}
          >
            <ToolList
              data={frameConfig}
              getDPoints={(selectedDPoints) =>
                setSelectedDPoints(selectedDPoints)
              }
            />
            <Divider orientation="vertical" />
            <Box
              sx={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto',
                rowGap: 2,
              }}
            >
              <FramesetHeader
                selectModeDPoints={selectModeDPoints}
                closeSelectMode={() => {
                  setSelectModeDPoints([]);
                  setIsSelectMode(false);
                }}
                activeFSL={activeFSL}
                selectedFrames={selectedFrames}
                setActiveFSL={setActiveFSL}
                setSelectedFrames={setSelectedFrames}
                isSelectMode={isSelectMode}
                setIsSelectMode={setIsSelectMode}
                submitNewDPoint={(val) =>
                  setSelectedDPoints((prev) => [...prev, val])
                }
                handleRemoveConstraints={() => {
                  setIsConfirmDialogOpen(true);
                  setConfirmDialogUsage('constraint');
                }}
                handleRemoveDPoints={() => {
                  setIsConfirmDialogOpen(true);
                  setConfirmDialogUsage('dpoints');
                }}
                selectedDPoints={selectedDPoints}
                submitMultipleConstraints={addConstraitToMultipleDPoints}
              />
              <FramesetList
                handleRemoveDPoint={handleRemoveDPoint}
                handleRemoveConstraint={handleRemoveConstraint}
                handleAddNewConstraint={handleAddNewConstraint}
                frameConfig={frameConfig}
                frameset={frameConfig.framesets}
                activeFSL={activeFSL}
                selectedFrames={selectedFrames}
                handleSelect={(val) => setSelectModeDPoints(val)}
                isSelectMode={isSelectMode}
                selectModeDPoints={selectModeDPoints}
                manageRules={(val) => {
                  getActiveTool(val, frameConfig);
                  setIsConfigOpen(true);
                }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{ justifySelf: 'end' }}
                startIcon={<Icon icon={download} />}
              >
                Export Framesets
              </Button>
            </Box>
          </Box>
        </Box>
      </>
    ))
  );
}
