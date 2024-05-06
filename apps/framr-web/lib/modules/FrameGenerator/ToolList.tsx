import right from '@iconify/icons-fluent/chevron-right-20-regular';
import SearchIcon from '@iconify/icons-fluent/search-32-regular';
import square from '@iconify/icons-fluent/square-24-regular';
import { Icon } from '@iconify/react';
import {
    Box,
    Checkbox,
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { GeneratorConfig, IGeneratorConfigTool } from '../../types';

interface ToolListProps {
  data: GeneratorConfig;
}
export default function ToolList({ data: { MWDTool, tools } }: ToolListProps) {
  const toolList: IGeneratorConfigTool[] = [MWDTool, ...tools];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        height: '100%',
        border: '1px solid #D1D5DB',
        borderRight: 'none',
      }}
    >
      <TextField
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Icon icon={SearchIcon} fontSize={20} />
            </InputAdornment>
          ),
        }}
        placeholder="Search tool"
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
            borderBottom: '1px solid #D1D5DB',
            borderRadius: 0,
          },
        }}
      />
      <Scrollbars autoHide universal>
        {toolList.map(({ name }, index) => (
          <Box key={index}>
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
        ))}
      </Scrollbars>
    </Box>
  );
}
