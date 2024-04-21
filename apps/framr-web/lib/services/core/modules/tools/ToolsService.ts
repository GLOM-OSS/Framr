import { CreateTool, MWDTool } from '../../../../types';
import { ToolEnum } from '../../../../types/enums';
import { FramrServiceError } from '../../../libs/errors';
import {
  EventBus,
  EventBusChannelStatus,
  EventBusPayload,
} from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { FramrDBSchema, ToolRecord } from '../../db/schema';
import { ToolInterface, ToolsEventChannel } from './ToolInterface';

export class ToolsService implements ToolInterface {
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;
  private readonly STORE_NAME = 'tools';

  constructor() {
    this.database = IDBConnection.getDatabase();
    this.eventBus = new EventBus();
  }

  create(createTool: CreateTool): void {
    const channel = ToolsEventChannel.CREATE_TOOLS_CHANNEL;
    const newTool: ToolRecord = {
      value: {
        id: crypto.randomUUID(),
        ...(createTool.type === ToolEnum.MWD
          ? { ...(createTool as MWDTool), type: ToolEnum.MWD }
          : { ...createTool, type: ToolEnum.LWD }),
      },
    };

    this.database
      .insert(this.STORE_NAME, newTool)
      .then((response) => {
        this.eventBus.emit(channel, {
          data: { ...newTool!.value, id: response },
          status: EventBusChannelStatus.SUCCESS,
        });
      })
      .catch((error) => {
        this.eventBus.emit(channel, {
          data: new FramrServiceError(error.message),
          status: EventBusChannelStatus.ERROR,
        });
      });
  }

  findOne(index: string): void {
    const channel = ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL;

    this.database
      .findOne(this.STORE_NAME, index)
      .then((response) => {
        const payload: EventBusPayload<EventBusChannelStatus> = response
          ? { data: response.value, status: EventBusChannelStatus.SUCCESS }
          : {
              data: new FramrServiceError('Tool not found'),
              status: EventBusChannelStatus.ERROR,
            };
        this.eventBus.emit(channel, payload);
      })
      .catch((error) => {
        this.eventBus.emit(channel, {
          data: new FramrServiceError(error.message),
          status: EventBusChannelStatus.ERROR,
        });
      });
  }

  findAll(): void {
    const channel = ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL;
    this.database
      .findAll(this.STORE_NAME)
      .then((response) => {
        this.eventBus.emit(channel, {
          data: response.map((_) => _.value),
          status: EventBusChannelStatus.ERROR,
        });
      })
      .catch((error) => {
        this.eventBus.emit(channel, {
          data: new FramrServiceError(error.message),
          status: EventBusChannelStatus.ERROR,
        });
      });
  }

  update(index: string, createTool: CreateTool): void {
    const channel = ToolsEventChannel.UPDATE_TOLLS_CHANNEL;

    this.database
      .update(this.STORE_NAME, index, createTool)
      .then(() => {
        this.eventBus.emit(channel, {
          data: undefined,
          status: EventBusChannelStatus.SUCCESS,
        });
      })
      .catch((error) => {
        this.eventBus.emit(channel, {
          data: new FramrServiceError(error.message),
          status: EventBusChannelStatus.ERROR,
        });
      });
  }

  delete(index: string): void {
    const channel = ToolsEventChannel.DELETE_TOLLS_CHANNEL;

    this.database
      .delete(this.STORE_NAME, index)
      .then(() => {
        this.eventBus.emit(channel, {
          data: undefined,
          status: EventBusChannelStatus.SUCCESS,
        });
      })
      .catch((error) => {
        this.eventBus.emit(channel, {
          data: new FramrServiceError(error.message),
          status: EventBusChannelStatus.ERROR,
        });
      });
  }
}
