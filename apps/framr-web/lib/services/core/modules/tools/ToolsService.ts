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

  async findAll(): Promise<void> {
    let response = await this.database
      .findAll('tools')
      .then((result) => {
        this.eventBus.emit(ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL, {
          data: { ...result },
          status: EventBusChannelStatus.SUCCESS,
        });
      })
      .catch((error) => {
        this.eventBus.emit(ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL, {
          data: { name: 'error_get_tools', message: 'failure to get' },
          status: EventBusChannelStatus.ERROR,
        });
      });
  }

  async update(index: number, createTool: CreateTool): Promise<void> {
    let response = await this.database
      .update('tools', index, createTool)
      .then((result) => {
        this.eventBus.emit(ToolsEventChannel.UPDATE_TOLLS_CHANNEL, {
          data: { result },
          status: EventBusChannelStatus.SUCCESS,
        });
      })
      .catch((error) => {
        this.eventBus.emit(ToolsEventChannel.UPDATE_TOLLS_CHANNEL, {
          data: {
            name: 'error_update_tools',
            message: `fail to update tools ${{ ...createTool }}`,
          },
          status: EventBusChannelStatus.ERROR,
        });
      });
  }

  async delete(index: number): Promise<void> {
    await this.database
      .delete('tools', index)
      .then((result) => {
        this.eventBus.emit(ToolsEventChannel.DELETE_TOLLS_CHANNEL, {
          data: { id: index },
          status: EventBusChannelStatus.SUCCESS,
        });
      })
      .catch((error) => {
        this.eventBus.emit(ToolsEventChannel.DELETE_TOLLS_CHANNEL, {
          data: {
            name: 'error_delete_tools',
            message: `fail to delete tools ${index}`,
          },
          status: EventBusChannelStatus.ERROR,
        });
      });
  }
}
