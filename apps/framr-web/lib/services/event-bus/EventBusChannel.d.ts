import { Tool } from '../../types';
import { ToolManagementChannelEnum } from './EventBusChannel.enum';

export interface EventBusChannelPayload<Channel extends ToolManagementChannelEnum> {
  data: EventBusChannelData[Channel];
  status: EventBusChannelStatus;
}

interface EventBusChannelData {
  // event bus channel for tools management
  [ToolManagementChannelEnum.FIND_TOOLS]: Tool[];
  [ToolManagementChannelEnum.FIND_ONE_TOOL]: Tool;
  [ToolManagementChannelEnum.CREATE_TOOL]: Tool;
  [ToolManagementChannelEnum.UPDATE_TOOL]: undefined;
  [ToolManagementChannelEnum.DELETE_TOOL]: undefined;
}

interface EventBusHandler {
  (payload: EventBusChannelPayload<Channel>): void;
}
