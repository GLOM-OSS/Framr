import { CreateTool, MWDTool } from '../../../../types';
import { ToolEnum } from '../../../../types/enums';
import { FramrServiceError } from '../../../libs/errors';
import {
  EventBus,
  EventBusChannelStatus,
  EventBusPayload,
} from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { XmlIO } from '../../../libs/xml-io';
import { IDBConnection } from '../../db/IDBConnection';
import { FramrDBSchema, ToolRecord } from '../../db/schema';
import { ToolInterface, ToolsEventChannel } from './ToolInterface';
import { DataProcessor } from './data-processor/DataProcessor';

export class ToolsService implements ToolInterface {
  private readonly STORE_NAME = 'tools';

  private readonly xmlIO: XmlIO;
  private readonly dataProcessor: DataProcessor;
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;

  constructor() {
    this.xmlIO = new XmlIO();
    this.dataProcessor = new DataProcessor();
    this.eventBus = new EventBus();
    this.database = IDBConnection.getDatabase();
  }

  create(createTool: CreateTool): void {
    const channel = ToolsEventChannel.CREATE_TOOLS_CHANNEL;
    const newTool: ToolRecord = {
      value: {
        id: crypto.randomUUID(),
        ...(createTool.type === ToolEnum.MWD
          ? { ...(createTool as MWDTool), type: ToolEnum.MWD }
          : { ...createTool, type: ToolEnum.LWD }),
      },
    };

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

  findOne(index: string): void {
    const channel = ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL;

    this.database
      .findOne(this.STORE_NAME, index)
      .then((response) => {
        const payload: EventBusPayload<EventBusChannelStatus> = response
          ? { data: response.value, status: EventBusChannelStatus.SUCCESS }
          : {
              data: new FramrServiceError('Tool not found'),
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
    const channel = ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL;
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

  update(index: string, createTool: CreateTool): void {
    const channel = ToolsEventChannel.UPDATE_TOLLS_CHANNEL;

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

  delete(index: string): void {
    const channel = ToolsEventChannel.DELETE_TOLLS_CHANNEL;

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

  createFrom(file: File): void {
    const RULE_STORE = 'rules';
    const DPOINT_STORE = 'dpoints';
    const SERVICE_STORE = 'services';
    const channel = ToolsEventChannel.CREATE_FROM_TOOLS_CHANNEL;

    this.dataProcessor
      .processXMLData(file)
      .then(({ dpoints, rules, services, tools }) => {
        this.database
          .$transaction(
            [DPOINT_STORE, RULE_STORE, SERVICE_STORE, this.STORE_NAME],
            'readwrite',
            [
              // Insert tools
              (tx) =>
                Promise.all(
                  tools.map((tool) =>
                    this.database.insert(this.STORE_NAME, { value: tool }, tx)
                  )
                ),
              // Insert services
              (tx) =>
                Promise.all(
                  services.map((service) =>
                    this.database.insert(SERVICE_STORE, { value: service }, tx)
                  )
                ),
              // Insert data points
              (tx) =>
                Promise.all(
                  dpoints.map((dpoint) =>
                    this.database.insert(DPOINT_STORE, { value: dpoint }, tx)
                  )
                ),
              // Insert rules
              (tx) =>
                Promise.all(
                  rules.map((rule) =>
                    this.database.insert(RULE_STORE, { value: rule }, tx)
                  )
                ),
            ]
          )
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
      });
  }
}
