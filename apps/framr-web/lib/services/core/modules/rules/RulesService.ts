import { CreateRule } from 'apps/framr-web/lib/types';
import { FramrServiceError } from '../../../libs/errors';
import {
  EventBus,
  EventBusChannelStatus,
  EventBusPayload,
} from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { FramrDBSchema, RuleRecord } from '../../db/schema';
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

  findOne(index: number): void {
    const channel = RulesEventChannel.FIND_ONE_RULES_CHANNEL;

    this.database
      .findOne(this.STORE_NAME, index)
      .then((response) => {
        const payload: EventBusPayload<EventBusChannelStatus> = response
          ? { data: response.value, status: EventBusChannelStatus.SUCCESS }
          : {
              data: new FramrServiceError('Rule not found'),
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
    const channel = RulesEventChannel.FIND_ALL_RULES_CHANNEL;
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

  update(index: number, createRule: CreateRule): void {
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

  delete(index: number): void {
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
