import { Box, Button, Divider } from '@mui/material';
import { useState } from 'react';
import GeneratorHeader from '../lib/modules/FrameGenerator/GeneratorHeader';
import FrameGeneratorConfig from '../lib/modules/FrameGeneratorConfig/FrameGeneratorConfig';
import { GeneratorConfig } from '../lib/types';
import ToolList from '../lib/modules/FrameGenerator/ToolList';

export default function FrameGenerator() {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [frameConfig, setFrameConfig] = useState<GeneratorConfig>();
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
        <ToolList data={frameConfig} />
        <Divider orientation="vertical" />
        <Button onClick={() => setIsConfigOpen(true)}>Frame Generator</Button>
      </Box>
    </Box>
  );
}
