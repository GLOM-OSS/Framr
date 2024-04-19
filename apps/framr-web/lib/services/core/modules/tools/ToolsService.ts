import { CreateTool, MWDTool } from '../../../../types';
import { ToolEnum } from '../../../../types/enums';
import { FramrServiceError } from '../../../libs/errors';
import { EventBus, EventBusChannelStatus } from '../../../libs/event-bus';
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
    let newTool: ToolRecord = {
      value: {
        id: crypto.randomUUID(),
        ...(createTool.type === ToolEnum.MWD
          ? { ...(createTool as MWDTool), type: ToolEnum.MWD }
          : { ...createTool, type: ToolEnum.LWD }),
      },
    };

    let channel = ToolsEventChannel.CREATE_TOOLS_CHANNEL;

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

  findOne(index: number): void {
    let channel = ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL;

    this.database
      .findOne(this.STORE_NAME, index)
      .then((response: ToolRecord | null) => {
        response
          ? this.eventBus.emit(channel, {
              data: { ...response },
              status: EventBusChannelStatus.SUCCESS,
            })
          : this.eventBus.emit(channel, {
              data: new FramrServiceError('Tool not found'),
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

  findAll(): void {
    let channel = ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL;
    this.database
      .findAll(this.STORE_NAME)
      .then((response) => {
        if (
          Array.isArray(response) &&
          response.every((item) => 'id' in item.value)
        ) {
          this.eventBus.emit(channel, {
            data: response,
            status: EventBusChannelStatus.SUCCESS,
          });
        } else {
          this.eventBus.emit(channel, {
            data: new FramrServiceError('no tools found'),
            status: EventBusChannelStatus.ERROR,
          });
        }
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

  delete(index: number): void {
    let channel = ToolsEventChannel.DELETE_TOLLS_CHANNEL;

    this.database
      .delete(this.STORE_NAME, index)
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
