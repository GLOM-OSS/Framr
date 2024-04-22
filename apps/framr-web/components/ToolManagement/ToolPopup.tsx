import { Box, Button, Divider, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { ToolEnum } from "../../lib/types/enums";
import { theme } from "../../lib/theme";

interface formRadioLabel {
    label: string;
    element: JSX.Element;
}

interface formTool {
    title: string;
    placeholder: string
}

export default function ToolDialog() {

    const formRadioLabelData: formRadioLabel[] = [
        {
            label: ToolEnum.MWD,
            element: <Radio size="small" />
        },
        {
            label: "DD",
            element: <Radio size="small" />
        },
        {
            label: ToolEnum.LWD,
            element: <Radio size="small" />
        },
    ]
    const formToolInputData: formTool[] = [
        {
            title: 'Name',
            placeholder: 'Enter name',
        },
        {
            title: 'Version',
            placeholder: 'Enter version',
        },
        {
            title: 'Long',
            placeholder: 'Enter long',
        },
        {
            title: 'Max Number of bits',
            placeholder: 'Enter number of bits',
        },
        {
            title: 'Max Number of DPoint',
            placeholder: 'Enter number of DPoint',
        },
    ]
    return (
        <>
            <Box component={'h5'} sx={{
                padding: '16px 16px 0 16px'
            }}>Create Tool</Box>
            <Box sx={{
                padding: '0 16px 0 16px'
            }}>
                <Typography sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px'
                }}>Choose tool type</Typography>
                <FormControl sx={{
                    width: '100%',
                    '& .MuiRadioGroup-root': {
                        display: 'grid',
                        gridAutoFlow: 'column',
                        justifyContent: 'space-between',
                    },
                    '& .MuiFormControlLabel-label': {
                        fontWeight: 700,
                        fontSize: 12,
                        lineHeight: '16px'
                    },

                }}>
                    <RadioGroup row defaultValue={formRadioLabelData[0].label}>
                        {formRadioLabelData.map(({ label, element }, index) => (
                            <FormControlLabel key={index} value={label} control={element} label={label} />
                        ))}
                    </RadioGroup>
                </FormControl>
                <Box sx={{
                    display: 'grid',
                    rowGap: 1
                }}>
                    {formToolInputData.map(({ title, placeholder }, index) => (
                        <Box key={index} sx={{
                            display: 'grid',
                            rowGap: 0.5
                        }}>
                            <Typography sx={{
                                fontWeight: 500,
                                fontSize: 14,
                                lineHeight: '20px'
                            }}>{title}</Typography>
                            <TextField placeholder={placeholder} variant="outlined" size="small" fullWidth={true} sx={{
                                '& .MuiInputBase-input': {
                                    backgroundColor: theme.common.inputBackground
                                }
                            }} />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box>
                <Divider />
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 2
                }}>
                    <Button variant="outlined" color="inherit">Cancel</Button>
                    <Button variant="contained">Save</Button>
                </Box>
            </Box>
        </>
    );
}
