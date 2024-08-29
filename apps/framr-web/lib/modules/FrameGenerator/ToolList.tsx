import SearchIcon from '@iconify/icons-fluent/search-32-regular';
import { Icon } from '@iconify/react';
import { Box, InputAdornment, TextField } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { DPoint, GeneratorConfig, GeneratorConfigTool } from '../../types';
import Tool from './Tool';
import { partition } from '../../services';
import { ToolEnum } from '../../types/enums';

interface ToolListProps {
  data: GeneratorConfig;
  getDPoints: (selectedDPoints: DPoint[]) => void;
}
export default function ToolList({
  data: { MWDTool, tools },
  getDPoints,
}: ToolListProps) {
  const toolList: GeneratorConfigTool[] = [MWDTool, ...tools];
  const [selectedDPoints, setSelectedDPoints] = useState<DPoint[]>([]);

  useEffect(() => {
    console.log('Tool list', selectedDPoints);
    const [mwdDPoints, lwdDPoints] = partition(
      selectedDPoints,
      (dpoint) => dpoint.tool.type === ToolEnum.MWD
    );
    getDPoints([...mwdDPoints, ...lwdDPoints]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDPoints]);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        height: '100%',
        border: '1px solid #D1D5DB',
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
