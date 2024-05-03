import { CreateService } from 'apps/framr-web/lib/types';
import { FramrServiceError } from '../../../libs/errors';
import {
  EventBus,
  EventBusChannelStatus,
  EventBusPayload,
} from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { FramrDBSchema, ServiceRecord } from '../../db/schema';
import { ServiceInterface, ServicesEventChannel } from './ServiceInterface';


export class ServicesService implements ServiceInterface {
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;
  private readonly STORE_NAME = 'services';

  constructor() {
    this.database = IDBConnection.getDatabase();
    this.eventBus = new EventBus();
  }

  create(createService: CreateService): void {
    const channel = ServicesEventChannel.CREATE_SERVICES_CHANNEL;
    const newRule: ServiceRecord = {
      value: {
        id: crypto.randomUUID(),
        ...createService,
      },
    };

    this.database
      .insert(this.STORE_NAME, newRule)
      .then((response) => {
        this.eventBus.emit(channel, {
          data: { ...newRule!.value, id: response },
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
    const channel = ServicesEventChannel.FIND_ONE_SERVICES_CHANNEL;

    this.database
      .findOne(this.STORE_NAME, index)
      .then((response) => {
        const payload: EventBusPayload<EventBusChannelStatus> = response
          ? { data: response.value, status: EventBusChannelStatus.SUCCESS }
          : {
              data: new FramrServiceError('Service not found'),
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

  findAll(index?: string): void {
    const channel = ServicesEventChannel.FIND_ALL_SERVICES_CHANNEL;
    this.database
      .findAll(this.STORE_NAME)
      .then((response) => {
        response.find((item) => item.key === index)
        ? this.eventBus.emit(channel, {
          data: response.find((item) => item.key === index)?.value,
          status: EventBusChannelStatus.SUCCESS
        })
        : this.eventBus.emit(channel, {
          data: response.map((_) => _.value),
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

  update(index: string, createService: CreateService): void {
    const channel = ServicesEventChannel.UPDATE_SERVICES_CHANNEL;

    this.database
      .update(this.STORE_NAME, index, createService)
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
    const channel = ServicesEventChannel.DELETE_SERVICES_CHANNEL;

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
