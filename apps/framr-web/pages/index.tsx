import download from '@iconify/icons-fluent/arrow-download-20-regular';
import { Icon } from '@iconify/react';
import { Box, Button, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/sharedComponents/confirmDialog';
import GeneratorHeader from '../lib/modules/FrameGenerator/GeneratorHeader';
import ToolList from '../lib/modules/FrameGenerator/ToolList';
import { NewConstraint } from '../lib/modules/FrameGenerator/framesets/FrameList/Frame';
import FramesetList from '../lib/modules/FrameGenerator/framesets/FrameList/FramesetList';
import FramesetHeader from '../lib/modules/FrameGenerator/framesets/FramesetHeader';
import FrameGeneratorConfig from '../lib/modules/FrameGeneratorConfig/FrameGeneratorConfig';
import {
  DPoint,
  FramesetDpoint,
  GeneratorConfig,
  LWDGeneratorConfigTool,
  MWDGeneratorConfigTool,
  Tool,
} from '../lib/types';
import { ConstraintEnum, FrameEnum, ToolEnum } from '../lib/types/enums';

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

  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

  useEffect(() => {
    /*TODO: CALL API HERE THAT SORTS SELECTED DPOINTS
    AND RETURNS THEM BY ORDER OF PRIORITY PER FRAMESETS
    THEN SET DATAIN FRAMESETS IN frameConfig
    */
    console.log(selectedDPoints);
  }, [selectedDPoints]);

  const [selectModeDPoints, setSelectModeDPoints] = useState<DPoint[]>([]);

  const [confirmDialogUsage, setConfirmDialogUsage] = useState<
    'constraint' | 'dpoints'
  >();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  function removeConstraintOnSelectedDPoints(selectModeDPoints: DPoint[]) {
    //TODO: CALL API HERE TO REMOVE CONSTRAINTS ON SELECT MODE DOINTS
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
    //TODO: CALL API HERE TO ADD CONSTRAINT TO MULTIPLE DPOINTS
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
    //TODO: call api here to remove dpoint from frameset and readjust frameConfig
  }

  function handleRemoveConstraint(dpoint: FramesetDpoint) {
    //TODO: call api here to remove constraint on dpoint and readjusted frameConfig
  }

  function handleAddNewConstraint(val: NewConstraint) {
    //TODO: CALL API HERE TO ADD NEW CONSTRAINT TO DPOINT
  }

  return isConfigOpen || !frameConfig ? (
    <FrameGeneratorConfig
      ruleTool={ruleTool}
      data={frameConfig}
      submitConfig={(data) => {
        setFrameConfig({
          ...data,
          framesets: {
            fsl: [
              {
                number: 1,
                framesets: {
                  Rotatory: {
                    dpoints: [
                      {
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
                        isBaseInstance: true,
                        error: 'Cannot work',
                      },
                      {
                        id: 'abcdw213',
                        name: 'ADN',
                        bits: 1,
                        tool: {
                          id: 'abcd123',
                          name: 'ADN',
                          version: 'V8.5bf8',
                          long: 'adnVISION 675',
                          type: ToolEnum.LWD,
                        },
                        isBaseInstance: true,
                      },
                    ],
                    frame: FrameEnum.ROT,
                  },
                  'Magnetic Tool Phase': {
                    dpoints: [
                      {
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
                        isBaseInstance: true,
                      },
                      {
                        id: 'abcdw213',
                        name: 'ADN',
                        bits: 1,
                        tool: {
                          id: 'abcd123',
                          name: 'ADN',
                          version: 'V8.5bf8',
                          long: 'adnVISION 675',
                          type: ToolEnum.LWD,
                        },
                        isBaseInstance: true,
                      },
                    ],
                    frame: FrameEnum.MTF,
                  },
                  'Gravitational Tool Phase': {
                    dpoints: [
                      {
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
                        isBaseInstance: true,
                      },
                      {
                        id: 'abcdw213',
                        name: 'ADN',
                        bits: 1,
                        tool: {
                          id: 'abcd123',
                          name: 'ADN',
                          version: 'V8.5bf8',
                          long: 'adnVISION 675',
                          type: ToolEnum.LWD,
                        },
                        isBaseInstance: true,
                      },
                    ],
                    frame: FrameEnum.GTF,
                  },
                },
              },
            ],
            utility: {
              dpoints: [
                {
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
                  isBaseInstance: true,
                },
                {
                  id: 'abcdw213',
                  name: 'ADN',
                  bits: 1,
                  tool: {
                    id: 'abcd123',
                    name: 'ADN',
                    version: 'V8.5bf8',
                    long: 'adnVISION 675',
                    type: ToolEnum.LWD,
                  },
                  isBaseInstance: true,
                },
              ],
              frame: FrameEnum.UTIL,
            },
          },
        });
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
  );
}
