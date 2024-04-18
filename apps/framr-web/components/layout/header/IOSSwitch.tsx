import { Switch, SwitchProps } from "@mui/material";

export default function IosSwitch(props: SwitchProps) {
    return (
        <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props}
            sx={{
                width: 42,
                height: 26,
                padding: 0,
                '& .MuiSwitch-switchBase': {
                    padding: 0,
                    margin: '2px',
                    transitionDuration: '300ms',
                    '&.Mui-checked': {
                        transform: 'translateX(16px)',
                        color: '#fff',
                        '& + .MuiSwitch-track': {
                            backgroundColor: '#65C466',
                            opacity: 1,
                            border: 0,
                        },
                        '&.Mui-disabled + .MuiSwitch-track': {
                            opacity: 0.5,
                        },
                    },
                    '&.Mui-focusVisible .MuiSwitch-thumb': {
                        color: '#33cf4d',
                        border: '6px solid #fff',
                    },
                    '&.Mui-disabled .MuiSwitch-thumb': {
                        color: 'rgba(47, 58, 69, 1)'
                    },
                    '&.Mui-disabled + .MuiSwitch-track': {
                        opacity: 0.7,
                    },
                },
                '& .MuiSwitch-thumb': {
                    boxSizing: 'border-box',
                    width: 22,
                    height: 22,
                },
                '& .MuiSwitch-track': {
                    borderRadius: 26 / 2,
                    backgroundColor: '#rgba(47, 58, 69, 1)',
                    opacity: 1,
                },
            }}
        />
    );
}

