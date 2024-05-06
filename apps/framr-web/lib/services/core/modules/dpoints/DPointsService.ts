import { CreateDPoint, DPoint } from 'apps/framr-web/lib/types';
import { FramrServiceError } from '../../../libs/errors';
import {
  EventBus,
  EventBusChannelStatus,
  EventBusPayload,
} from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { DPointRecord, FramrDBSchema, ServiceRecord } from '../../db/schema';
import { DPointInterface, DPointsEventChannel } from './DPointInterface';

export class DPointsService implements DPointInterface {
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;
  private readonly STORE_NAME = 'dpoints';

  constructor() {
    this.database = IDBConnection.getDatabase();
    this.eventBus = new EventBus();
  }

  create(createDpoint: CreateDPoint): void {
    const channel = DPointsEventChannel.CREATE_DPOINT_CHANNEL;
    const newDpoint: DPointRecord = {
      value: {
        id: crypto.randomUUID(),
        ...createDpoint,
      },
    };

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

  findOne(index: string): void {
    const channel = DPointsEventChannel.FIND_ONE_DPOINT_CHANNEL;

    this.database
      .findOne(this.STORE_NAME, index)
      .then((response) => {
        const payload: EventBusPayload<EventBusChannelStatus> = response
          ? { data: response.value, status: EventBusChannelStatus.SUCCESS }
          : {
              data: new FramrServiceError('Dpoint not found'),
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

  findAll(toolId?: string, serviceId?: string): void {
    const channel = DPointsEventChannel.FIND_ALL_DPOINT_CHANNEL;
    this.database
      .findAll(this.STORE_NAME)
      .then((response) => {
        let filteredResponse = null;
        let filteredToolIdResponse = null;
        let filteredServiceIdResponse = null;

        if(toolId)
          filteredToolIdResponse = response.filter((record) => { return record.value.tool.id === toolId});
        if(serviceId) {
          filteredServiceIdResponse = this.checkServiceId(serviceId);
        }

        if(filteredServiceIdResponse && filteredToolIdResponse) {
          filteredResponse = filteredServiceIdResponse.filter((serviceRecord) => {
            return filteredToolIdResponse.some((toolRecord) => {
              return serviceRecord.id === toolRecord.value.id;
          });
          })
        }
        else if(filteredServiceIdResponse && !filteredToolIdResponse)
          filteredResponse = filteredServiceIdResponse;
        else {
          filteredResponse = filteredToolIdResponse?.map((toolRecord) => { return toolRecord.value });
        }

        filteredResponse
        ? this.eventBus.emit(channel, {
          data: response.map((filteredResponse) => filteredResponse.value),
          status: EventBusChannelStatus.SUCCESS,
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

  update(index: string, createDpoint: CreateDPoint): void {
    const channel = DPointsEventChannel.UPDATE_DPOINT_CHANNEL;

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

  delete(index: string): void {
    const channel = DPointsEventChannel.DELETE_DPOINT_CHANNEL;

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

  checkServiceId(serviceId: string): DPoint[] {
    let dpoints : DPoint[] = [];
    this.database.findOne("services", serviceId)
      .then((response) => {
        if (response) {
          dpoints = response.value.dpoints;
        } else {
          throw new FramrServiceError('Service not found');
        }
      })
      .catch((error) => {
        throw new FramrServiceError(error.message);
      });

      return dpoints!;
  }
}
