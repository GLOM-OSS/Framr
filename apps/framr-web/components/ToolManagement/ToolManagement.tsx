import { Box, Button, Typography } from "@mui/material";
import FilterIcon from "@iconify-icons/fluent/filter-28-regular";
import AttachIcon from "@iconify-icons/fluent/attach-20-regular";
import AddIcon from "@iconify-icons/fluent/add-28-regular";
import { Icon } from "@iconify/react";


export default function ToolManagement() {
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
        </Box>
    );
}
