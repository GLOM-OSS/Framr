import ExternalLink from '@iconify/icons-fluent/open-32-regular';
import { Icon } from '@iconify/react';
import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        columnGap: 0.5,
      }}
    >
      <Typography>Powered by : </Typography>
      <Box
        component="a"
        href="#"
        target="_blank"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: 0.5,
          alignItems: 'center',
        }}
      >
        <Typography>GLOM</Typography>
        <Icon icon={ExternalLink} />
      </Box>
    </Box>
  );
}
