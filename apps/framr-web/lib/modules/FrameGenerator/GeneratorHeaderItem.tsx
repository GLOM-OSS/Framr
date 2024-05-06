import { Box, Typography } from '@mui/material';

interface GeneratorHeaderItemProps {
  title: string;
  value?: string;
}
export default function GeneratorHeaderItem({
  title,
  value,
}: GeneratorHeaderItemProps) {
  return (
    <Box>
      <Typography color="#6E6D7A">{title}</Typography>
      <Typography fontStyle={!value ? 'italic' : 'normal'}>
        {value || 'N/A'}
      </Typography>
    </Box>
  );
}
