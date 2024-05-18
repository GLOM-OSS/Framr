import more from '@iconify/icons-fluent/more-vertical-24-regular';
import signout from '@iconify/icons-fluent/sign-out-20-regular';
import { Icon } from '@iconify/react';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  OutlinedInput,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import ManageRulesDialog from '../../../lib/modules/FrameGeneratorConfig/ManageRulesDialog';
import MoreMenu from '../../../lib/modules/FrameGeneratorConfig/MoreMenu';
import {
  CreateGeneratorConfig,
  GeneratorConfig,
  GeneratorConfigRule,
  GeneratorConfigTool,
  LWDGeneratorConfigTool,
  LWDTool,
  MWDGeneratorConfigTool,
  MWDTool,
  Rule,
  Tool,
} from '../../../lib/types';
import { ToolEnum } from '../../../lib/types/enums';
import {
  FramrService,
  RulesEventChannel,
  RulesService,
  ToolsEventChannel,
  ToolsService,
} from '../../services';
import { EventBus, EventBusChannelStatus } from '../../services/libs/event-bus';

interface ICreateGeneratorConfig {
  bitRate: number;
  penetrationRate: number;
  wellName: string;
  jobName: string;
  MWDTool: string;
  tools: string[];
}

interface FrameGeneratorConfigProps {
  data?: GeneratorConfig;
  submitConfig: (data: GeneratorConfig) => void;
  ruleTool?: GeneratorConfigTool;
}
export default function FrameGeneratorConfig({
  data,
  submitConfig,
  ruleTool,
}: FrameGeneratorConfigProps) {
  const eventBus = new EventBus();
  const toolsService = new ToolsService();
  const [mwdTools, setMWDTools] = useState<MWDTool[]>([]);
  const [lwdTools, setLWDTools] = useState<LWDTool[]>([]);

  function fetchTools() {
    eventBus.once<Tool[]>(
      ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setMWDTools(data.filter((_) => _.type === ToolEnum.MWD) as MWDTool[]);
          setLWDTools(data.filter((_) => _.type === ToolEnum.LWD) as LWDTool[]);
        }
      }
    );
    toolsService.findAll();
  }

  const rulesService = new RulesService();
  const [rules, setRules] = useState<Rule[]>([]);
  function fetchRules() {
    eventBus.once<Rule[]>(
      RulesEventChannel.FIND_ALL_RULES_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setRules(data);
        }
      }
    );
    rulesService.findAll();
  }

  useEffect(() => {
    fetchRules();
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialValues: ICreateGeneratorConfig = {
    bitRate: data?.bitRate || 0,
    penetrationRate:
      (data?.penetrationRate ? data.penetrationRate * 3600 : undefined) || 0,
    wellName: data?.wellName || '',
    jobName: data?.jobName || '',
    MWDTool: data?.MWDTool.id || '',
    tools: data?.tools ? data.tools.map(({ id }) => id) : undefined || [],
  };

  const validationSchema = Yup.object().shape({
    wellName: Yup.string().optional(),
    jobName: Yup.string().required('Job name is required'),
    bitRate: Yup.number()
      .required('Bit rate is required')
      .min(1, 'Bitrate cannot be less than 1'),
    penetrationRate: Yup.number()
      .required('Penetration rate is required')
      .min(1, 'Penetration rate cannot be less than 1'),
    MWDTool: Yup.string()
      .oneOf(
        mwdTools.map(({ id }) => id),
        'Select a tool in list'
      )
      .required('MWD Tool is required'),
    tools: Yup.array()
      .of(
        Yup.string().oneOf(
          lwdTools.map(({ id }) => id),
          'Select a tool in list'
        )
      )
      .min(1, 'You must select at least an LWD tool')
      .required('At least one LWD tool is required'),
  });

  const [selectedLWDTools, setSelectedLWDTools] = useState<
    LWDGeneratorConfigTool[]
  >(data?.tools || []);
  const [selectedMWDTool, setSelectedMWDTool] = useState<
    MWDGeneratorConfigTool | undefined
  >(data?.MWDTool);

  const framrService = new FramrService();

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      /*
       cleanup data for submission.
       - convert penetrationRate to m/s
       - use mwd tool in right type (MWDGeneratorConfigTool)
       - use tools in right type (LWDGeneratorConfigTool)
      */
      const { jobName, wellName, bitRate, penetrationRate } = values;
      const submitData: CreateGeneratorConfig = {
        jobName,
        wellName,
        bitRate,
        penetrationRate: penetrationRate / 3600,
        MWDTool: selectedMWDTool as MWDGeneratorConfigTool,
        tools: selectedLWDTools,
      };

      submitConfig(framrService.initialize(submitData));
      setSelectedLWDTools([]);
      setSelectedMWDTool(undefined);
      resetForm();
    },
  });

  function computeGeneratorConfigTools(tools: Tool[]) {
    const newGeneratorConfigTools: GeneratorConfigTool[] = tools.map((tool) => {
      const configTool: GeneratorConfigTool = {
        ...tool,
        rules: rules
          .filter((_) => _.tool.id === tool.id)
          .map((rule) => {
            return { ...rule, isActive: true, isGeneric: true };
          }),
      };
      return configTool;
    });
    return newGeneratorConfigTools;
  }

  function removeTool(tool: Tool) {
    const newSelectedTools = selectedLWDTools.filter(
      (selectedTool) => selectedTool.id !== tool.id
    );
    setSelectedLWDTools(newSelectedTools);
    formik.setFieldValue(
      'tools',
      newSelectedTools.map(({ id }) => id)
    );
    setActiveTool(undefined);
  }

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeTool, setActiveTool] = useState<GeneratorConfigTool>();
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState<boolean>(false);

  const toolColumns: GridColDef<GeneratorConfigTool>[] = [
    { field: 'name', headerName: 'Tool Name', flex: 1 },
    {
      field: 'action',
      headerName: '',
      width: 50,
      renderCell: ({ row: tool }) => (
        <Tooltip title="More">
          <IconButton
            onClick={(event) => {
              setActiveTool(tool);
              setAnchorEl(event.currentTarget);
            }}
          >
            <Icon icon={more} fontSize={18} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  function handleSaveConfigRules(
    tool: GeneratorConfigTool,
    rules: GeneratorConfigRule[]
  ) {
    const newSelectedTools = selectedLWDTools.map((selectedTool) => {
      if (selectedTool.id === tool.id) {
        return { ...selectedTool, rules };
      }
      return selectedTool;
    });
    framrService.updateToolRules(tool.id, rules);
    setSelectedLWDTools(newSelectedTools);
    setActiveTool(undefined);
  }

  function handleLWDToolListChange(selectedTools: LWDTool[]) {
    //get tools for which we don't have rules yet
    const newTools = selectedTools.filter(
      (tool) => !selectedLWDTools.map(({ id }) => id).includes(tool.id)
    );
    //get tools whose rules we have already
    const oldTools = selectedLWDTools.filter(({ id }) =>
      selectedTools.map(({ id }) => id).includes(id)
    );

    setSelectedLWDTools([
      ...(computeGeneratorConfigTools(newTools) as LWDGeneratorConfigTool[]),
      ...oldTools,
    ]);
    formik.setFieldValue(
      'tools',
      selectedTools ? selectedTools.map(({ id }) => id) : null
    );
  }

  useEffect(() => {
    if (ruleTool) {
      setActiveTool(ruleTool);
      setIsRuleDialogOpen(true);
    }
  }, [ruleTool]);

  return (
    <>
      {activeTool && (
        <>
          <MoreMenu
            anchorEl={anchorEl}
            closeMenu={() => setAnchorEl(null)}
            handleManageRules={() => setIsRuleDialogOpen(true)}
            handleRemove={() => removeTool(activeTool)}
            isMenuOpen={!!anchorEl}
          />
          <ManageRulesDialog
            isDialogOpen={isRuleDialogOpen}
            closeDialog={() => setIsRuleDialogOpen(false)}
            rules={activeTool.rules}
            handleSave={(newRules: GeneratorConfigRule[]) =>
              handleSaveConfigRules(activeTool, newRules)
            }
          />
        </>
      )}
      <Box
        height="100%"
        sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}
      >
        <Typography variant="h3">Frame Generator</Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: 'grid', rowGap: 2 }}
        >
          <Box
            sx={{
              display: 'grid',
              rowGap: 1,
              gridTemplateRows: 'auto auto auto 1fr auto',
              padding: { laptop: '16px 40px 0 40px', mobile: 0 },
            }}
          >
            <Box sx={{ display: 'grid', gridAutoFlow: 'column', columnGap: 1 }}>
              <FormControl
                error={formik.touched.jobName && Boolean(formik.errors.jobName)}
              >
                <FormLabel>Name</FormLabel>
                <OutlinedInput
                  placeholder="Enter job name"
                  {...formik.getFieldProps('jobName')}
                  size="small"
                />
                <FormHelperText>
                  {formik.touched.jobName && formik.errors.jobName}
                </FormHelperText>
              </FormControl>

              <FormControl
                error={
                  formik.touched.wellName && Boolean(formik.errors.wellName)
                }
              >
                <FormLabel>Name</FormLabel>
                <OutlinedInput
                  placeholder="Enter well name"
                  {...formik.getFieldProps('wellName')}
                  size="small"
                />
                <FormHelperText>
                  {formik.touched.wellName && formik.errors.wellName}
                </FormHelperText>
              </FormControl>

              <Autocomplete
                options={mwdTools}
                autoHighlight
                size="small"
                getOptionLabel={({ name }) => name}
                onChange={(_, selectedMWDTool) => {
                  if (selectedMWDTool)
                    setSelectedMWDTool(
                      computeGeneratorConfigTools([
                        selectedMWDTool,
                      ])[0] as MWDGeneratorConfigTool
                    );
                  else setSelectedMWDTool(undefined);

                  formik.setFieldValue(
                    'MWDTool',
                    selectedMWDTool ? selectedMWDTool.id : null
                  );
                }}
                value={
                  mwdTools.find(({ id }) => id === formik.values.MWDTool) ??
                  null
                }
                renderInput={(params) => (
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.MWDTool && Boolean(formik.errors.MWDTool)
                    }
                  >
                    <FormLabel>Select MWDTool</FormLabel>
                    <TextField
                      {...params}
                      placeholder="Select MWDTool"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'autocomplete',
                      }}
                      error={
                        formik.touched.MWDTool && Boolean(formik.errors.MWDTool)
                      }
                      {...formik.getFieldProps('MWDTool')}
                    />
                    {formik.touched.MWDTool && formik.errors.MWDTool && (
                      <FormHelperText>{formik.errors.MWDTool}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Box sx={{ display: 'grid', gridAutoFlow: 'column', columnGap: 1 }}>
              <FormControl
                fullWidth
                error={formik.touched.bitRate && Boolean(formik.errors.bitRate)}
              >
                <FormLabel>Bitrate</FormLabel>
                <TextField
                  type="number"
                  size="small"
                  placeholder="Enter Bitrate"
                  error={
                    formik.touched.bitRate && Boolean(formik.errors.bitRate)
                  }
                  {...formik.getFieldProps('bitRate')}
                  InputProps={{
                    endAdornment: <Typography variant="body2">bps</Typography>,
                  }}
                />

                {formik.touched.bitRate && formik.errors.bitRate && (
                  <FormHelperText>{formik.errors.bitRate}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                error={
                  formik.touched.penetrationRate &&
                  Boolean(formik.errors.penetrationRate)
                }
              >
                <FormLabel>Rate of Penetration</FormLabel>
                <TextField
                  type="number"
                  size="small"
                  placeholder="Enter ROP"
                  error={
                    formik.touched.penetrationRate &&
                    Boolean(formik.errors.penetrationRate)
                  }
                  {...formik.getFieldProps('penetrationRate')}
                  InputProps={{
                    endAdornment: <Typography variant="body2">m/hr</Typography>,
                  }}
                />

                {formik.touched.penetrationRate &&
                  formik.errors.penetrationRate && (
                    <FormHelperText>
                      {formik.errors.penetrationRate}
                    </FormHelperText>
                  )}
              </FormControl>
            </Box>

            <Autocomplete
              multiple
              options={lwdTools}
              autoHighlight
              size="small"
              getOptionLabel={({ name }) => name}
              onChange={(_, selectedTools) =>
                handleLWDToolListChange(selectedTools)
              }
              value={lwdTools.filter(({ id }) =>
                formik.values.tools.includes(id)
              )}
              renderInput={(params) => (
                <FormControl
                  fullWidth
                  error={formik.touched.tools && Boolean(formik.errors.tools)}
                >
                  <FormLabel>Select LWD Tools</FormLabel>
                  <TextField
                    {...params}
                    placeholder="Select LWD Tools"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'autocomplete',
                    }}
                    error={formik.touched.tools && Boolean(formik.errors.tools)}
                    {...formik.getFieldProps('tools')}
                  />
                  {formik.touched.tools && formik.errors.tools && (
                    <FormHelperText>{formik.errors.tools}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Scrollbars universal autoHide>
              <DataGrid
                rows={[
                  ...(selectedMWDTool ? [selectedMWDTool] : []),
                  ...selectedLWDTools,
                ]}
                columns={toolColumns}
                hideFooter
                autoPageSize
                disableColumnMenu
                hideFooterSelectedRowCount
                sx={{
                  minHeight: '130px',
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
            </Scrollbars>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon icon={signout} color="white" />}
              type="submit"
              sx={{ justifySelf: 'center' }}
            >
              Go to Frame Generator
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
