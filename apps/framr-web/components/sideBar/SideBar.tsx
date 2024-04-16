import AppFolderIcon from "@iconify-icons/fluent/app-folder-32-regular";
import ChevronLeft from "@iconify-icons/fluent/chevron-left-32-regular";
import ChevronRight from "@iconify-icons/fluent/chevron-right-32-regular";
import TableIcon from "@iconify-icons/fluent/table-32-regular";
import CommentIcon from "@iconify-icons/fluent/comment-20-regular";
import { Icon, IconifyIcon } from '@iconify/react';
import { Box, Divider, Drawer, IconButton, List, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import LogoFramr from "../../public/asset/fullLogoFram.png";
import { useRouter } from "next/router";
import SideBarNavItem from "./SideBarNavIdem";


export interface sideBarNav {
    item: string;
    route?: string;
    icon: IconifyIcon;
    title: string;
}

export default function SideBar() {
    const [open, setOpen] = useState<boolean>(true)
    const { push } = useRouter()

    const sideBarNav: sideBarNav[] = [
        {
            title: "GENERATOR",
            item: "Frame Generator",
            route: "/frameGenerator",
            icon: TableIcon
        },
        {
            title: "CONFIGURATION",
            item: "Tools",
            route: "/tools",
            icon: AppFolderIcon
        }
    ]
    return (
        <Drawer variant="permanent" open={open}>
            <Box sx={{
                width: 240,
                padding: '10px 18px',
                bgcolor: 'rgba(250, 250, 253, 1)',
                position: 'relative',
                height: '100%'
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <Image
                        onClick={() => push('/')}
                        src={LogoFramr}
                        alt="Framr Logo"
                        style={{ width: '72px', height: '34.63px', cursor: 'pointer' }}
                    />
                    <IconButton sx={{
                        boxShadow: '0px 15px 24px 2px rgba(24, 44, 75, 0.08)'
                    }}>
                        {open ? <Icon icon={ChevronLeft} style={{ height: '15px', width: '15px' }} /> :
                            <Icon icon={ChevronRight} style={{ height: '15px', width: '15px' }} />}
                    </IconButton>
                </Box>
                <Divider />
                <List>
                    {sideBarNav.map((navElements, index) => (
                        <SideBarNavItem sideBarNav={navElements} key={index} />
                    ))}
                </List>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: ' auto 1fr',
                    columnGap: '8px',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: 0
                }}>
                    <Icon icon={CommentIcon} fontSize={24} />
                    <Typography sx={{
                        fontFamily: 'inter',
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '14px',
                        color: 'rgba(110, 109, 122, 1)'

                    }}>Support</Typography>

                </Box>
            </Box>
        </Drawer>
    );
}
