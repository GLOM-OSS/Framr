import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DialogTransition } from '../../../components/sharedComponents/dialog-transition';
import { CreateTool, ITool } from '../../types';
import { ToolEnum } from '../../types/enums';

interface ManageToolDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  isSubmitting: boolean;
  handleCreate: (val: CreateTool) => void;
  handleEdit: (val: ITool) => void;
  data?: ITool;
}
export default function ManageToolDialog({
  isDialogOpen,
  closeDialog,
  isSubmitting,
  handleCreate,
  handleEdit,
  data,
}: ManageToolDialogProps) {
  const initialValues: CreateTool | ITool = data ?? {
    id: '',
    name: '',
    version: '',
    long: '',
    type: ToolEnum.LWD,
    max_bits: 1,
    max_dpoints: 1,
  };

  const validationSchema = Yup.object().shape({
    id: Yup.string().optional(),
    name: Yup.string().required('Name is required'),
    version: Yup.string().required('Version is required'),
    long: Yup.string().required('Long is required'),
    type: Yup.mixed<ToolEnum>()
      .oneOf(Object.values(ToolEnum))
      .required('Type is required'),
    max_bits: Yup.number()
      .min(1, 'Max bits must be greater than 0')
      .when('type', (type, schema) => {
        return (type as unknown) === ToolEnum.MWD
          ? schema.required('Max bits is required')
          : schema.optional();
      }),
    max_dpoints: Yup.number()
      .min(1, 'Max dpoints must be greater than 0')
      .when('type', (type, schema) => {
        return (type as unknown) === ToolEnum.MWD
          ? schema.required('Max dpoints is required')
          : schema.optional();
      }),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (data) handleEdit(values as ITool);
      else handleCreate(values as CreateTool);
      resetForm();
      closeDialog();
    },
  });

  const close = () => {
    closeDialog();
    formik.resetForm();
  };

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
      <Box sx={{ padding: { laptop: '16px 0', mobile: 0 } }}>
        <Typography
          variant="h4"
          sx={{ padding: { laptop: '0 40px', mobile: 0 } }}
        >
          {data ? 'Edit Tool' : 'Create Tool'}
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
              padding: { laptop: '16px 40px 0 40px', mobile: 0 },
            }}
          >
            <FormControl
              error={formik.touched.name && Boolean(formik.errors.name)}
            >
              <FormLabel>Choose tool type</FormLabel>
              <RadioGroup
                row
                defaultValue={ToolEnum.LWD}
                {...formik.getFieldProps('type')}
              >
                {Object.values(ToolEnum).map((tool) => (
                  <FormControlLabel
                    key={tool}
                    value={tool}
                    control={<Radio />}
                    label={tool}
                  />
                ))}
              </RadioGroup>
              <FormHelperText>
                {formik.touched.name && formik.errors.name}
              </FormHelperText>
            </FormControl>

            <FormControl
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
            <FormControl
              error={formik.touched.version && Boolean(formik.errors.version)}
            >
              <FormLabel>Version</FormLabel>
              <OutlinedInput
                placeholder="Enter tool version"
                {...formik.getFieldProps('version')}
                disabled={isSubmitting}
                size="small"
              />
              <FormHelperText>
                {formik.touched.version && formik.errors.version}
              </FormHelperText>
            </FormControl>

            <FormControl
              error={formik.touched.long && Boolean(formik.errors.long)}
            >
              <FormLabel>Long</FormLabel>
              <OutlinedInput
                placeholder="Enter tool long"
                {...formik.getFieldProps('long')}
                disabled={isSubmitting}
                size="small"
              />
              <FormHelperText>
                {formik.touched.long && formik.errors.long}
              </FormHelperText>
            </FormControl>

            {formik.values.type === ToolEnum.MWD && (
              <>
                <FormControl
                  error={
                    formik.touched.max_dpoints &&
                    Boolean(formik.errors.max_dpoints)
                  }
                >
                  <FormLabel>Max Dpoints</FormLabel>
                  <OutlinedInput
                    type="number"
                    inputProps={{ min: 1 }}
                    placeholder="Enter tool max dpoints"
                    {...formik.getFieldProps('max_dpoints')}
                    disabled={isSubmitting}
                    size="small"
                  />
                  <FormHelperText>
                    {formik.touched.max_dpoints && formik.errors.max_dpoints}
                  </FormHelperText>
                </FormControl>
                <FormControl
                  error={
                    formik.touched.max_bits && Boolean(formik.errors.max_bits)
                  }
                >
                  <FormLabel>Max bits</FormLabel>
                  <OutlinedInput
                    type="number"
                    inputProps={{ min: 1 }}
                    placeholder="Enter tool max bits"
                    {...formik.getFieldProps('max_bits')}
                    disabled={isSubmitting}
                    size="small"
                  />
                  <FormHelperText>
                    {formik.touched.max_bits && formik.errors.max_bits}
                  </FormHelperText>
                </FormControl>
              </>
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
              padding: { laptop: '16px 40px 0 40px', mobile: 0 },
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
              {data ? 'Save' : 'Create Tool'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
