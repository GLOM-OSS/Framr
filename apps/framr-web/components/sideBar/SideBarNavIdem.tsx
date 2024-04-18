import { Box, Typography } from "@mui/material";
import { Icon } from '@iconify/react';
import { sideBarNav } from "./SideBar";

interface NavItemProps {
    sideBarNav: sideBarNav;
    open: boolean;
}

export default function SideBarNavItem({ sideBarNav: { title, icon, item }, open }: NavItemProps) {
    return (
        <Box sx={{
            margin: '36px 0',
            display: 'grid',
            rowGap: '12px',
            justifyContent: !open ? 'center' : 'initial'
        }}>
            <Typography sx={{
                fontFamily: 'inter',
                fontWeight: 500,
                fontSize: '10px',
                letterSpacing: '5%',
                lineHeight: '10px',
                color: 'rgba(110, 109, 122, 1)',
                display: open ? 'inherit' : 'none'
            }}>{title}</Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: ' auto 1fr',
                columnGap: open ? '8px' : 0,
                alignItems: 'center',
                cursor: 'pointer',
                p: 1,
                borderRadius: '10px',
                '&:hover': {
                    bgcolor: 'rgba(235, 234, 237, 1)'
                },
            }}>
                <Icon icon={icon} fontSize={24} />
                <Typography sx={{
                    fontFamily: 'inter',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '14px',
                    color: 'rgba(110, 109, 122, 1)',
                    display: open ? 'inherit' : 'none'

                }}>{item}</Typography>
            </Box>
        </Box>

    );
}
