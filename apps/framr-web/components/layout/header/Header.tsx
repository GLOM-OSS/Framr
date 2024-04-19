import { Icon } from "@iconify/react";
import { Autocomplete, Box, IconButton, InputAdornment, Switch, TextField, Typography } from "@mui/material";
import ChevronRight from "@iconify-icons/fluent/chevron-right-32-regular";
import SearchIcon from "@iconify-icons/fluent/search-32-regular";
import MoonIcon from "@iconify-icons/fluent/weather-moon-28-regular";
import SunIcon from "@iconify-icons/fluent/weather-sunny-32-regular";
import { Dispatch, SetStateAction } from "react";

interface HeaderProps {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>;
    setDrawerWidth: Dispatch<SetStateAction<number>>;
}
export default function Header({ open, setOpen, setDrawerWidth }: HeaderProps) {

    const handleOpenSlice = () => {
        setDrawerWidth(240)
        setOpen(true)
    }
    return (
        <Box sx={{
            position: 'relative',
            bgcolor: 'rgba(250, 250, 253, 1)',
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 80,
        }}>

            <IconButton sx={{
                boxShadow: '0px 8px 24px 4px rgba(24, 44, 75, 0.08)',
                bgcolor: 'rgba(255, 255, 255, 1)',
                position: 'absolute',
                left: 0,
                top: '21px',
                display: open ? 'none' : 'inherit'
            }}
                onClick={handleOpenSlice}
            >
                <Icon icon={ChevronRight} style={{ height: '15px', width: '15px' }} />
            </IconButton>
            <Box>
                <Typography sx={{
                    fontFamily: 'inter',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    paddingLeft: !open ? '40px' : '20px'
                }}>Configuration/tool/</Typography>
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
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                paddingRight: '10px'
            }}>
                <Icon icon={MoonIcon} />
                <Switch />
                <Icon icon={SunIcon} />
            </Box>
        </Box>
    );
}
