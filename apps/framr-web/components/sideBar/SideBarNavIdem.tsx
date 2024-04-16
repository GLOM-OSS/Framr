import { Box, Typography } from "@mui/material";
import { Icon } from '@iconify/react';
import { sideBarNav } from "./SideBar";

interface NavItemProps {
    sideBarNav: sideBarNav;
}

export default function SideBarNavItem({ sideBarNav: { title, icon, item } }: NavItemProps) {
    return (
        <Box sx={{
            margin: '36px 0',
            display: 'grid',
            rowGap: '12px'
        }}>
            <Typography sx={{
                fontFamily: 'inter',
                fontWeight: 500,
                fontSize: '10px',
                letterSpacing: '5%',
                lineHeight: '10px',
                color: 'rgba(110, 109, 122, 1)'
            }}>{title}</Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: ' auto 1fr',
                columnGap: '8px',
                alignItems: 'center'
            }}>
                <Icon icon={icon} fontSize={24} />
                <Typography sx={{
                    fontFamily: 'inter',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '14px',
                    color: 'rgba(110, 109, 122, 1)'

                }}>{item}</Typography>
            </Box>
        </Box>

    );
}
