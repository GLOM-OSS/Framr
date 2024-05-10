import { Box } from '@mui/material';
import { FSL, FSLFrameType, UtilityFrameset } from '../../../../types';
import { FrameEnum } from '../../../../types/enums';
import Frame from './Frame';
import Scrollbars from 'rc-scrollbars';

interface Frameset {
  fsl: FSL[];
  utility: UtilityFrameset;
}

interface FramesetListProps {
  frameset: Frameset;
  activeFSL: number;
  selectedFrames: FrameEnum[];
}
export default function FramesetList({
  frameset: { fsl, utility },
  selectedFrames,
  activeFSL,
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
                frame={activeFramesetFSL.framesets[framekey as FSLFrameType]}
              />
            </Scrollbars>
          ))}

      {selectedFrames.includes(FrameEnum.UTIL) && <Frame frame={utility} />}
    </Box>
  );
}
