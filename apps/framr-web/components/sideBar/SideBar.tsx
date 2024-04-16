import AppFolderIcon from "@iconify-icons/fluent/app-folder-32-regular";
import ChevronLeft from "@iconify-icons/fluent/chevron-left-32-regular";
import TableIcon from "@iconify-icons/fluent/table-32-regular";
import CommentIcon from "@iconify-icons/fluent/comment-20-regular";
import { Icon, IconifyIcon } from '@iconify/react';
import { Box, Divider, Drawer, IconButton, List, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import FullLogoFramr from "../../public/asset/fullLogoFram.png";
import ShortLogoFramr from "../../public/asset/shortLogoFrame.png";
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
    const theme = useTheme();

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
    const handleOpenSlide = () => {
        setOpen(false)
    }
    return (
        <Drawer variant="permanent" sx={{
            '.MuiPaper-root': {
                bgcolor: 'rgba(250, 250, 253, 1)',
                ...(open && {
                    width: 240,
                    overflowX: 'hidden',
                }),
                ...(!open && {
                    width: `calc(${theme.spacing(7)} + 1px)`,
                    overflowX: 'hidden',
                    transition: 'width 0.5s ease',
                }),
            }
        }}>
            <Box sx={{
                padding: open ? '10px 18px' : '10px',
                position: 'relative',
                height: '100%',
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: open ? 'space-between' : 'center',
                    alignItems: 'center',
                    marginBottom: '15px',
                }}>
                    {open ?
                        <Image
                            onClick={() => push('/')}
                            src={FullLogoFramr}
                            alt="Full Framr Logo"
                            style={{ width: '72px', height: '34.63px', cursor: 'pointer' }}
                        /> :
                        <Image
                            onClick={() => push('/')}
                            src={ShortLogoFramr}
                            alt="Short Framr Logo"
                            style={{ width: '30px', height: '32.63px', cursor: 'pointer' }}
                        />
                    }
                    <IconButton sx={{
                        boxShadow: '0px 8px 24px 4px rgba(24, 44, 75, 0.08)',
                        bgcolor: 'rgba(255, 255, 255, 1)',
                        display: open ? 'inherit' : 'none',
                    }}
                        onClick={handleOpenSlide}
                    >
                        <Icon icon={ChevronLeft} style={{ height: '15px', width: '15px' }} />
                    </IconButton>
                </Box>
                <Divider />
                <List>
                    {sideBarNav.map((navElements, index) => (
                        <SideBarNavItem sideBarNav={navElements} open={open} key={index} />
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
                        color: 'rgba(110, 109, 122, 1)',
                        display: open ? 'inherit' : 'none'

                    }}>Support</Typography>

                </Box>
            </Box>
        </Drawer>
    );
}
