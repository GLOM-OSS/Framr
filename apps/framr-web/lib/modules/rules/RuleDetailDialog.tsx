import up from '@iconify/icons-fluent/arrow-sort-up-24-regular';
import watch from '@iconify/icons-fluent/timer-24-regular';
import { Icon } from '@iconify/react';
import { Box, Button, Chip, Dialog, Divider, Typography } from '@mui/material';
import { DialogTransition } from '../../../components/sharedComponents/dialog-transition';
import {
  descriptionHasConstraint,
  descriptionHasOtherDpoints,
} from '../../../pages/configuration/tools/[toolId]/rules';
import { Rule, RuleWithConstraint, RuleWithOtherDPoint } from '../../types';
import {
  WithConstraintRuleEnum,
  WithOtherDPointRuleEnum,
} from '../../types/enums';

interface RuleDetailDialogProps {
  isDialogOpen: boolean;
  closeDialog: () => void;
  handleEdit: () => void;
  data: Rule;
}
export default function RuleDetailDialog({
  isDialogOpen,
  closeDialog,
  handleEdit,
  data,
}: RuleDetailDialogProps) {
  const close = () => {
    closeDialog();
  };

  const ruleHasOtherDpoints = descriptionHasOtherDpoints(data.description);
  const ruleHasConstraint = descriptionHasConstraint(data.description);

  return (
    <Dialog
      open={isDialogOpen}
      TransitionComponent={DialogTransition}
      keepMounted
      onClose={close}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 1.5,
        },
      }}
    >
      <Box sx={{ padding: { laptop: 2, mobile: 0 } }}>
        <Typography variant="h4">Rule Details</Typography>

        <Box sx={{ display: 'grid', rowGap: 2, paddingTop: '20px' }}>
          <Box sx={{ display: 'grid', rowGap: '20px' }}>
            <Box
              sx={{
                display: 'grid',
                rowGap: 2,
              }}
            >
              {data.name && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: '#6E6D7A',
                    }}
                  >
                    Custom rule name
                  </Typography>
                  <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                    {data.name}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#6E6D7A',
                  }}
                >
                  Rule
                </Typography>
                <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                  {data.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', rowGap: 0.5 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#6E6D7A',
                  }}
                >
                  Framesets
                </Typography>
                {data.framesets.length ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridAutoFlow: 'column',
                      alignItems: 'center',
                      justifyContent: 'start',
                      columnGap: 1,
                    }}
                  >
                    {data.framesets.map((frameset, key) => (
                      <Chip
                        key={key}
                        label={frameset}
                        size="small"
                        variant="outlined"
                        color="default"
                        sx={{
                          '& .MuiChip-label': {
                            fontWeight: 600,
                            fontSize: '12px',
                            color: '#2F3A45',
                          },
                          '&.MuiChip-root': {
                            border: '1px solid #2F3A45',
                          },
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: '#2F3A45',
                      fontStyle: 'italic',
                    }}
                  >
                    No Framesets
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider />

            <Box
              sx={{
                display: 'grid',
                rowGap: 2,
              }}
            >
              <Typography variant="caption">DPoints used in rule</Typography>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#6E6D7A',
                  }}
                >
                  Primary DPoint
                </Typography>
                <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                  {data.tool.name}
                </Typography>
              </Box>

              {ruleHasOtherDpoints && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: '#6E6D7A',
                    }}
                  >{`Secondary dpoint${
                    data.description ===
                    WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
                      ? 's'
                      : ''
                  }`}</Typography>
                  <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                    {(data as RuleWithOtherDPoint).otherDpoints
                      .map((dpoint) => dpoint.name)
                      .join(', ')}
                  </Typography>
                </Box>
              )}

              {ruleHasConstraint && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: '#6E6D7A',
                    }}
                  >
                    Constraint
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      justifyContent: 'start',
                      gridAutoFlow: 'column',
                      alignItems: 'center',
                      columnGap: 1,
                    }}
                  >
                    <Icon
                      icon={
                        data.description ===
                        WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
                          ? watch
                          : up
                      }
                    />
                    <Typography sx={{ fontWeight: 500, color: '#2F3A45' }}>
                      {`Every ${(data as RuleWithConstraint).interval} ${
                        data.description ===
                        WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
                          ? 'seconds'
                          : 'meters'
                      }`}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
          <Box
            py={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              justifyItems: 'end',
              borderTop: '1px solid #E0E0E0',
              columnGap: 4,
              padding: { laptop: '20px 0 0 0', mobile: 0 },
            }}
          >
            <Button variant="outlined" color="inherit" onClick={close}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleEdit}>
              Edit
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
