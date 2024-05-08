import SearchIcon from '@iconify/icons-fluent/search-32-regular';
import { Icon } from '@iconify/react';
import { Box, InputAdornment, TextField } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { DPoint, GeneratorConfig, IGeneratorConfigTool } from '../../types';
import Tool from './Tool';

interface ToolListProps {
  data: GeneratorConfig;
  getDPoints: (selectedDPoints: DPoint[]) => void;
}
export default function ToolList({
  data: { MWDTool, tools },
  getDPoints,
}: ToolListProps) {
  const toolList: IGeneratorConfigTool[] = [MWDTool, ...tools];
  const [selectedDPoints, setSelectedDPoints] = useState<DPoint[]>([]);

  useEffect(() => {
    getDPoints(selectedDPoints);
  }, [getDPoints, selectedDPoints]);
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
        {toolList.map((tool, index) => (
          <Tool
            key={index}
            tool={tool}
            getDPoints={(selectedDPoints, prevSelectedDPoints) =>
              setSelectedDPoints((prev) => {
                const tt = prev.filter((dpoint) => {
                  return !prevSelectedDPoints
                    .map(({ id }) => id)
                    .includes(dpoint.id);
                });

                return [...selectedDPoints, ...tt];
              })
            }
          />
        ))}
      </Scrollbars>
    </Box>
  );
}
