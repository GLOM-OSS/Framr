import SearchIcon from '@iconify/icons-fluent/search-32-regular';
import MoonIcon from '@iconify/icons-fluent/weather-moon-28-filled';
import SunIcon from '@iconify/icons-fluent/weather-sunny-32-filled';
import { Icon } from '@iconify/react';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import IOSSwitch from '../../sharedComponents/iosSwitch';

export default function Header() {
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  return (
    <Box
      sx={{
        bgcolor: 'rgba(250, 250, 253, 1)',
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'inter',
          fontWeight: 500,
          fontSize: '12px',
          lineHeight: '16px',
          paddingLeft: '40px',
        }}
      >
        Configuration/tool/
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search Tools"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Icon icon={SearchIcon} />
            </InputAdornment>
          ),
        }}
      />
      <Box
        sx={{
          display: 'grid',
          alignItems: 'center',
          gridAutoFlow: 'column',
          columnGap: 1,
        }}
      >
        <IconButton size="small" onClick={() => setIsLightMode(false)}>
          <Icon
            icon={MoonIcon}
            fontSize={24}
            color={!isLightMode ? '#2F3A45' : '#D1D5DB'}
          />
        </IconButton>
        <IOSSwitch
          checked={isLightMode}
          onChange={(event) => setIsLightMode(event.target.checked)}
        />
        <IconButton size="small" onClick={() => setIsLightMode(true)}>
          <Icon
            icon={SunIcon}
            fontSize={24}
            color={isLightMode ? '#3B82F6' : '#D1D5DB'}
          />
        </IconButton>
      </Box>
    </Box>
  );
}
