import up from '@iconify/icons-fluent/arrow-sort-up-24-regular';
import watch from '@iconify/icons-fluent/timer-24-regular';
import { Icon } from '@iconify/react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { DialogTransition } from '../../../components/sharedComponents/dialog-transition';
import IOSSwitch from '../../../components/sharedComponents/iosSwitch';
import {
  CreateRule,
  CreateRuleWithOtherDPoint,
  DPoint,
  Rule,
  RuleWithConstraint,
  RuleWithOtherDPoint,
  Tool,
} from '../../types';
import { ConstraintEnum, FrameEnum, RuleEnum } from '../../types/enums';

export interface ICreateRule {
  name?: string;
  tool: Tool;
  concernedDpoint: string;
  description: RuleEnum;
  framesets: FrameEnum[];
  otherDpoints: string[];
  interval: number;
  type: ConstraintEnum;
}

interface ManageRuleDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  isSubmitting: boolean;
  handleCreate: (val: CreateRule) => void;
  handleEdit: (val: Rule) => void;
  data?: Rule;
  tool: Tool;
}
export default function ManageRuleDialog({
  isDialogOpen,
  closeDialog,
  isSubmitting,
  handleCreate,
  handleEdit,
  data,
  tool,
}: ManageRuleDialogProps) {
  const framesets = Object.values(FrameEnum);
  const descriptions = Object.values(RuleEnum);
  const constraintTypes = Object.values(ConstraintEnum);
  //TODO; replace this with a call to the API
  const [dPoints] = useState<DPoint[]>([
    {
      id: 'abcd123',
      name: 'ADN',
      bits: 1,
      tool: tool,
    },

    {
      id: 'abcdw213',
      name: 'ADN',
      bits: 1,
      tool: tool,
    },
  ]);

  function descriptionHasOtherDpoints(description: RuleEnum) {
    return (
      description !== RuleEnum.SHOULD_BE_PRESENT &&
      description !== RuleEnum.SHOULD_BE_THE_FIRST &&
      description !== RuleEnum.SHOULD_NOT_BE_PRESENT &&
      description !== RuleEnum.SHOULD_NOT_BE_THE_FIRST &&
      description !== RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT &&
      description !== RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
    );
  }

  function getSecondaryDPointsDisplayValue() {
    const tt = dPoints.filter((_) => formik.values.otherDpoints.includes(_.id));
    return formik.values.description === RuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
      ? tt
      : tt.length === 0
      ? null
      : tt[0];
  }

  const initialValues: ICreateRule = {
    name: '',
    tool: tool,
    concernedDpoint: dPoints[0].id,
    description: RuleEnum.SHOULD_BE_PRESENT,
    framesets: [],
    otherDpoints: [],
    interval: 0,
    type: ConstraintEnum.DISTANCE,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().optional(),
    concernedDpoint: Yup.string()
      .oneOf(dPoints.map((dpoint) => dpoint.id))
      .required('Please select a dpoint'),
    description: Yup.string()
      .oneOf(descriptions)
      .required('Please select a description'),
    framesets: Yup.array()
      .of(Yup.string().oneOf(framesets))
      .min(1, 'Rule is considered for atleast a frameset')
      .required('Please select a frameset'),

    type: Yup.string()
      .oneOf(constraintTypes)
      .when('description', {
        is: (val: RuleEnum) =>
          val === RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT ||
          val === RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
        then: (schema) => schema.required('Please select a constraint type'),
        otherwise: (schema) => schema.nullable(),
      }),
    interval: Yup.number().when('description', {
      is: (val: RuleEnum) =>
        val === RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT ||
        val === RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
      then: (schema) => schema.required('Please enter an interval'),
      otherwise: (schema) => schema.nullable(),
    }),

    otherDpoints: Yup.array()
      .of(Yup.string().oneOf(dPoints.map((dpoint) => dpoint.id)))
      .when('description', {
        is: (val: RuleEnum) => descriptionHasOtherDpoints(val),
        then: (schema) =>
          schema
            .min(1, 'Rule must have at least 1 secondary dpoint')
            .required('Rule must have at least a secondary dpoint'),
        otherwise: (schema) => schema.optional(),
      })
      .when('description', {
        is: (val: RuleEnum) => val === RuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY,
        then: (schema) =>
          schema.min(2, 'Rule must have at least 2 secondary dpoints'),
        otherwise: (schema) =>
          schema.max(1, 'Rule can have at most 1 secondary dpoint'),
      }),
  });

  const formik = useFormik({
    initialValues: data
      ? {
          ...data,
          concernedDpoint: data.concernedDpoint.id,
          ...(descriptionHasOtherDpoints(data.description)
            ? {
                otherDpoints: (data as RuleWithOtherDPoint).otherDpoints.map(
                  (_) => _.id
                ),
              }
            : { otherDpoints: [] }),
          ...(data.description ===
            RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT ||
          data.description ===
            RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
            ? {
                type: (data as RuleWithConstraint).type,
                interval: (data as RuleWithConstraint).interval,
              }
            : { type: ConstraintEnum.DISTANCE, interval: 0 }),
        }
      : initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      const concernedDpoint = dPoints.find(
        ({ id }) => id === values.concernedDpoint
      );
      const secondaryDPoints = (values as ICreateRule).otherDpoints.map((_) =>
        dPoints.find(({ id }) => id === _)
      );
      if (!concernedDpoint || secondaryDPoints.includes(undefined)) {
        //TODO: TOAST MESSAGE HERE
        alert(
          'An error occured getting some or all dpoints in rule (concerned and or secondary). Please restart'
        );
        resetForm();
        return;
      }

      if (descriptionHasOtherDpoints(values.description)) {
        if (data) {
          handleEdit({
            ...values,
            concernedDpoint,
            otherDpoints: secondaryDPoints as DPoint[],
          } as RuleWithOtherDPoint);
        } else
          handleCreate({
            ...values,
            concernedDpoint,
            otherDpoints: secondaryDPoints as DPoint[],
          } as CreateRuleWithOtherDPoint);
      } else {
        if (data) {
          handleEdit({ ...values, concernedDpoint, otherDpoints: [] } as Rule);
        } else {
          handleCreate({
            ...values,
            concernedDpoint,
            otherDpoints: [],
          } as CreateRule);
        }
      }
      resetForm();
      closeDialog();
    },
  });

  const close = () => {
    closeDialog();
    formik.resetForm();
  };

  const [ruleHasName, setRuleHasName] = useState<boolean>(false);
  useEffect(() => {
    if (isDialogOpen) setRuleHasName(!!data && !!data.name);
  }, [data, isDialogOpen]);

  return (
    <Dialog
      open={isDialogOpen}
      TransitionComponent={DialogTransition}
      keepMounted
      onClose={() => (isSubmitting ? null : close())}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 1.5,
        },
      }}
    >
      <Box sx={{ padding: { laptop: 2, mobile: 0 }, minWidth: '500px' }}>
        <Typography variant="h4">
          {data ? 'Edit Rule' : 'Create Rule'}
        </Typography>

        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: 'grid', rowGap: 2 }}
        >
          <Box
            sx={{
              display: 'grid',
              rowGap: 2,
              padding: { laptop: '20px 0 0 0', mobile: 0 },
            }}
          >
            <Box sx={{ display: 'grid', rowGap: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  justifyContent: 'start',
                  gridAutoFlow: 'column',
                  alignItems: 'center',
                  columnGap: 0.5,
                }}
              >
                <IOSSwitch
                  checked={ruleHasName}
                  size="small"
                  onChange={(event) => {
                    if (!event.target.checked) formik.setFieldValue('name', '');
                    setRuleHasName(event.target.checked);
                  }}
                />
                <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                  Custom Rule
                </Typography>
              </Box>
              <Collapse orientation="vertical" in={ruleHasName}>
                <FormControl
                  fullWidth
                  error={formik.touched.name && Boolean(formik.errors.name)}
                >
                  <FormLabel>Name</FormLabel>
                  <OutlinedInput
                    placeholder="Enter tool name"
                    {...formik.getFieldProps('name')}
                    disabled={isSubmitting}
                    size="small"
                  />
                  <FormHelperText>
                    {formik.touched.name && formik.errors.name}
                  </FormHelperText>
                </FormControl>
              </Collapse>
            </Box>

            <Autocomplete
              options={descriptions}
              autoHighlight
              size="small"
              getOptionLabel={(description) => description}
              onChange={(_, selectedDescription) => {
                formik.setFieldValue('otherDpoints', []);
                formik.setFieldValue('description', selectedDescription);
                if (
                  selectedDescription ===
                  RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT
                )
                  formik.setFieldValue('type', ConstraintEnum.DISTANCE);
                if (
                  selectedDescription ===
                  RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
                )
                  formik.setFieldValue('type', ConstraintEnum.TIME);
              }}
              value={formik.values.description}
              renderInput={(params) => (
                <FormControl
                  fullWidth
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                >
                  <FormLabel>Select Description</FormLabel>
                  <TextField
                    {...params}
                    placeholder="Select Description"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'autocomplete',
                    }}
                    error={
                      formik.touched.description &&
                      Boolean(formik.errors.description)
                    }
                    {...formik.getFieldProps('description')}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <FormHelperText>{formik.errors.description}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Autocomplete
              multiple
              options={framesets}
              autoHighlight
              size="small"
              getOptionLabel={(frameset) => frameset}
              onChange={(_, selectedFramesets) => {
                formik.setFieldValue('framesets', selectedFramesets);
              }}
              value={formik.values.framesets}
              renderInput={(params) => (
                <FormControl
                  fullWidth
                  error={
                    formik.touched.framesets && Boolean(formik.errors.framesets)
                  }
                >
                  <FormLabel>Select framesets</FormLabel>
                  <TextField
                    {...params}
                    placeholder="Select framesets"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'autocomplete',
                    }}
                    error={
                      formik.touched.framesets &&
                      Boolean(formik.errors.framesets)
                    }
                    {...formik.getFieldProps('framesets')}
                  />
                  {formik.touched.framesets && formik.errors.framesets && (
                    <FormHelperText>{formik.errors.framesets}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* <Autocomplete
              multiple
              options={dPoints}
              autoHighlight
              size="small"
              getOptionLabel={({ name }) => name}
              onChange={(_, selectedAccount) => {
                formik.setFieldValue(
                  'dpoints',
                  selectedAccount ? selectedAccount.map(({ id }) => id) : null
                );
              }}
              value={dPoints.filter((_) =>
                formik.values.dpoints.includes(_.id)
              )}
              renderInput={(params) => (
                <FormControl
                  fullWidth
                  error={
                    formik.touched.dpoints && Boolean(formik.errors.dpoints)
                  }
                >
                  <FormLabel>Select Dpoints</FormLabel>
                  <TextField
                    {...params}
                    placeholder="Select Dpoints"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'autocomplete',
                    }}
                    error={
                      formik.touched.dpoints && Boolean(formik.errors.dpoints)
                    }
                    {...formik.getFieldProps('dpoints')}
                  />
                  {formik.touched.dpoints && formik.errors.dpoints && (
                    <FormHelperText>{formik.errors.dpoints}</FormHelperText>
                  )}
                </FormControl>
              )}
            /> */}
          </Box>

          <Box
            py={2}
            sx={{
              display: 'grid',
              alignItems: 'center',
              borderTop: '1px solid #E0E0E0',
              rowGap: 2,
            }}
          >
            <Autocomplete
              options={dPoints}
              autoHighlight
              size="small"
              getOptionLabel={({ name }) => name}
              onChange={(_, selectedDPoint) => {
                formik.setFieldValue(
                  'concernedDpoint',
                  selectedDPoint ? selectedDPoint.id : null
                );
              }}
              value={dPoints.find((_) => formik.values.concernedDpoint) ?? null}
              renderInput={(params) => (
                <FormControl
                  fullWidth
                  error={
                    formik.touched.concernedDpoint &&
                    Boolean(formik.errors.concernedDpoint)
                  }
                >
                  <FormLabel>Select primary dpoint</FormLabel>
                  <TextField
                    {...params}
                    placeholder="Select primary dpoint"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'autocomplete',
                    }}
                    error={
                      formik.touched.concernedDpoint &&
                      Boolean(formik.errors.concernedDpoint)
                    }
                    {...formik.getFieldProps('concernedDpoint')}
                  />
                  {formik.touched.concernedDpoint &&
                    formik.errors.concernedDpoint && (
                      <FormHelperText>
                        {formik.errors.concernedDpoint}
                      </FormHelperText>
                    )}
                </FormControl>
              )}
            />

            {descriptionHasOtherDpoints(formik.values.description) && (
              <Autocomplete
                multiple={
                  formik.values.description ===
                  RuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
                }
                options={dPoints}
                autoHighlight
                size="small"
                getOptionLabel={({ name }) => name}
                onChange={(_, selectedDPoints) => {
                  if (
                    formik.values.description ===
                    RuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
                  )
                    formik.setFieldValue(
                      'otherDpoints',
                      (selectedDPoints as DPoint[]).map(({ id }) => id)
                    );
                  else
                    formik.setFieldValue(
                      'otherDpoints',
                      selectedDPoints ? [(selectedDPoints as DPoint).id] : []
                    );
                }}
                value={getSecondaryDPointsDisplayValue()}
                renderInput={(params) => (
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.otherDpoints &&
                      Boolean(formik.errors.otherDpoints)
                    }
                  >
                    <FormLabel>{`Select Secondary ${
                      formik.values.description ===
                      RuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
                        ? 'Dpoints'
                        : 'Dpoint'
                    }`}</FormLabel>
                    <TextField
                      {...params}
                      placeholder={`Select Secondary ${
                        formik.values.description ===
                        RuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
                          ? 'Dpoints'
                          : 'Dpoint'
                      }`}
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'autocomplete',
                      }}
                      error={
                        formik.touched.otherDpoints &&
                        Boolean(formik.errors.otherDpoints)
                      }
                      {...formik.getFieldProps('otherDpoints')}
                    />
                    {formik.touched.otherDpoints &&
                      formik.errors.otherDpoints && (
                        <FormHelperText>
                          {formik.errors.otherDpoints}
                        </FormHelperText>
                      )}
                  </FormControl>
                )}
              />
            )}

            {(formik.values.description ===
              RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT ||
              formik.values.description ===
                RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT) && (
              <FormControl
                fullWidth
                error={
                  formik.touched.interval && Boolean(formik.errors.interval)
                }
              >
                <FormLabel>
                  {formik.values.description ===
                  RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT
                    ? 'Add Distance Constraint'
                    : 'Add Time Constraint'}
                </FormLabel>
                <TextField
                  type="number"
                  size="small"
                  placeholder="Enter constraint"
                  error={
                    formik.touched.interval && Boolean(formik.errors.interval)
                  }
                  {...formik.getFieldProps('interval')}
                  InputProps={{
                    startAdornment: (
                      <Icon
                        icon={
                          formik.values.description ===
                          RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT
                            ? up
                            : watch
                        }
                        fontSize={20}
                        style={{ marginRight: '4px' }}
                      />
                    ),
                    endAdornment: (
                      <Typography variant="body2">
                        {formik.values.description ===
                        RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT
                          ? 'm'
                          : 's'}
                      </Typography>
                    ),
                  }}
                />

                {formik.touched.interval && formik.errors.interval && (
                  <FormHelperText>{formik.errors.interval}</FormHelperText>
                )}
              </FormControl>
            )}
          </Box>

          <Box
            py={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              justifyItems: 'end',
              borderTop: '1px solid #E0E0E0',
              padding: { laptop: '20px 0 0 0', mobile: 0 },
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting}
              endIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {data ? 'Save' : 'Create Rule'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
