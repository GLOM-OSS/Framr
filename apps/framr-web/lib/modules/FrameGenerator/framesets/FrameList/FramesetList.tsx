import { Box } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import {
  FSL,
  FSLFrameType,
  FramesetDpoint,
  GeneratorConfig,
  Tool,
  UtilityFrameset,
} from '../../../../types';
import { FrameEnum } from '../../../../types/enums';
import Frame, { NewConstraint } from './Frame';

interface Frameset {
  fsl: FSL[];
  utility: UtilityFrameset;
}

interface FramesetListProps {
  frameset: Frameset;
  activeFSL: number;
  selectedFrames: FrameEnum[];
  manageRules: (val: Tool) => void;
  frameConfig: GeneratorConfig;
  handleAddNewConstraint: (val: NewConstraint) => void;
  handleRemoveConstraint: (val: FramesetDpoint, frame: FrameEnum) => void;
  handleRemoveDPoint: (val: FramesetDpoint) => void;
  isSelectMode: boolean;
  selectModeDPoints: FramesetDpoint[];
  handleSelect: (val: FramesetDpoint[]) => void;
}
export default function FramesetList({
  frameset: { fsl, utility },
  selectedFrames,
  activeFSL,
  manageRules,
  frameConfig,
  handleAddNewConstraint,
  handleRemoveDPoint,
  handleRemoveConstraint: handleRemoveconstraint,
  handleSelect,
  isSelectMode,
  selectModeDPoints,
}: FramesetListProps) {
  const activeFramesetFSL = fsl.find((f) => f.number === activeFSL);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${selectedFrames.length},1fr)`,
        columnGap: 2,
      }}
    >
      {activeFramesetFSL &&
        Object.keys(activeFramesetFSL.framesets)
          .filter((_) => selectedFrames.includes(_ as FrameEnum))
          .map((framekey, index) => (
            <Scrollbars universal autoHide key={index}>
              <Frame
                handleSelect={handleSelect}
                isSelectMode={isSelectMode}
                selectModeDPoints={selectModeDPoints}
                frameConfig={frameConfig}
                manageRules={manageRules}
                frame={activeFramesetFSL.framesets[framekey as FSLFrameType]}
                handleAddNewConstraint={handleAddNewConstraint}
                handleRemoveConstraint={(val) =>
                  handleRemoveconstraint(val, framekey as FrameEnum)
                }
                handleRemoveDPoint={handleRemoveDPoint}
              />
            </Scrollbars>
          ))}

      {selectedFrames.includes(FrameEnum.UTIL) && (
        <Frame
          handleSelect={handleSelect}
          isSelectMode={isSelectMode}
          selectModeDPoints={selectModeDPoints}
          frameConfig={frameConfig}
          manageRules={manageRules}
          frame={utility}
          handleAddNewConstraint={handleAddNewConstraint}
          handleRemoveConstraint={(val) =>
            handleRemoveconstraint(val, FrameEnum.UTIL)
          }
          handleRemoveDPoint={handleRemoveDPoint}
        />
      )}
    </Box>
  );
}
