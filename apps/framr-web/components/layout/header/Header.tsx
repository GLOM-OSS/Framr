import SearchIcon from '@iconify/icons-fluent/search-32-regular';
import MoonIcon from '@iconify/icons-fluent/weather-moon-28-regular';
import SunIcon from '@iconify/icons-fluent/weather-sunny-32-regular';
import { Icon } from '@iconify/react';
import {
  Autocomplete,
  Box,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

export default function Header() {
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'rgba(250, 250, 253, 1)',
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 80,
      }}
    >
      <Box>
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
      </Box>
      <Autocomplete
        options={[]}
        sx={{
          width: 400,
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            variant="outlined"
            placeholder="Search Tools"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon={SearchIcon} />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          paddingRight: '10px',
        }}
      >
        <Icon icon={MoonIcon} />
        <Switch />
        <Icon icon={SunIcon} />
      </Box>
    </Box>
  );
}
