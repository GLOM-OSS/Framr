import { Box, Button, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import GeneratorHeader from '../lib/modules/FrameGenerator/GeneratorHeader';
import ToolList from '../lib/modules/FrameGenerator/ToolList';
import FrameGeneratorConfig from '../lib/modules/FrameGeneratorConfig/FrameGeneratorConfig';
import { DPoint, GeneratorConfig } from '../lib/types';

export default function FrameGenerator() {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [frameConfig, setFrameConfig] = useState<GeneratorConfig>();
  const [selectedDPoints, setSelectedDPoints] = useState<DPoint[]>([]);

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
        <Button onClick={() => setIsConfigOpen(true)}>Frame Generator</Button>
      </Box>
    </Box>
  );
}
