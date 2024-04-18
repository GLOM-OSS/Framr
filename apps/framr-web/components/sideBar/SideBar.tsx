import AppFolderIcon from "@iconify-icons/fluent/app-folder-32-regular";
import ChevronLeft from "@iconify-icons/fluent/chevron-left-32-regular";
import TableIcon from "@iconify-icons/fluent/table-32-regular";
import CommentIcon from "@iconify-icons/fluent/comment-20-regular";
import { Icon, IconifyIcon } from '@iconify/react';
import { Box, Divider, Drawer, IconButton, List, Typography } from "@mui/material";
import Image from "next/image";
import FullLogoFramr from "../../public/asset/fullLogoFram.png";
import ShortLogoFramr from "../../public/asset/shortLogoFrame.png";
import { useRouter } from "next/router";
import SideBarNavItem from "./SideBarNavIdem";
import { layoutProps } from "../layout";


export interface sideBarNav {
    item: string;
    route?: string;
    icon: IconifyIcon;
    title: string;
}

export default function SideBar({ drawerWidth, setDrawerWidth, open, setOpen }: layoutProps) {
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
    const handleSlide = (op: boolean) => {
        setOpen(op)
    }
    return (
        <Drawer variant="permanent" sx={{
            '.MuiPaper-root': {
                bgcolor: 'rgba(250, 250, 253, 1)',
                zIndex: 0,
                width: open ? drawerWidth : '80px',
                overflow: 'hidden',
                border: 'none'
            }
        }}>
            <Box sx={{
                padding: '10px 18px',
                position: 'relative',
                height: '100%',
            }}>
                <Box sx={{
                    display: 'flex',
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
                        width: 24,
                        height: 24,
                        padding: '4px',
                        position: 'absolute',
                        right: -1,
                    }}
                        onClick={() => handleSlide(!open)}
                    >
                        <Icon icon={ChevronLeft} style={{ height: 20, width: 20, rotate: !open ? '180deg' : undefined }} />
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
