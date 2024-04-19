import { CreateDPoint } from 'apps/framr-web/lib/types';
import { FramrServiceError } from '../../../libs/errors';
import { EventBus, EventBusChannelStatus } from '../../../libs/event-bus';
import { IDBFactory, StoreRecord } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { DPointRecord, FramrDBSchema } from '../../db/schema';
import { DpointInterface, DpointsEventChannel } from './DpointInterface';

export class DpointsService implements DpointInterface {
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;
  private readonly STORE_NAME = 'dpoints';

  constructor() {
    this.database = IDBConnection.getDatabase();
    this.eventBus = new EventBus();
  }

  create(createDpoint: CreateDPoint): void {
    let newDpoint: DPointRecord = {
      value: {
        id: crypto.randomUUID(),
        ...createDpoint,
      },
    };

    let channel = DpointsEventChannel.CREATE_DPOINT_CHANNEL;

    this.database
      .insert(this.STORE_NAME, newDpoint)
      .then((response) => {
        this.eventBus.emit(channel, {
          data: { ...newDpoint!.value, id: response },
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
    let channel = DpointsEventChannel.FIND_ONE_DPOINT_CHANNEL;

    this.database
      .findOne(this.STORE_NAME, index)
      .then((response: DPointRecord | null) => {
        response
          ? this.eventBus.emit(channel, {
              data: { ...response },
              status: EventBusChannelStatus.SUCCESS,
            })
          : this.eventBus.emit(channel, {
              data: new FramrServiceError('Dpoint not found'),
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
    let channel = DpointsEventChannel.FIND_ALL_DPOINT_CHANNEL;
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
            data: new FramrServiceError('no dpoints found'),
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

  update(index: number, createDpoint: CreateDPoint): void {
    let channel = DpointsEventChannel.UPDATE_DPOINT_CHANNEL;

    this.database
      .update(this.STORE_NAME, index, createDpoint)
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
    let channel = DpointsEventChannel.DELETE_DPOINT_CHANNEL;

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
