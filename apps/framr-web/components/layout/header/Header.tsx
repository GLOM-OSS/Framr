import { Icon } from "@iconify/react";
import { Autocomplete, Box, InputAdornment, TextField, Typography } from "@mui/material";
import SearchIcon from "@iconify-icons/fluent/search-32-regular";
import MoonIcon from "@iconify-icons/fluent/weather-moon-28-regular";
import SunIcon from "@iconify-icons/fluent/weather-sunny-32-regular";
import { Dispatch, SetStateAction, useState } from "react";
import IosSwitch from "./IOSSwitch";

interface HeaderProps {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>;
    setDrawerWidth: Dispatch<SetStateAction<number>>;
}
export default function Header({ open, setOpen, setDrawerWidth }: HeaderProps) {
    const [active, setActive] = useState<boolean>(false)
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setActive(event.target.checked);
    };
    return (
        <Box sx={{
            position: 'relative',
            bgcolor: 'rgba(250, 250, 253, 1)',
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 60,
            marginLeft: '240px'
        }}>

            <Box>
                <Typography sx={{
                    fontFamily: 'inter',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    paddingLeft: '20px',
                }}>Configuration/tool/</Typography>
            </Box>
            <Autocomplete
                options={[]}
                sx={{
                    width: 487,
                    '& .MuiInputBase-root': {
                        height: 40
                    },
                    '& .MuiInputBase-input': {
                        boxSizing: 'border-box'
                    }
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
                                    <Icon icon={SearchIcon} style={{ height: '24px', width: '24px' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            />
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: '3px',
                alignItems: 'center',
                paddingRight: '20px'
            }}>
                <Icon icon={MoonIcon} color={active ? 'rgba(209, 213, 219, 1)' : 'initial'} />
                <IosSwitch sx={{ m: 1 }} defaultChecked checked={active} onChange={handleChange} />
                <Icon icon={SunIcon} color={!active ? 'rgba(209, 213, 219, 1)' : 'initial'} />
            </Box>
        </Box>
    );
}
