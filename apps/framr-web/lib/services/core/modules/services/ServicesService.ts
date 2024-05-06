import { CreateService } from '../../../../types';
import { FramrServiceError } from '../../../libs/errors';
import { EventBus, EventBusChannelStatus } from '../../../libs/event-bus';
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
        if (!response) {
          throw new Error('Service not found');
        }

        this.eventBus.emit(channel, {
          data: response.value,
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

  findAll(toolId?: string): void {
    const channel = ServicesEventChannel.FIND_ALL_SERVICES_CHANNEL;
    this.database
      .findAll(this.STORE_NAME)
      .then((response) => {
        let services = response.map((_) => _.value);

        if (toolId) {
          services = services.filter((_) => _.tool.id === toolId);
        }

        this.eventBus.emit(channel, {
          data: services,
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
