import { CreateTool, MWDTool } from '../../../../types';
import { ToolEnum } from '../../../../types/enums';
import { FramrServiceError } from '../../../libs/errors';
import { EventBus, EventBusChannelStatus } from '../../../libs/event-bus';
import { IDBFactory, StoreRecord } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { FramrDBSchema } from '../../db/schema';

import { ToolInterface, ToolsEventChannel } from './ToolInterface';

export class ToolsService implements ToolInterface {
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;

  constructor() {
    this.database = IDBConnection.getDatabase();
    this.eventBus = new EventBus();
  }

  create(createTool: CreateTool): void {
    let newTool: StoreRecord<FramrDBSchema, 'tools'> | null = null;
    let channel = ToolsEventChannel.CREATE_TOOLS_CHANNEL;

    if (createTool.type == ToolEnum.LWD) {
      newTool = {
        value: { ...createTool, id: crypto.randomUUID(), type: ToolEnum.LWD },
      };
    } else {
      newTool = {
        value: {
          ...(createTool as MWDTool),
          id: crypto.randomUUID(),
          type: ToolEnum.MWD,
        },
      };
    }

    this.database
      .insert('tools', newTool)
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

  findOne(index: number): void {
    let channel = ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL;

    this.database
      .findOne('tools', index)
      .then((response) => {
        this.eventBus.emit(channel, {
          data: { ...response },
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

  findAll(): void {
    let channel = ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL;
    this.database
      .findAll('tools')
      .then((result) => {
        this.eventBus.emit(channel, {
          data: { ...result },
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

  update(index: number, createTool: CreateTool): void {
    let channel = ToolsEventChannel.UPDATE_TOLLS_CHANNEL;

    this.database
      .update('tools', index, createTool)
      .then((result) => {
        this.eventBus.emit(channel, {
          data: { result },
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

  delete(index: number): void {
    let channel = ToolsEventChannel.DELETE_TOLLS_CHANNEL;

    this.database
      .delete('tools', index)
      .then(() => {
        this.eventBus.emit(channel, {
          data: { id: index },
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
