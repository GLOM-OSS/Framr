import { CreateRule } from '../../../../types';
import { FramrServiceError } from '../../../libs/errors';
import { EventBus, EventBusChannelStatus } from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { FramrDBSchema, RuleRecord } from '../../db/schema';
import { FilterOptions } from '../common/common.types';
import { RuleInterface, RulesEventChannel } from './RuleInterface';

export class RulesService implements RuleInterface {
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;
  private readonly STORE_NAME = 'rules';

  constructor() {
    this.database = IDBConnection.getDatabase();
    this.eventBus = new EventBus();
  }

  create(createRule: CreateRule): void {
    const channel = RulesEventChannel.CREATE_RULES_CHANNEL;
    const newRule: RuleRecord = {
      value: {
        id: crypto.randomUUID(),
        ...createRule,
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
    const channel = RulesEventChannel.FIND_ONE_RULES_CHANNEL;

    this.database
      .findOne(this.STORE_NAME, index)
      .then((response) => {
        if (!response) {
          throw new Error('Rule not found');
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
    const channel = RulesEventChannel.FIND_ALL_RULES_CHANNEL;
    this.database
      .findAll(this.STORE_NAME)
      .then((response) => {
        let rules = response.map((_) => _.value);
        if (filter?.dpointId) {
          rules = rules.filter((_) => _.concernedDpoint.id === filter.dpointId);
        }

        if (filter?.toolId) {
          rules = rules.filter((_) => _.tool.id === filter.toolId);
        }

        if (filter?.serviceId) {
          throw new Error('Rules cannot be filter by service id');
        }

        this.eventBus.emit(channel, {
          data: rules,
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

  update(index: string, createRule: CreateRule): void {
    const channel = RulesEventChannel.UPDATE_RULES_CHANNEL;

    this.database
      .update(this.STORE_NAME, index, createRule)
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
    const channel = RulesEventChannel.DELETE_RULES_CHANNEL;

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
