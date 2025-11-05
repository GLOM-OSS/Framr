import down from '@iconify/icons-fluent/chevron-down-20-regular';
import right from '@iconify/icons-fluent/chevron-right-20-regular';
import square from '@iconify/icons-fluent/square-24-regular';
import { Icon } from '@iconify/react';
import { Box, Checkbox, IconButton, Tooltip, Typography } from '@mui/material';

export function ToolCard({
  name,
  isOpen = false,
  isSelected,
  handleSelect,
  handleOpen,
}: {
  name: string;
  isOpen?: boolean;
  isSelected: boolean;
  handleSelect: () => void;
  handleOpen?: () => void;
}) {
  return (
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
        backgroundColor: handleOpen ? '#FDFDFD' : 'none',
        '&:hover': {
          backgroundColor: '#F3F4F6',
        },
      }}
      onClick={() => (handleOpen ? null : handleSelect())}
    >
      <Checkbox
        size="small"
        checked={isSelected}
        onChange={() => (handleOpen ? handleSelect() : null)}
        icon={<Icon icon={square} fontSize={20} color="#D1D5DB" />}
      />
      <Typography fontWeight={700} variant="body2">
        {name}
      </Typography>
      {handleOpen && (
        <Tooltip arrow title={isOpen ? 'Hide services' : 'Show services'}>
          <IconButton size="small" onClick={handleOpen}>
            <Icon icon={isOpen ? down : right} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
