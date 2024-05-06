import edit from '@iconify/icons-fluent/edit-20-regular';
import { Icon } from '@iconify/react';
import { Box, Button } from '@mui/material';
import { GeneratorConfig } from '../../types';
import GeneratorHeaderItem from './GeneratorHeaderItem';

interface GeneratorHeaderProps {
  handleEdit: () => void;
  data: GeneratorConfig;
}
export default function GeneratorHeader({
  data,
  handleEdit,
}: GeneratorHeaderProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto',
        alignItems: 'end',
        columnGap: 1,
      }}
    >
      <GeneratorHeaderItem title="Job Name" value={data.jobName} />
      <GeneratorHeaderItem title="Well Name" value={data.wellName} />
      <GeneratorHeaderItem title="MWD Tool" value={data.MWDTool.name} />
      <GeneratorHeaderItem title="BPS" value={`${data.bitRate}bps`} />
      <GeneratorHeaderItem
        title="ROP"
        value={`${data.penetrationRate * 3600}m/h`}
      />
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<Icon icon={edit} />}
        onClick={handleEdit}
      >
        Edit
      </Button>
    </Box>
  );
}
