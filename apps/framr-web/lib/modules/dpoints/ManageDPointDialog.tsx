import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DialogTransition } from '../../../components/sharedComponents/dialog-transition';
import { CreateDPoint, DPoint, Tool } from '../../types';

interface ManageDPointDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  isSubmitting: boolean;
  handleCreate: (val: CreateDPoint) => void;
  handleEdit: (val: DPoint) => void;
  data?: DPoint;
  tool: Tool;
}
export default function ManageDPointDialog({
  isDialogOpen,
  closeDialog,
  isSubmitting,
  handleCreate,
  handleEdit,
  data,
  tool,
}: ManageDPointDialogProps) {
  const initialValues: CreateDPoint | DPoint = data ?? {
    id: '',
    name: '',
    bits: 1,
    tool: tool,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    bits: Yup.number()
      .required('Number of bits is required')
      .min(1, 'Number of bits must be greater than 0'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (data) handleEdit(values as DPoint);
      else handleCreate(values as CreateDPoint);
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
          {data ? 'Edit DPoint' : 'Create DPoint'}
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
              error={formik.touched.bits && Boolean(formik.errors.bits)}
            >
              <FormLabel>Number of bits</FormLabel>
              <OutlinedInput
                placeholder="Enter dpoint number of bits"
                {...formik.getFieldProps('bits')}
                disabled={isSubmitting}
                size="small"
              />
              <FormHelperText>
                {formik.touched.bits && formik.errors.bits}
              </FormHelperText>
            </FormControl>
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
              {data ? 'Save' : 'Create DPoint'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
