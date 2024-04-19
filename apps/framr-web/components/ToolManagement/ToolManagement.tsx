import { Box, Button, IconButton, Menu, Typography } from "@mui/material";
import FilterIcon from "@iconify-icons/fluent/filter-28-regular";
import AttachIcon from "@iconify-icons/fluent/attach-20-regular";
import AddIcon from "@iconify-icons/fluent/add-28-regular";
import DotIcon from "@iconify-icons/mdi/dots-vertical";
import DeleteIcon from "@iconify-icons/fluent/delete-24-regular";
import { Icon } from "@iconify/react";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { LWDTool } from "apps/framr-web/lib/types";
import { ToolEnum } from "apps/framr-web/lib/types/enums";
import { useState } from "react";
import IconMenuTool, { iconMenuToolProps } from "./IconMenuTool";

const columns: GridColDef[] = [
    { field: 'name', headerName: 'Tools Name', width: 300 },
    { field: 'version', headerName: 'Version', width: 300 },
    { field: 'long', headerName: 'Long', width: 570 },
]
const dataTableGrid: LWDTool[] = [
    { id: 'abcd123', name: 'ADN', version: 'V8.5bf8', long: 'adnVISION 675', type: ToolEnum.LWD },
    { id: 'abcd132', name: 'ADN', version: 'V8.5bf8', long: 'adnVISION 675', type: ToolEnum.LWD },
    { id: 'abcd213', name: 'ADN', version: 'V8.5bf8', long: 'adnVISION 675', type: ToolEnum.LWD },
    { id: 'abcd231', name: 'ADN', version: 'V8.5bf8', long: 'adnVISION 675', type: ToolEnum.LWD },
    { id: 'abcd321', name: 'ADN', version: 'V8.5bf8', long: 'adnVISION 675', type: ToolEnum.LWD },
    { id: 'abcd312', name: 'ADN', version: 'V8.5bf8', long: 'adnVISION 675', type: ToolEnum.LWD },
]

export default function ToolManagement() {
    const [open, setOpen] = useState<boolean>(false)
    const actionColumns: GridColDef[] = [
        {
            field: 'action', headerName: '', width: 50,
            renderCell: (param: GridRenderCellParams) => (
                <IconButton onClick={handleClick} aria-haspopup aria-expanded>
                    <Icon icon={DotIcon} style={{ height: '14px', width: '14px' }} />
                </IconButton>
            )
        },
    ]
    const handleClick = () => {
        setOpen((open) => !open)
    }

    const elementsMenu: iconMenuToolProps[] = [
        { text: 'Manage Rules', icon: AddIcon },
        { text: 'Manage Data Point', icon: AddIcon },
        { text: 'Manage Services', icon: AddIcon },
        { text: 'Edit', icon: AddIcon },
        { text: 'Details', icon: DotIcon },
        { text: 'Delete', icon: DeleteIcon }
    ]
    return (
        <Box p={3}>
            <Typography variant="h3" sx={{
                fontFamily: 'inter',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '32px',
                paragraph: '10px',
                letter: '-1.75px'
            }}>Tool Management</Typography>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0'
            }}>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    columnGap: '10px'
                }}>
                    <Button variant="contained" disableElevation
                        sx={{
                            textTransform: 'none',
                            bgcolor: 'rgba(47, 58, 69, 1)',
                            minWidth: '45px',
                        }}>All</Button>
                    <Button variant="outlined" disableElevation startIcon={<Icon icon={FilterIcon} />}
                        sx={{
                            textTransform: 'none',
                            borderColor: 'rgba(55, 65, 81, 1)',
                            color: 'rgba(55, 65, 81, 1)'
                        }}>Filter</Button>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    columnGap: '10px'
                }}>
                    <Button variant="outlined" disableElevation startIcon={<Icon icon={AttachIcon} />}
                        sx={{
                            textTransform: 'none',
                            borderColor: 'rgba(55, 65, 81, 1)',
                            color: 'rgba(55, 65, 81, 1)'
                        }}>Import Tool</Button>
                    <Button variant="contained" disableElevation startIcon={<Icon icon={AddIcon} />}
                        sx={{ textTransform: 'none' }} >Create Tool</Button>
                </Box>
            </Box>
            <Box>
                <DataGrid
                    rows={dataTableGrid}
                    columns={columns.concat(actionColumns)}
                    autoHeight
                    disableColumnMenu
                    hideFooterSelectedRowCount
                    sx={{
                        '& .MuiDataGrid-container--top [role=row]': {
                            bgcolor: 'rgba(229, 231, 235, 1)',
                        },
                        '& .css-t89xny-MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 700,
                            fontSize: '12px',
                            lineHeight: '16px',
                        },
                    }}
                />

                <Menu
                    elevation={0}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    sx={{
                        '& .MuiPaper-root': {
                            borderRadius: '10px',
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
                            '& .css-h4y409-MuiList-root': {
                                padding: '4px 0'
                            }
                        },
                    }}
                    open={open}
                    onClose={handleClick}

                >
                    {elementsMenu.map(({ text, icon }, index) => (
                        <IconMenuTool key={index} text={text} icon={icon} handleClick={handleClick} />
                    ))}
                </Menu>
            </Box>
        </Box>
    );
}

