import { FramrServiceError } from '../errors';
import { EventBusChannelStatus } from './EventBusEnum';

type EventBusDataMap = {
  [EventBusChannelStatus.SUCCESS]: unknown;
  [EventBusChannelStatus.ERROR]: FramrServiceError;
};

export interface EventBusPayload<Status extends EventBusChannelStatus> {
  data: EventBusDataMap[Status];
  status: Status;
}

interface EventBusHandler<Status extends EventBusChannelStatus> {
  (payload: EventBusPayload<Status>): void;
}
