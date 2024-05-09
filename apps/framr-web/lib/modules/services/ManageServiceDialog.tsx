import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
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
import { DPointsEventChannel, DPointsService } from '../../services';
import { EventBus, EventBusChannelStatus } from '../../services/libs/event-bus';
import { CreateService, DPoint, Service, Tool } from '../../types';

interface ICreateService {
  name: string;
  interact?: string;
  dpoints: string[];
  tool: Tool;
}

interface IService extends ICreateService {
  id: string;
}

interface ManageServiceDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  isSubmitting: boolean;
  handleCreate: (val: CreateService) => void;
  handleEdit: (val: Service) => void;
  data?: Service;
  tool: Tool;
}
export default function ManageServiceDialog({
  isDialogOpen,
  closeDialog,
  isSubmitting,
  handleCreate,
  handleEdit,
  data: service,
  tool,
}: ManageServiceDialogProps) {
  const [dPoints, setDPoints] = useState<DPoint[]>([]);

  const eventBus = new EventBus();

  const dpointsService = new DPointsService();
  function fetchDPoints(toolId: string) {
    eventBus.once<DPoint[]>(
      DPointsEventChannel.FIND_ALL_DPOINT_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setDPoints(data);
        }
      }
    );
    dpointsService.findAll({ toolId });
  }

  useEffect(() => {
    if (tool) fetchDPoints(tool.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool]);

  const initialValues: ICreateService | IService = service
    ? {
        ...service,
        dpoints: service.dpoints.map(({ id }) => id) ?? [],
        interact: service.interact ?? '',
        tool: tool,
      }
    : {
        id: '',
        name: '',
        interact: '',
        dpoints: [],
        tool: tool,
      };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    interact: Yup.string().optional(),
    dpoints: Yup.array()
      .of(
        Yup.string().oneOf(
          dPoints.map((dpoint) => dpoint.id),
          'Select dpoint in list'
        )
      )
      .min(1, 'Service must have at least a dpoint')
      .required('Service must have at least a dpoint'),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      const dpoints = dPoints.filter((_) => values.dpoints.includes(_.id));
      if (service) handleEdit({ ...values, dpoints } as Service);
      else handleCreate({ ...values, dpoints } as CreateService);
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
          {service ? 'Edit Service' : 'Create Service'}
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
              error={formik.touched.interact && Boolean(formik.errors.interact)}
            >
              <FormLabel>Interact</FormLabel>
              <OutlinedInput
                placeholder="Enter service interact"
                {...formik.getFieldProps('interact')}
                disabled={isSubmitting}
                size="small"
              />
              <FormHelperText>
                {formik.touched.interact && formik.errors.interact}
              </FormHelperText>
            </FormControl>

            <Autocomplete
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
            />
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
              {service ? 'Save' : 'Create Tool'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
