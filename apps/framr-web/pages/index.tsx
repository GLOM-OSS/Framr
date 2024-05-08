import download from '@iconify/icons-fluent/arrow-download-20-regular';
import { Icon } from '@iconify/react';
import { Box, Button, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import GeneratorHeader from '../lib/modules/FrameGenerator/GeneratorHeader';
import ToolList from '../lib/modules/FrameGenerator/ToolList';
import FramesetHeader from '../lib/modules/FrameGenerator/framesets/FramesetHeader';
import FramesetList from '../lib/modules/FrameGenerator/framesets/FramesetList';
import FrameGeneratorConfig from '../lib/modules/FrameGeneratorConfig/FrameGeneratorConfig';
import { DPoint, GeneratorConfig } from '../lib/types';
import { FrameEnum } from '../lib/types/enums';

export default function FrameGenerator() {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [frameConfig, setFrameConfig] = useState<GeneratorConfig>();
  const [selectedDPoints, setSelectedDPoints] = useState<DPoint[]>([]);
  const [activeFSL, setActiveFSL] = useState<number>(1);
  const [selectedFrames, setSelectedFrames] = useState<FrameEnum[]>([]);

  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

  useEffect(() => {
    /*TODO: CALL API HERE THAT SORTS SELECTED DPOINTS
    AND RETURNS THEM BY ORDER OF PRIORITY PER FRAMESETS
    THEN SET DATAIN FRAMESETS IN frameConfig
    */
    console.log(selectedDPoints);
  }, [selectedDPoints]);
  return isConfigOpen || !frameConfig ? (
    <FrameGeneratorConfig
      data={frameConfig}
      submitConfig={(data) => {
        setFrameConfig(data);
        setIsConfigOpen(false);
      }}
    />
  ) : (
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
        }}
      >
        <ToolList
          data={frameConfig}
          getDPoints={(selectedDPoints) => setSelectedDPoints(selectedDPoints)}
        />
        <Divider orientation="vertical" />
        <Box sx={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
          <FramesetHeader
            activeFSL={activeFSL}
            selectedFrames={selectedFrames}
            setActiveFSL={setActiveFSL}
            setSelectedFrames={setSelectedFrames}
            isSelectMode={isSelectMode}
            setIsSelectMode={setIsSelectMode}
            submitNewDPoint={(val) =>
              setSelectedDPoints((prev) => [...prev, val])
            }
            handleRemoveConstraints={() => alert('can remove constraints')}
            handleRemoveDPoints={() => alert('Remove selected dpoints')}
          />
          <FramesetList />
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
  );
}
