import { Icon, IconifyIcon } from "@iconify/react";
import { ListItemIcon, ListItemText, Menu, MenuItem, MenuList, MenuProps } from "@mui/material";

interface iconMenuToolProps {
    icon: IconifyIcon
    text: string
    props: MenuProps
}

export default function IconMenuTool({ icon, text, props }: iconMenuToolProps) {
    return (
        <Menu
            elevation={0}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: 6,
                    marginTop: '8px',
                    minWidth: 180,
                    color:
                        'rgb(55, 65, 81)',
                    boxShadow:
                        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                    '& .MuiMenu-list': {
                        padding: '4px 0',
                    },
                    '& .MuiMenuItem-root': {
                        '& .MuiSvgIcon-root': {
                            fontSize: 18,
                            marginRight: '12px',
                        },
                    },
                },
            }}
            {...props}
        >
            <MenuList>
                <MenuItem>
                    <ListItemIcon>
                        <Icon icon={icon} />
                    </ListItemIcon>
                    <ListItemText>{text}</ListItemText>
                </MenuItem>
            </MenuList>
        </Menu>
    );
}
