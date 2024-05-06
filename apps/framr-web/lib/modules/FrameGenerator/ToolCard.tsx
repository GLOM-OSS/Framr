import right from '@iconify/icons-fluent/chevron-right-20-regular';
import square from '@iconify/icons-fluent/square-24-regular';
import { Icon } from '@iconify/react';
import { Box, Checkbox, IconButton, Tooltip, Typography } from '@mui/material';

interface ToolCardProps {
  name: string;
  isSelected: boolean;
  handleSelect: () => void;
}
export default function ToolCard({ name }: ToolCardProps) {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          columnGap: 0.5,
          alignItems: 'center',
          cursor: 'pointer',
          borderRadius: 0.5,
          p: 0.5,
          borderBottom: '1px solid #D1D5DB',
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
        }}
      >
        <Checkbox
          size="small"
          icon={<Icon icon={square} fontSize={22} color="#D1D5DB" />}
        />
        <Typography fontWeight={700} variant="body2">
          {name}
        </Typography>
        <Tooltip arrow title={'show services'}>
          <IconButton size="small">
            <Icon icon={right} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
