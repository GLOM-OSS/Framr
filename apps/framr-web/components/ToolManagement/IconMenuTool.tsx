import { Icon, IconifyIcon } from "@iconify/react";
import { ListItemIcon, ListItemText, MenuItem, MenuList, MenuProps } from "@mui/material";

export interface iconMenuToolProps {
    icon: IconifyIcon
    text: string
    props?: MenuProps
    handleClick?: () => void
    open?: boolean
}

export default function IconMenuTool({ icon, text, props, handleClick, open }: iconMenuToolProps) {
    return (
        <MenuList>
            <MenuItem onClick={handleClick}>
                <ListItemIcon>
                    <Icon icon={icon} />
                </ListItemIcon>
                <ListItemText>{text}</ListItemText>
            </MenuItem>
        </MenuList>
    );
}
