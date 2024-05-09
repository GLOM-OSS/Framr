import { StandAloneRuleEnum } from '../../../../types/enums';
import { CreateDPoint, DPoint } from '../../../../types';
import { FramrServiceError } from '../../../libs/errors';
import { EventBus, EventBusChannelStatus } from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { DPointRecord, FramrDBSchema } from '../../db/schema';
import { getRandomID } from '../common/common';
import { FilterOptions } from '../common/common.types';
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
        ...createDpoint,
        id: getRandomID(),
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
        if (!response) {
          throw new Error('Dpoint not found');
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

  findAll(filter?: FilterOptions): void {
    const channel = DPointsEventChannel.FIND_ALL_DPOINT_CHANNEL;
    this.database
      .findAll(this.STORE_NAME)
      .then(async (response) => {
        let dpoints = response.map((_) => _.value);

        if (filter?.serviceId) {
          dpoints = await this.findServiceDPoints(filter.serviceId);
        }

        if (filter?.toolId) {
          dpoints = dpoints.filter((_) => _.tool.id === filter?.toolId);
          if (filter?.mandatory) {
            const rules = await this.database.findAll('rules');
            dpoints = dpoints.filter(({ id }) =>
              rules.some(
                ({ value: rule }) =>
                  rule.concernedDpoint.id === id &&
                  rule.description === StandAloneRuleEnum.SHOULD_BE_PRESENT
              )
            );
          }
        }

        this.eventBus.emit(channel, {
          data: dpoints,
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

  private async findServiceDPoints(serviceId: string): Promise<DPoint[]> {
    const service = await this.database.findOne('services', serviceId);
    if (!service) throw new FramrServiceError('Service not found');
    return service?.value.dpoints;
  }
}
